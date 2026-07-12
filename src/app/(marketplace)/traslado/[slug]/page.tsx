import { notFound } from "next/navigation";
import {
  getListingBySlug,
  getDisponibilidad,
  getResenas,
} from "@/lib/data/listings";
import { ListingDetail } from "@/components/marketplace/listing-detail";

export default async function TrasladoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || listing.tipo !== "traslado") notFound();

  const [disponibilidad, resenas] = await Promise.all([
    getDisponibilidad(listing.id),
    getResenas(listing.id),
  ]);

  return (
    <ListingDetail
      listing={listing}
      disponibilidad={disponibilidad}
      resenas={resenas}
    />
  );
}
