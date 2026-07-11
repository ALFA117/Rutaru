import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <p className="font-heading text-base text-foreground">
          {siteConfig.name} — {siteConfig.slogan}
        </p>
        <div className="flex flex-wrap gap-4">
          <span>{siteConfig.contact.email}</span>
          <span>{siteConfig.contact.instagram}</span>
        </div>
      </div>
    </footer>
  );
}
