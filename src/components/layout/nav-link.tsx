"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-full items-center border-b-2 transition-colors hover:text-foreground",
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-foreground/80"
      )}
    >
      {children}
    </Link>
  );
}
