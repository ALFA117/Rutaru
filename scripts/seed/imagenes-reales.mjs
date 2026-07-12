// Fotos reales por listing (ronda de pulido pre-pitch): las 8 rutas usan la
// foto real de rutaru.com (verificada 200) + 2 de relleno tematico de
// Unsplash para la galeria; el resto usa Unsplash curado por tema de
// producto (verificado 200 con curl antes de commitear, ver AUDITORIA.md).
// Todas las URLs usan el formato images.unsplash.com/photo-ID sin
// query string -- los componentes le agregan sus propios parametros de
// tamano via next/image.

const UNSPLASH = (id) => `https://images.unsplash.com/photo-${id}`;

const CABIN = [
  "1606596357591-ae7869d55378",
  "1653956323533-6ea5d2ccce18",
  "1626884258692-95f1b5302f67",
  "1773337975050-06b13263c440",
].map(UNSPLASH);

const COLONIAL = [
  "1690130206583-3ad3f9515b82",
  "1590893826752-4d371ba33590",
  "1673909050664-71e930c95b18",
].map(UNSPLASH);

const LOFT = [
  "1505873242700-f289a29e1e0f",
  "1625707695772-5dd6c1f9c107",
  "1543589365-3cc63c87243f",
  "1536376072261-38c75010e6c9",
  "1750764515068-80d222d974bb",
].map(UNSPLASH);

const VILLA = [
  "1691849233457-837d8e2f9da3",
  "1771533679963-d33e80142d9f",
  "1771533679964-fea586f5911e",
  "1771636001068-e90df5c47b93",
].map(UNSPLASH);

const HACIENDA = ["1763548583074-66eb1c0da9ae", "1687579520634-316424a555d4"].map(UNSPLASH);

const VAN = [
  "1495150434753-f8ceb319e9dc",
  "1769000480434-94113189f154",
  "1647206826104-6df8ef5fc59f",
  "1621120219014-058fa0e4f6fd",
  "1759681878502-f8c23822b85d",
  "1612150138270-8772fbcbe61d",
].map(UNSPLASH);

const CONCIERTO = [
  "1459749411175-04bf5292ceea",
  "1533174072545-7a4b6ad7a6c3",
  "1470229722913-7c0e2dbbafd3",
  "1563841930606-67e2bce48b78",
  "1514525253161-7a46d19cd819",
  "1565035010268-a3816f98589a",
].map(UNSPLASH);

const MUSEO = ["1564399579883-451a5d44ec08", "1641290091305-70283afc4e88"].map(UNSPLASH);
const GLOBOS = ["1507608869274-d3177c8bb4c7", "1507608616759-54f48f0af0ee"].map(UNSPLASH);
const MEZCAL = [
  "1666453394237-0276c0974994",
  "1681168704457-b5d3a44270e6",
  "1681168703486-77d703b31a2d",
].map(UNSPLASH);
const COCINA = ["1584208632661-f8db31bb6489", "1584208632856-d2af6180f492"].map(UNSPLASH);
const ESTRELLAS = ["1604728890708-631078e3eab7", "1717228359912-e2f6401df18f"].map(UNSPLASH);
const RAPEL = ["1761171489365-b2dee2b18cde", "1758172797466-7fe6fef9aa51"].map(UNSPLASH);
const TELAR = ["1707978932202-751b08324daf", "1643766883805-829d9ad95c42"].map(UNSPLASH);

const PAISAJE_MX = [
  "1722110267720-d84520366e5f",
  "1593630104743-d0cc56fb8f03",
  "1609963460650-2e846224a30a",
  "1602866993483-d73d129da472",
  "1634052809294-894cd5493d95",
  "1656391210721-b6596f2d4f4b",
  "1634052809991-0baf8f9e6b6f",
  "1630340191361-29c350ebb401",
].map(UNSPLASH);

