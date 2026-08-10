import { json, adminSession, parseBody, now } from "../../../_lib.js";

export async function onRequestPut({ request, env, params }) {
  // Check if admin is logged in via cookie
  const session = await adminSession(request, env);
  if (!session) {
    return json({ error: "Unauthorized - Please re-login" }, { status: 401 });
  }

  const p = await env.DB.prepare("SELECT * FROM products WHERE id=?").bind(params.id).first();
  if (!p) return json({ error: "Product not found" }, { status: 404 });

  const b = await parseBody(request);
  const c = Math.round(Number(b.price) * 100);

  if (!Number.isInteger(c) || c < 0) {
    return json({ error: "Invalid price" }, { status: 400 });
  }

  await env.DB.prepare(
    "UPDATE products SET name=?,price_cents=?,billing=?,icon=?,description=?,delivery_command=?,enabled=?,updated_at=? WHERE id=?"
  )
    .bind(
      String(b.name || p.name),
      c,
      b.billing === "monthly" ? "monthly" : "one-time",
      String(b.icon || ""),
      String(b.description || ""),
      String(b.delivery_command || ""),
      b.enabled ? 1 : 0,
      now(),
      params.id
    )
    .run();

  const x = await env.DB.prepare("SELECT * FROM products WHERE id=?").bind(params.id).first();
  return json({
    product: {
      ...x,
      price: x.price_cents / 100,
      perks: JSON.parse(x.perks_json || "[]"),
    },
  });
}
