const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

async function main() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require" });
  const invoices = await sql`SELECT id, "invoiceNumber", plan, amount, currency, status, "paymentLink", "txRef" FROM invoices LIMIT 50`;
  console.log("INVOICES COUNT:", invoices.length);
  invoices.forEach(inv => {
    console.log(`Invoice ${inv.invoiceNumber}: status=${inv.status}, paymentLink=${inv.paymentLink}`);
  });
  
  const subs = await sql`SELECT id, gateway, "subscriptionId", "planId", status FROM subscriptions LIMIT 50`;
  console.log("SUBSCRIPTIONS COUNT:", subs.length);
  subs.forEach(s => {
    console.log(`Sub ${s.id}: gateway=${s.gateway}, subId=${s.subscriptionId}`);
  });
  
  await sql.end();
}

main().catch(console.error);