// Rutas: foto real de rutaru.com primero, luego 2 de paisaje de relleno.
const RUTAS_REALES = {
  cantona: "https://www.rutaru.com/wp-content/uploads/2026/03/Cantona-MX-600x450.jpeg",
  cornish: "https://www.rutaru.com/wp-content/uploads/2026/03/real-del-monte-hidalgo-600x450.jpg",
  "legado-del-guerrero":
    "https://www.rutaru.com/wp-content/uploads/2026/03/terrazas-de-milpa-alta-600x450.webp",
  "reino-de-las-nubes":
    "https://www.rutaru.com/wp-content/uploads/2026/03/ccotomi-600x450.jpg",
  "la-merced":
    "https://www.rutaru.com/wp-content/uploads/2026/03/iglesia-de-la-humanidad-600x450.webp",
  "polvo-y-eternidad":
    "https://www.rutaru.com/wp-content/uploads/2026/04/expedicion-autor-rutaru-tehuacan-zapotitlan-600x450.jpeg",
  sincretismo:
    "https://www.rutaru.com/wp-content/uploads/2026/03/bizantina-en-cdmx-Grande-e1773134022299-600x450.jpeg",
  tlatlauquitepec:
    "https://www.rutaru.com/wp-content/uploads/2026/04/670279987_17921737446335686_3420209053114765204_n-e1776222216872-600x450.jpg",
};

export const IMAGENES_POR_SLUG = {
  // Rutas -- real + 2 de relleno (rotando por indice para variar).
  ...Object.fromEntries(
    Object.entries(RUTAS_REALES).map(([slug, real], i) => [
      slug,
      [real, PAISAJE_MX[i % PAISAJE_MX.length], PAISAJE_MX[(i + 1) % PAISAJE_MX.length]],
    ])
  ),

  // Hospedaje
  "cabana-cholula": [CABIN[0], CABIN[1]],
  "cabana-huasca": [CABIN[1], CABIN[2]],
  "cabana-hierve-el-agua": [CABIN[2], CABIN[3]],
  "cabana-bacalar-laguna": [CABIN[3], VILLA[0]],
  "casa-oaxaca-centro": [COLONIAL[0], COLONIAL[1]],
  "casona-puebla-centro": [COLONIAL[1], COLONIAL[2]],
  "casa-mineral-del-chico": [HACIENDA[0], CABIN[0]],
  "hacienda-real-del-monte": [HACIENDA[1], HACIENDA[0]],
  "casa-condesa-jardin": [LOFT[0], LOFT[1]],
  "estudio-polanco": [LOFT[1], LOFT[2]],
  "loft-roma-norte": [LOFT[2], LOFT[3]],
  "loft-angelopolis": [LOFT[3], LOFT[4]],
  "suite-mezcal-oaxaca": [LOFT[4], MEZCAL[0]],
  "depa-playa-carmen": [VILLA[1], VILLA[2]],
  "villa-tulum-selva": [VILLA[2], VILLA[3]],

  // Traslados (todos comparten el mismo pool tematico de vans/aeropuerto)
  "club-shared-aifa": [VAN[0], VAN[1]],
  "shuttle-aifa-roma-condesa": [VAN[1], VAN[2]],
  "shuttle-nocturno-aifa": [VAN[2], VAN[3]],
  "compartido-aicm-polanco": [VAN[3], VAN[4]],
  "compartido-cdmx-puebla": [VAN[4], VAN[5]],
  "ejecutivo-privado-aicm": [VAN[5], VAN[0]],
  "privado-aicm-centro": [VAN[0], VAN[2]],
  "privado-aicm-coyoacan": [VAN[1], VAN[3]],
  "privado-aifa-santa-fe": [VAN[2], VAN[4]],
  "privado-puebla-cdmx": [VAN[3], VAN[5]],

  // Eventos
  "capital-fest-2026": [CONCIERTO[0], CONCIERTO[1]],
  "concierto-teotihuacan": [CONCIERTO[1], CONCIERTO[2]],
  "feria-san-marcos-ficticia": [CONCIERTO[2], CONCIERTO[3]],
  "festival-cultural-cholula": [CONCIERTO[3], CONCIERTO[4]],
  "festival-mezcal-oaxaca": [MEZCAL[1], MEZCAL[2]],
  "festival-gastronomico-oaxaca": [COCINA[0], COCINA[1]],
  "festival-globos-ficticio": [GLOBOS[0], GLOBOS[1]],
  "noche-de-museos-cdmx": [MUSEO[0], MUSEO[1]],

  // Experiencias
  "avistamiento-estrellas-cantona": [ESTRELLAS[0], ESTRELLAS[1]],
  "clase-cocina-oaxaquena": [COCINA[1], COCINA[0]],
  "rapel-barrancas-huasca": [RAPEL[0], RAPEL[1]],
  "taller-mezcal-oaxaca": [MEZCAL[2], MEZCAL[0]],
  "taller-textil-otomi-temoaya": [TELAR[0], TELAR[1]],
};
