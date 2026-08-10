import { json, adminSession } from "../../../_lib.js";
export async function onRequestGet({ request, env }) {
  if (!(await adminSession(request, env))) {
    return json({ error: "Not authenticated" }, { status: 401 });
  }
  const r = await env.DB.prepare("SELECT * FROM products ORDER BY rowid").all();
  return json({
    products: (r.results || []).map((p) => ({
      ...p,
      price: p.price_cents / 100,
      perks: JSON.parse(p.perks_json || "[]"),
    })),
  });
}
