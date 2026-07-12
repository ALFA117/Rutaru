// Supabase impone un tope de filas por respuesta a nivel de proyecto
// (Settings > API > Max Rows, default 1000) que .limit() del lado del
// cliente NO puede pasar -- solo lo hace mas chico. Para tablas que ya
// superan ese tope (events_tracking) hay que paginar con .range().
export async function fetchAllRows<T>(
  buildQuery: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
  pageSize = 1000
): Promise<T[]> {
  const filas: T[] = [];
  let desde = 0;
  while (true) {
    const { data, error } = await buildQuery(desde, desde + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    filas.push(...data);
    if (data.length < pageSize) break;
    desde += pageSize;
  }
  return filas;
}
