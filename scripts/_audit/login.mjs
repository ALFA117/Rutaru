import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createServerClient } from "@supabase/ssr";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

export async function getCookiesFor(email, password = "demo1234") {
  const cookieJar = {};
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => Object.entries(cookieJar).map(([name, value]) => ({ name, value })),
        setAll: (arr) => arr.forEach(({ name, value }) => (cookieJar[name] = value)),
      },
    }
  );
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(`login ${email}: ${error.message}`);
  return Object.entries(cookieJar).map(([name, value]) => ({ name, value }));
}
