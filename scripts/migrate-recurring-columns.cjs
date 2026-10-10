const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.log("No connection string found");
  process.exit(1);
}

const sql = postgres(connectionString, {
  ssl: "require",
  prepare: false,
});

async function run() {
  console.log("Adding recurring billing columns to tenants...");
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "autoRenew" boolean DEFAULT false NOT NULL;`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "recurringAuthCode" text;`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "cardLast4" text;`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "cardBrand" text;`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "cardExpMonth" text;`;
  await sql`ALTER TABLE tenants ADD COLUMN IF NOT EXISTS "cardExpYear" text;`;

  console.log("Adding recurring billing columns to subscriptions...");
  await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "autoRenew" boolean DEFAULT false NOT NULL;`;
  await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "authCode" text;`;
  await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "cardLast4" text;`;
  await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "cardBrand" text;`;
  await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "cardExpMonth" text;`;
  await sql`ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS "cardExpYear" text;`;

  console.log("Creating analytics_events table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "analytics_events" (
      "id" text PRIMARY KEY,
      "tenantId" text NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
      "type" text NOT NULL,
      "visitorId" text,
      "device" text DEFAULT 'desktop',
      "referrer" text,
      "path" text DEFAULT '/',
      "createdAt" timestamp DEFAULT now() NOT NULL
    );
  `;
  await sql`CREATE INDEX IF NOT EXISTS "idx_analytics_tenant_created" ON "analytics_events" ("tenantId", "createdAt");`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_analytics_tenant_type" ON "analytics_events" ("tenantId", "type");`;

  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'tenants' 
      AND column_name IN ('autoRenew', 'recurringAuthCode', 'cardLast4', 'cardBrand');
  `;
  console.log("=== Verified Tenants Columns ===");
  console.log(JSON.stringify(cols, null, 2));

  await sql.end();
  console.log("SUCCESS: Recurring columns successfully added to Neon database.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
