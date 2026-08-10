CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, price_cents INTEGER NOT NULL, billing TEXT NOT NULL DEFAULT 'one-time',
  icon TEXT, description TEXT, perks_json TEXT NOT NULL DEFAULT '[]', delivery_command TEXT, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY, product_id TEXT NOT NULL, minecraft_username TEXT NOT NULL, amount_cents INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'aud',
  payment_provider TEXT NOT NULL, payment_id TEXT, payment_status TEXT NOT NULL, delivery_status TEXT NOT NULL DEFAULT 'pending', delivery_error TEXT,
  created_at TEXT NOT NULL, paid_at TEXT, delivered_at TEXT
);
CREATE TABLE IF NOT EXISTS webhook_events (provider TEXT NOT NULL, event_id TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(provider,event_id));
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(payment_status);
