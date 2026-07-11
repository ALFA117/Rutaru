import { CategoryPage } from "@/components/marketplace/category-page";

export default function HospedajePage({
  searchParams,
}: {
  searchParams: Promise<{ destino?: string; orden?: string }>;
}) {
  return (
    <CategoryPage
      tipo="hospedaje"
      titulo="Hospedaje"
      hrefFor={(slug) => `/hotel/${slug}`}
      searchParams={searchParams}
    />
  );
}
