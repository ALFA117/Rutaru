import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}): Promise<Metadata> {
  const { destino } = await searchParams;
  return {
    title: destino ? `Experiencias en ${destino}` : "Experiencias",
    description: "Vivencias únicas fuera de lo común.",
  };
}

export default function ExperienciasPage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  return (
    <CategoryPage
      tipo="experiencia"
      titulo="Experiencias"
      searchParams={searchParams}
    />
  );
}
