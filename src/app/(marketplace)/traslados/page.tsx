import { CategoryPage } from "@/components/marketplace/category-page";

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
