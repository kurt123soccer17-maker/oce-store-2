# OCE Network Store v7 — Cloudflare Pages + D1

This build is designed for your existing Cloudflare Pages setup. It replaces the Node/SQLite backend with Pages Functions + D1.

## Deploy
1. Create a D1 database named `oce-store`.
2. Put its ID in `wrangler.toml`.
3. Run `npx wrangler d1 execute oce-store --remote --file=schema.sql` then `... --file=seed.sql`.
4. Add Pages Functions to your project by deploying through Git integration or Wrangler (Cloudflare does not support dashboard Direct Upload for Pages Functions).
5. Add secrets: ADMIN_PASSWORD, ADMIN_SESSION_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RCON_HOST, RCON_PORT, RCON_PASSWORD.
6. Add PUBLIC_BASE_URL as your store URL.
7. Configure Stripe webhook: POST /api/payments/stripe/webhook.

Do not put secrets in the repository.
