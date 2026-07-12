export const PAGES = [
  // Publicas / marketplace
  { url: "/", label: "home" },
  { url: "/rutas", label: "rutas-listado" },
  { url: "/hospedaje", label: "hospedaje-listado" },
  { url: "/traslados", label: "traslados-listado" },
  { url: "/eventos", label: "eventos-listado" },
  { url: "/experiencias", label: "experiencias-listado" },
  { url: "/paquetes", label: "paquetes-listado" },
  { url: "/articulos", label: "articulos-listado" },
  { url: "/articulos/por-que-cantona-tiene-27-juegos-de-pelota", label: "articulo-detalle" },
  { url: "/ruta/reino-de-las-nubes", label: "ruta-detalle" },
  { url: "/hotel/casa-oaxaca-centro", label: "hospedaje-detalle" },
  { url: "/traslado/privado-aicm-centro", label: "traslado-detalle" },
  { url: "/evento/capital-fest-2026", label: "evento-detalle" },
  { url: "/experiencia/clase-cocina-oaxaquena", label: "experiencia-detalle" },
  { url: "/paquete/oaxaca-todo-incluido-60d4e7a9", label: "paquete-detalle" },
  { url: "/operador/rutaru-tours", label: "operador-perfil-publico" },
  { url: "/buscar?q=oaxaca", label: "buscar" },
  { url: "/datos", label: "data-marketplace-publico" },
  { url: "/guia-de-pruebas", label: "guia-de-pruebas" },
  { url: "/roadmap", label: "roadmap" },
  { url: "/login", label: "login" },
  { url: "/registro", label: "registro" },
  { url: "/verificar/2", label: "verificar-nft" },

  // Autenticadas como cliente
  { url: "/carrito", label: "carrito", role: "cliente@rutaru.demo" },
  { url: "/checkout", label: "checkout", role: "cliente@rutaru.demo" },
  {
    url: "/checkout/confirmacion/2caa5d91-365a-4612-a0dd-15ff2478c3f1",
    label: "checkout-confirmacion",
    role: "cliente@rutaru.demo",
  },
  { url: "/cliente", label: "dashboard-cliente", role: "cliente@rutaru.demo" },

  // Dashboards por rol
  { url: "/admin", label: "dashboard-admin", role: "admin@rutaru.demo" },
  { url: "/admin?rango=7", label: "dashboard-admin-7d", role: "admin@rutaru.demo" },
  { url: "/admin/datos", label: "admin-datos", role: "admin@rutaru.demo" },
  { url: "/admin/datos/nuevo", label: "admin-datos-nuevo", role: "admin@rutaru.demo" },

  { url: "/agencia", label: "dashboard-agencia", role: "agencia@rutaru.demo" },
  { url: "/agencia/catalogo", label: "agencia-catalogo", role: "agencia@rutaru.demo" },
  {
    url: "/agencia/comprar?listingId=fa74daae-6926-4763-b9a5-e1569792ebb7",
    label: "agencia-comprar",
    role: "agencia@rutaru.demo",
  },
  { url: "/agencia/paquetes/nuevo", label: "agencia-paquetes-nuevo", role: "agencia@rutaru.demo" },
  {
    url: "/agencia/ordenes/a4b6bc70-edba-4133-ad24-b59a8e60068c",
    label: "agencia-orden-b2b",
    role: "agencia@rutaru.demo",
  },

  { url: "/operador", label: "dashboard-operador", role: "operador@rutaru.demo" },
  { url: "/afiliado", label: "dashboard-afiliado", role: "afiliado@rutaru.demo" },
];

export const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 375, height: 812 },
];
