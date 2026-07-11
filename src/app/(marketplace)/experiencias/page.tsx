import { CategoryPage } from "@/components/marketplace/category-page";

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
