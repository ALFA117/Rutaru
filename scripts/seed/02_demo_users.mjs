import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEMO_PASSWORD = "demo1234";

const DEMO_USERS = [
  { role: "operador", email: "operador@rutaru.demo", nombre: "Operador Demo" },
  { role: "agencia", email: "agencia@rutaru.demo", nombre: "Agencia Demo" },
  { role: "admin", email: "admin@rutaru.demo", nombre: "Admin Demo" },
  { role: "afiliado", email: "afiliado@rutaru.demo", nombre: "Afiliado Demo" },
  { role: "cliente", email: "cliente@rutaru.demo", nombre: "Cliente Demo" },
];

for (const u of DEMO_USERS) {
  process.stdout.write(`-> ${u.email} (${u.role}) ... `);

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", u.email)
    .maybeSingle();

  if (existing) {
    console.log("ya existe, se omite");
    continue;
  }

  const { error } = await admin.auth.admin.createUser({
    email: u.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { role: u.role, nombre: u.nombre },
  });

  if (error) {
    console.log("ERROR");
    console.error(error.message);
    process.exit(1);
  }

  console.log("creado");
}

console.log("Usuarios demo listos. Password para los 5:", DEMO_PASSWORD);
