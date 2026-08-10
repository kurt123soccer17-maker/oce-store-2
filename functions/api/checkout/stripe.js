import { json, parseBody, validPlayer, orderId, now } from "../../_lib.js";

export async function onRequestPost({ request, env }) {
  const b = await parseBody(request);
  const username = String(b.minecraftUsername || "");
  const productId = String(b.productId || "");
  // Default to 'paypal' if no provider is passed, or use 'stripe' if requested
  const provider = String(b.paymentProvider || "paypal").toLowerCase(); 

  if (!validPlayer(username)) {
    return json({ error: "Enter a valid Minecraft username." }, { status: 400 });
  }

  const p = await env.DB.prepare("SELECT * FROM products WHERE id=? AND enabled=1").bind(productId).first();
  if (!p) return json({ error: "Product unavailable" }, { status: 404 });

  const id = orderId();
  const t = now();

  // ----------------------------------------------------
  // 1. PAYPAL CHECKOUT FLOW
  // ----------------------------------------------------
  if (provider === "paypal") {
    if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
      return json({ error: "PayPal is not configured yet." }, { status: 503 });
    }

    // Insert pending order
    await env.DB.prepare(
      "INSERT INTO orders (id,product_id,minecraft_username,amount_cents,currency,payment_provider,payment_status,delivery_status,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(id, p.id, username, p.price_cents, "aud", "paypal", "pending", "pending", t).run();

    // Get OAuth Access Token from PayPal API
    const auth = btoa(`${env.PAYPAL_CLIENT_SECRET.trim()}`);
    
    // Choose base URL based on environment (use api-m.sandbox.paypal.com for testing if needed)
    const paypalBase = env.PAYPAL_ENV === "sandbox" 
      ? "https://api-m.sandbox.paypal.com" 
      : "https://api-m.paypal.com";

    const tokenRes = await fetch(`${paypalBase}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      await env.DB.prepare("UPDATE orders SET payment_status='failed',delivery_error=? WHERE id=?")
        .bind(tokenData.error_description || "PayPal Auth Failed", id).run();
      return json({ error: "Could not authenticate with PayPal." }, { status: 502 });
    }

    // Create PayPal Order
    const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
    const orderRes = await fetch(`${paypalBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: id,
            amount: {
              currency_code: "AUD",
              value: (p.price_cents / 100).toFixed(2),
            },
            description: `${p.name} — Unstable FFA OCE`,
            custom_id: JSON.stringify({ order_id: id, minecraft_username: username, product_id: p.id }),
          },
        ],
        application_context: {
          return_url: `${baseUrl}/success.html?order=${id}`,
          cancel_url: `${baseUrl}/?cancelled=1`,
        },
      }),
    });

    const paypalOrder = await orderRes.json();
    if (!orderRes.ok) {
      await env.DB.prepare("UPDATE orders SET payment_status='failed',delivery_error=? WHERE id=?")
        .bind(paypalOrder.message || "PayPal Order Error", id).run();
      return json({ error: "Could not start PayPal checkout." }, { status: 502 });
    }

    const approveLink = paypalOrder.links?.find((l) => l.rel === "approve")?.href;
    await env.DB.prepare("UPDATE orders SET payment_id=? WHERE id=?").bind(paypalOrder.id, id).run();

    return json({ url: approveLink, orderId: id });
  }

  // ----------------------------------------------------
  // 2. STRIPE CHECKOUT FLOW
  // ----------------------------------------------------
  if (provider === "stripe") {
    if (!env.STRIPE_SECRET_KEY) return json({ error: "Stripe is not configured yet." }, { status: 503 });

    await env.DB.prepare(
      "INSERT INTO orders (id,product_id,minecraft_username,amount_cents,currency,payment_provider,payment_status,delivery_status,created_at) VALUES (?,?,?,?,?,?,?,?,?)"
    ).bind(id, p.id, username, p.price_cents, "aud", "stripe", "pending", "pending", t).run();

    const baseUrl = env.PUBLIC_BASE_URL || new URL(request.url).origin;
    const params = new URLSearchParams();
    params.set("mode", p.billing === "monthly" ? "subscription" : "payment");
    params.set("success_url", `${baseUrl}/success.html?order=${id}`);
    params.set("cancel_url", `${baseUrl}/?cancelled=1`);
    params.set("customer_creation", "always");
    params.set("line_items[0][quantity]", "1");
    params.set("line_items[0][price_data][currency]", "aud");
    params.set("line_items[0][price_data][unit_amount]", String(p.price_cents));
    params.set("line_items[0][price_data][product_data][name]", `${p.name} — Unstable FFA OCE`);
    params.set("metadata[order_id]", id);
    params.set("metadata[minecraft_username]", username);
    params.set("metadata[product_id]", p.id);

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        "content-type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const d = await r.json();
    if (!r.ok) {
      await env.DB.prepare("UPDATE orders SET payment_status='failed',delivery_error=? WHERE id=?")
        .bind(d.error?.message || "Stripe error", id).run();
      return json({ error: "Could not start Stripe checkout." }, { status: 502 });
    }

    await env.DB.prepare("UPDATE orders SET payment_id=? WHERE id=?").bind(d.id, id).run();
    return json({ url: d.url, orderId: id });
  }

  return json({ error: "Invalid payment provider specified." }, { status: 400 });
}
