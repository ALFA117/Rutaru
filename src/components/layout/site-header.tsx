import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME } from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import { CATEGORIAS } from "@/lib/data/categorias";
import { BLOCKCHAIN_ENABLED } from "@/config/flags";
import { ConnectWalletButton } from "@/components/blockchain/connect-wallet-button";
import { CategoryMarquee } from "@/components/layout/category-marquee";
import { NavLink } from "@/components/layout/nav-link";

const MARQUEE_ITEMS = [...CATEGORIAS, { titulo: "Artículos", href: "/articulos" }];

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

        <nav className="hidden h-full shrink-0 items-center gap-5 self-stretch text-sm lg:flex">
          {CATEGORIAS.slice(0, 5).map((c) => (
            <NavLink key={c.href} href={c.href}>
              {c.titulo}
            </NavLink>
          ))}
          <NavLink href="/articulos">Artículos</NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {BLOCKCHAIN_ENABLED && <ConnectWalletButton />}
          <Button asChild size="sm" className="min-h-11">
            <Link href={accountHref}>{user ? "Mi cuenta" : "Iniciar sesión"}</Link>
          </Button>
        </div>
      </div>

      <CategoryMarquee items={MARQUEE_ITEMS} />
    </header>
  );
}
