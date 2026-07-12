import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}): Promise<Metadata> {
  const { destino } = await searchParams;
  return {
    title: destino ? `Rutas y Tours en ${destino}` : "Rutas y Tours",
    description: "Rutas de autor, 1 día o varios.",
  };
}

export default function RutasPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  return (
    <CategoryPage
      tipo="ruta"
      titulo="Rutas y Tours"
      hrefFor={(slug) => `/ruta/${slug}`}
      searchParams={searchParams}
    />
  );
}
