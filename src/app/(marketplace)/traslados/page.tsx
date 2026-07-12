import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}): Promise<Metadata> {
  const { destino } = await searchParams;
  return {
    title: destino ? `Traslados y Movilidad en ${destino}` : "Traslados y Movilidad",
    description: "AIFA, AICM, privados y compartidos.",
  };
}

export default function TrasladosPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  return (
    <CategoryPage
      tipo="traslado"
      titulo="Traslados y Movilidad"
      searchParams={searchParams}
    />
  );
}
