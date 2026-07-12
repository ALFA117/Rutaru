import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getListingBySlug,
  getDisponibilidad,
  getResenas,
} from "@/lib/data/listings";
import { ListingDetail } from "@/components/marketplace/listing-detail";
import { extracto } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || listing.tipo !== "traslado") return {};
  return {
    title: listing.titulo,
    description: extracto(listing.descripcion),
  };
}

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
