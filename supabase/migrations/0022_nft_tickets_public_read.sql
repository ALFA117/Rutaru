-- Etapa 4 — los NFT-tickets ya son publicos por naturaleza (cualquiera
-- puede consultar tokenId/contrato en Etherscan); se necesita lectura
-- publica para /verificar/[tokenId] y para que el cliente vea sus propios
-- tickets en "mis viajes". Los INSERT/UPDATE/DELETE siguen restringidos
-- a admin (el minteo real lo hace el backend con el cliente admin, que
-- de todos modos ignora RLS).

create policy "nft_tickets_select_public" on public.nft_tickets
  for select to anon, authenticated
  using (true);
