import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}): Promise<Metadata> {
  const { destino } = await searchParams;
  return {
    title: destino ? `Eventos y Boletaje en ${destino}` : "Eventos y Boletaje",
    description: "Festivales, ferias y conciertos.",
  };
}

export default function EventosPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  return (
    <CategoryPage
      tipo="evento"
      titulo="Eventos y Boletaje"
      hrefFor={(slug) => `/evento/${slug}`}
      searchParams={searchParams}
    />
  );
}
