
import { json, adminSession, csrfOk, parseBody, now } from "../../../_lib.js";

async function auth(c) {
  const s = await adminSession(c.request, c.env);
  return s && csrfOk(c.request, s) ? s : null;
}

export async function onRequestGet({ request, env, params }) {
  if (!(await adminSession(request, env))) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  const r = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(params.id).first();
  if (!r) return json({ error: "Product not found" }, { status: 404 });
  return json({
    product: {
      ...r,
      price: r.price_cents / 100,
      perks: JSON.parse(r.perks_json || "[]"),
    },
  });
}

export async function onRequestPut({ request, env, params }) {
  if (!(await auth({ request, env }))) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const p = await env.DB.prepare("SELECT * FROM products WHERE id=?").bind(params.id).first();
  if (!p) return json({ error: "Product not found" }, { status: 404 });

  const b = await parseBody(request);
  const c = Math.round(Number(b.price) * 100);

  if (!Number.isInteger(c) || c < 0) {
    return json({ error: "Invalid price" }, { status: 400 });
  }

  await env.DB.prepare(
    "UPDATE products SET name=?,price_cents=?,billing=?,icon=?,description=?,perks_json=?,delivery_command=?,enabled=?,updated_at=? WHERE id=?"
  )
    .bind(
      String(b.name || p.name),
      c,
      b.billing === "monthly" ? "monthly" : "one-time",
      String(b.icon || ""),
      String(b.description || ""),
      JSON.stringify(Array.isArray(b.perks) ? b.perks : JSON.parse(p.perks_json || "[]")),
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
