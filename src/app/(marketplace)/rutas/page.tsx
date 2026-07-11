import { CategoryPage } from "@/components/marketplace/category-page";

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
