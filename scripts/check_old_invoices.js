const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  const rows = await sql`SELECT i."invoiceNumber", i.status, i."paymentLink", i."tenantId", i."userId", u.email, u.name, t.name as tenant_name, t.slug as tenant_slug 
    FROM invoices i 
    LEFT JOIN users u ON i."userId" = u.id 
    LEFT JOIN tenants t ON i."tenantId" = t.id 
    WHERE i."paymentLink" ILIKE '%paystack%' OR i."paymentLink" ILIKE '%flutterwave%'`;
  console.log("OLD INVOICES WITH PAYSTACK/FLUTTERWAVE:", JSON.stringify(rows, null, 2));
  await sql.end();
}

main().catch(console.error);
