import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { Client } from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });
const migrationsDir = join(__dirname, "..", "..", "supabase", "migrations");

const client = new Client({
  host: process.env.SUPABASE_DB_HOST,
  port: Number(process.env.SUPABASE_DB_PORT || 5432),
  user: process.env.SUPABASE_DB_USER,
  password: process.env.SUPABASE_DB_PASSWORD,
  database: process.env.SUPABASE_DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false },
});

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

await client.connect();
console.log(`Conectado. Aplicando ${files.length} migraciones...`);

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  process.stdout.write(`-> ${file} ... `);
  try {
    await client.query(sql);
    console.log("OK");
  } catch (err) {
    console.log("ERROR");
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("Todas las migraciones aplicadas.");
