import { CategoryPage } from "@/components/marketplace/category-page";

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
