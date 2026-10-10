const postgres = require("postgres");
require("dotenv").config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.log("No connection string found");
  process.exit(1);
}

const sql = postgres(connectionString);

async function run() {
  const allProjects = await sql`SELECT id, name, type, status, "tenantId", "publishedUrl", content FROM projects ORDER BY "updatedAt" DESC LIMIT 5`;
  const allTenants = await sql`SELECT id, name, slug, plan FROM tenants`;
  console.log("=== TENANTS ===");
  console.log(JSON.stringify(allTenants, null, 2));
  console.log("=== PROJECTS ===");
  console.log(JSON.stringify(allProjects, null, 2));
  await sql.end();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
