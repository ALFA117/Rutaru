import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aplanarDataset, filasToCsv } from "@/lib/data/data-packages-export";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") === "csv" ? "csv" : "json";

  const supabase = await createClient();
  const { data: paquete } = await supabase
    .from("data_packages")
    .select("titulo, preview, estado")
    .eq("id", id)
    .maybeSingle();

  if (!paquete || paquete.estado === "borrador") {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const filas = aplanarDataset(paquete.preview as never);
  const filename = paquete.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  if (format === "csv") {
    return new NextResponse(filasToCsv(filas), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  }

  return new NextResponse(JSON.stringify(filas, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.json"`,
    },
  });
}
