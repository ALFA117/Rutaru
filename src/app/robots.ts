import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Ojo: /operador (dashboard, sin slug) es privado, pero /operador/[slug]
      // (perfil publico del operador) si debe indexarse -- no usar /operador/*.
      disallow: [
        "/admin",
        "/admin/*",
        "/agencia",
        "/agencia/*",
        "/operador$",
        "/afiliado",
        "/cliente",
        "/carrito",
        "/checkout",
        "/checkout/*",
        "/api/*",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
