import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { CATEGORIAS } from "@/lib/data/categorias";
import { BLOCKCHAIN_ENABLED } from "@/config/flags";
import { ConnectWalletButton } from "@/components/blockchain/connect-wallet-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let accountHref = "/login";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    accountHref = profile ? ROLE_HOME[profile.role] : "/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-heading text-xl font-semibold tracking-tight">
          Rutaru
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          {CATEGORIAS.slice(0, 5).map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="text-foreground/80 transition-colors hover:text-foreground"
            >
              {c.titulo}
            </Link>
          ))}
          <Link
            href="/articulos"
            className="text-foreground/80 transition-colors hover:text-foreground"
          >
            Artículos
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {BLOCKCHAIN_ENABLED && <ConnectWalletButton />}
          <Button asChild size="sm">
            <Link href={accountHref}>{user ? "Mi cuenta" : "Iniciar sesión"}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
