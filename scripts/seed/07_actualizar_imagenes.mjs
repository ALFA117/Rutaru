import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { IMAGENES_POR_SLUG } from "./imagenes-reales.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let ok = 0;
let faltantes = [];
for (const [slug, imagenes] of Object.entries(IMAGENES_POR_SLUG)) {
  const { error, count } = await admin
    .from("listings")
    .update({ imagenes }, { count: "exact" })
    .eq("slug", slug);
  if (error) {
    console.error(`ERROR ${slug}: ${error.message}`);
  } else if (count === 0) {
    faltantes.push(slug);
  } else {
    ok++;
  }
}
console.log(`Actualizados: ${ok}/${Object.keys(IMAGENES_POR_SLUG).length}`);
if (faltantes.length) console.log("Slugs no encontrados en listings:", faltantes);
