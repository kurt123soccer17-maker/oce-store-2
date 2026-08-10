# OCE v7 Cloudflare setup

## 1. Create D1
In Cloudflare dashboard: Workers & Pages -> D1 -> Create database -> `oce-store`. Or CLI: `npx wrangler d1 create oce-store`.
Copy the database ID into `wrangler.toml`.

## 2. Initialize
`npx wrangler d1 execute oce-store --remote --file=schema.sql`
`npx wrangler d1 execute oce-store --remote --file=seed.sql`

## 3. Bind D1
The Pages Function binding is named `DB`. Cloudflare Pages supports D1 bindings through Settings -> Functions -> Bindings. Redeploy after adding/changing a binding.

## 4. Secrets
Add these as encrypted secrets in your Pages project / Wrangler:
- ADMIN_PASSWORD: your admin password
- ADMIN_SESSION_SECRET: random 32+ character secret
- STRIPE_SECRET_KEY: Stripe test key first (`sk_test_...`)
- STRIPE_WEBHOOK_SECRET: Stripe webhook signing secret (`whsec_...`)
- PUBLIC_BASE_URL: your store URL
- RCON_HOST: public hostname/IP of your Minecraft RCON endpoint
- RCON_PORT: usually 25575, if that is what your server uses
- RCON_PASSWORD: your RCON password

## 5. Stripe
Create a webhook endpoint at `https://YOUR-DOMAIN/api/payments/stripe/webhook` and subscribe to `checkout.session.completed`. Use test mode first.

## 6. RCON
RCON must be reachable from Cloudflare Workers. Do not expose RCON unnecessarily; use a firewall/IP policy or Cloudflare private networking where appropriate. Workers now support outbound TCP sockets.

## 7. Products
The ranks are seeded as King A$6, God A$12, Immortal Demon A$18. Crate/item products are disabled until you enter real delivery commands in Admin.

## 8. Deployment
Because this project contains Pages Functions, use Git integration or Wrangler rather than dashboard Direct Upload.

Recommended first test: Stripe test payment -> webhook -> order marked paid -> RCON delivery -> Minecraft player receives the rank/token.
