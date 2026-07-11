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

// Registro simple de migraciones aplicadas para que este script sea
// incremental (sin Docker no hay `supabase migration list`/history propia).
await client.query(`
  create table if not exists public._migrations_applied (
    filename text primary key,
    applied_at timestamptz not null default now()
  );
`);

const { rows } = await client.query(
  "select filename from public._migrations_applied"
);
const applied = new Set(rows.map((r) => r.filename));

const pending = files.filter((f) => !applied.has(f));
console.log(
  `Conectado. ${files.length} migraciones totales, ${pending.length} pendientes.`
);

for (const file of pending) {
  const sql = readFileSync(join(migrationsDir, file), "utf8");
  process.stdout.write(`-> ${file} ... `);
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query(
      "insert into public._migrations_applied (filename) values ($1)",
      [file]
    );
    await client.query("commit");
    console.log("OK");
  } catch (err) {
    await client.query("rollback");
    console.log("ERROR");
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("Migraciones al día.");
