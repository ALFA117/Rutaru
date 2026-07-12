import type { Metadata } from "next";
import { CategoryPage } from "@/components/marketplace/category-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string }>;
}): Promise<Metadata> {
  const { destino } = await searchParams;
  return {
    title: destino ? `Hospedaje en ${destino}` : "Hospedaje",
    description: "Estancias estilo Airbnb en todo México.",
  };
}

export default function HospedajePage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  return (
    <CategoryPage
      tipo="hospedaje"
      titulo="Hospedaje"
      searchParams={searchParams}
    />
  );
}
