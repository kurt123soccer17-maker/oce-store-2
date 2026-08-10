import { json } from "../_lib.js";

export async function onRequestGet({ env }) {
  const stripeEnabled = Boolean(env.STRIPE_SECRET_KEY);
  const paypalEnabled = Boolean(env.PAYPAL_CLIENT_ID && env.PAYPAL_CLIENT_SECRET);

  return json({
    stripe: stripeEnabled,
    paypal: paypalEnabled,
  });
}
