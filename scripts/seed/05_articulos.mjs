import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, "..", "..", ".env.local") });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function img(seed) {
  return `https://picsum.photos/seed/articulo-${seed}/1200/900`;
}

const ARTICULOS = [
  {
    slug: "por-que-cantona-tiene-27-juegos-de-pelota",
    titulo: "Por qué Cantona tiene 27 juegos de pelota",
    categoria: "Historia",
    listingSlug: "cantona",
    extracto:
      "Ningún otro sitio mesoamericano concentra tantos juegos de pelota. La respuesta tiene que ver con comercio, no solo con ritual.",
    contenido:
      "Cantona no se parece a ningún otro sitio arqueológico de México. Construida casi por completo sobre roca volcánica, sin las plazas abiertas típicas de otras ciudades prehispánicas, su trazado está hecho de calzadas estrechas que conectan más de tres mil estructuras.\n\nEntre ellas hay 27 juegos de pelota — más que cualquier otro asentamiento mesoamericano conocido. La explicación más aceptada no es únicamente ritual: Cantona controlaba rutas comerciales clave, y el juego de pelota funcionaba también como espacio de negociación política entre distintos barrios y grupos comerciales que convivían en la ciudad.\n\nCaminar hoy por sus calzadas de lava, sin líneas rectas ni orientación evidente, es la mejor forma de entender por qué la ciudad se organizaba así: el terreno volcánico no perdonaba trazados ideales, y cada juego de pelota marcaba territorio de un barrio distinto.",
    imagenSeed: "cantona",
  },
  {
    slug: "guia-del-mezcal-en-oaxaca",
    titulo: "Guía del mezcal en Oaxaca",
    categoria: "Gastronomía",
    listingSlug: "taller-mezcal-oaxaca",
    extracto:
      "Espadín, tobalá, madrecuixe: una introducción honesta al mezcal para quien apenas empieza a distinguir un agave de otro.",
    contenido:
      "El mezcal no es un licor, es una familia entera de destilados de agave, y Oaxaca concentra la mayor diversidad de magueyes usados para producirlo. El espadín es el más cultivado y el punto de entrada obvio: suave, vegetal, fácil de tomar solo.\n\nEl tobalá, en cambio, es silvestre — tarda hasta 15 años en madurar y su sabor es más floral, más complejo. El madrecuixe aporta notas terrosas y minerales, más cercanas a lo que algunos catadores describen como 'sabor a piedra caliente'.\n\nLa forma correcta de probarlo no es de un trago: se sorbe, se deja respirar en la boca, y se acompaña con sal de gusano o una rodaja de naranja — nunca limón con sal como el tequila. Un palenque tradicional, con su propio horno de tierra y su propio molino de piedra, sigue siendo la mejor forma de entender por qué cada mezcal sabe distinto incluso usando el mismo agave.",
    imagenSeed: "mezcal",
  },
  {
    slug: "como-empacar-para-una-expedicion-de-un-dia",
    titulo: "Cómo empacar para una expedición de un día",
    categoria: "Consejos de viaje",
    listingSlug: null,
    extracto:
      "Lo mínimo indispensable para una salida de un día a terreno irregular, sin cargar de más ni quedarte corto.",
    contenido:
      "Para una salida de un día — ruta, experiencia o expedición corta — el error más común es empacar como si fuera una mochila de varios días. Lo que realmente necesitas cabe en una mochila pequeña: 1.5 litros de agua mínimo, protector solar, una capa extra por si cambia el clima, y calzado cerrado con buena suela, no tenis de ciudad.\n\nLleva efectivo en billetes pequeños — muchos puntos de venta local en zonas rurales no tienen terminal. Una power bank es más útil que una cámara extra: el celular hace ambas cosas.\n\nEvita las mochilas de espalda rígida si el recorrido incluye tramos de ascenso o descenso — una mochila tipo canguro o riñonera grande te deja más libertad de movimiento. Y algo que casi nadie lleva pero deberían: una bolsa de plástico extra, para lo que sea (basura, ropa mojada, souvenirs frágiles).",
    imagenSeed: "empacar",
  },
  {
    slug: "el-legado-cornish-en-real-del-monte",
    titulo: "El legado cornish en Real del Monte: cuando Cornualles llegó a Hidalgo",
    categoria: "Historia",
    listingSlug: "cornish",
    extracto:
      "A mediados del siglo XIX, cientos de mineros de Cornualles llegaron a Hidalgo. Todavía se nota — empezando por el paste.",
    contenido:
      "En 1824, la compañía Real del Monte Mining trajo a Hidalgo a más de trescientos mineros de Cornualles, en el suroeste de Inglaterra, para modernizar la extracción de plata. Fue una de las primeras migraciones laborales organizadas hacia México, y su huella sigue visible casi 200 años después.\n\nEl paste — ese empanadón relleno que hoy es orgullo culinario de Real del Monte y Pachuca — es directamente el 'pasty' cornish, adaptado con ingredientes locales. Los mineros lo llevaban al socavón porque se mantenía caliente varias horas y no necesitaba cubiertos.\n\nEl cementerio inglés del pueblo, con lápidas en inglés y apellidos como Bunting o Rule, es de los pocos cementerios protestantes de esa época en México. Y el propio trazado urbano de Real del Monte, con casas de tejado a dos aguas poco común en la región, delata la influencia británica en cada esquina.",
    imagenSeed: "cornish",
  },
  {
    slug: "guia-rapida-aifa-a-la-ciudad",
    titulo: "Guía rápida para moverte entre el AIFA y la ciudad",
    categoria: "Movilidad",
    listingSlug: "club-shared-aifa",
    extracto:
      "El Aeropuerto Felipe Ángeles queda lejos de lo que la mayoría imagina. Esto es lo que hay que saber antes de reservar traslado.",
    contenido:
      "El AIFA está en Santa Lucía, Estado de México — más cerca de lo que muchos creen, pero sin transporte público directo cómodo hacia el centro o zonas como Polanco o Roma/Condesa. La opción más práctica sigue siendo el traslado terrestre, ya sea compartido o privado.\n\nUn shuttle compartido tarda entre 60 y 75 minutos dependiendo del destino final, con paradas intermedias. Un traslado privado es más rápido y directo, recomendable si viajas con equipaje voluminoso o en horario nocturno.\n\nLa recomendación práctica: reserva el traslado con margen — al menos 3 horas antes de tu vuelo para llegadas internacionales — y confirma el punto de encuentro exacto la noche anterior. El aeropuerto sigue en expansión y la señalización todavía no es tan clara como en el AICM.",
    imagenSeed: "aifa",
  },
  {
    slug: "cinco-miradores-que-no-salen-en-el-mapa",
    titulo: "Cinco miradores que no salen en Google Maps",
    categoria: "Consejos de viaje",
    listingSlug: null,
    extracto:
      "Los mejores puntos panorámicos de las rutas de Rutaru casi nunca están marcados — se llega ahí solo si alguien te lleva.",
    contenido:
      "Hay miradores que sí están en el mapa, con estacionamiento y señalización. Y hay otros que solo existen porque alguien que conoce el terreno sabe exactamente dónde detenerse.\n\nEn la sierra de Tlatlauquitepec, por ejemplo, el punto más alto del recorrido no tiene nombre oficial — es simplemente 'la curva después del segundo mirador', y ahí es donde la niebla se abre lo suficiente para ver la sierra completa en días despejados.\n\nEn Cantona, subir a la acrópolis principal (no al primer mirador que aparece al entrar) es la única forma de dimensionar realmente el tamaño de la ciudad de lava. En Real del Monte, el punto exacto donde convergen el cementerio inglés y el paisaje minero rara vez aparece en fotos de redes sociales — pero es, para muchos guías locales, el mejor ángulo del pueblo entero.\n\nEsa es, en el fondo, la razón de ser de un recorrido guiado: no es solo transporte, es acceso a lo que no está señalizado.",
    imagenSeed: "miradores",
  },
  {
    slug: "sincretismo-religioso-centro-historico",
    titulo: "El sincretismo religioso que sobrevive en el Centro Histórico",
    categoria: "Cultura",
    listingSlug: "sincretismo",
    extracto:
      "Debajo de cada iglesia colonial del centro hay, casi siempre, una historia previa que nunca desapareció del todo.",
    contenido:
      "El Centro Histórico de la Ciudad de México se construyó literalmente sobre el Templo Mayor — pero el sincretismo no se quedó solo en la arqueología. Sigue vivo en prácticas cotidianas que combinan liturgia católica con elementos prehispánicos, muchas veces sin que quien las practica lo note conscientemente.\n\nCopal quemado frente a altares católicos, ofrendas con flores y frutas en fechas que no corresponden al calendario litúrgico oficial, y santos patronos que heredaron atributos de deidades prehispánicas anteriores — todo eso convive en un radio de pocas cuadras.\n\nUn recorrido guiado por estas capas superpuestas cambia por completo la forma de ver una iglesia colonial: deja de ser solo arquitectura barroca y se vuelve evidencia de una negociación cultural de 500 años que, en el fondo, nunca terminó de resolverse del todo.",
    imagenSeed: "sincretismo",
  },
  {
    slug: "que-llevar-a-un-rapel-guia-principiantes",
    titulo: "Qué llevar a un rapel: guía para principiantes",
    categoria: "Consejos de viaje",
    listingSlug: "rapel-barrancas-huasca",
    extracto:
      "Tu primera vez en rapel no requiere equipo propio, pero sí ropa y actitud correctas. Esto es lo que de verdad importa.",
    contenido:
      "El equipo técnico — arnés, casco, cuerdas, mosquetones — siempre lo proporciona el operador certificado. Lo que tú controlas es la ropa: pants o leggings resistentes (nunca shorts, el arnés roza), tenis de agarre cerrado, y una sudadera ligera aunque haga calor abajo, porque las barrancas suelen estar varios grados más frías.\n\nAmárrate el cabello si lo tienes largo, quítate anillos y pulseras (se enganchan en el equipo), y lleva una muda de ropa extra en el vehículo — es común terminar algo mojado o con tierra en el punto de descenso.\n\nLa parte mental importa tanto como la física: el primer descenso siempre genera nervios, incluso en gente que hace deporte regularmente. Es normal. El instructor certificado controla la velocidad de bajada desde arriba — tu trabajo es solo caminar hacia atrás, despacio, y confiar en el equipo.",
    imagenSeed: "rapel",
  },
  {
    slug: "roma-norte-la-colonia-que-se-volvio-loft",
    titulo: "Roma Norte: la colonia que se volvió loft",
    categoria: "Hospedaje",
    listingSlug: "loft-roma-norte",
    extracto:
      "De colonia porfiriana golpeada por el sismo del 85 a epicentro de diseño y cafés de especialidad — la transformación de Roma Norte en tres décadas.",
    contenido:
      "Roma Norte nació a finales del siglo XIX como una de las primeras colonias planeadas fuera del Centro, con edificios afrancesados pensados para la clase alta porfiriana. El sismo de 1985 la dejó semi-abandonada durante casi dos décadas — muchos edificios con daño estructural real, otros simplemente desvalorizados por miedo.\n\nA partir de los 2000, esa misma arquitectura dañada — techos altos, fachadas de cantera, balcones de herrería — se volvió el atractivo principal para una nueva generación de diseñadores, arquitectos y restauradores que convirtieron departamentos antiguos en lofts.\n\nHoy caminar por Orizaba o Colima es ver ese contraste todavía activo: edificios completamente restaurados junto a otros que conservan grietas del 85 sin intervenir. Alojarse en un loft de la zona no es solo elegir ubicación — es, literalmente, dormir dentro de esa historia de reconstrucción.",
    imagenSeed: "roma-norte",
  },
  {
    slug: "temoaya-y-el-telar-que-resiste-al-tiempo",
    titulo: "Temoaya y el telar que resiste al tiempo",
    categoria: "Cultura",
    listingSlug: "taller-textil-otomi-temoaya",
    extracto:
      "El telar de cintura otomí se sigue tejiendo exactamente igual que hace siglos — sin marco, sin máquina, solo el cuerpo como tensor.",
    contenido:
      "El telar de cintura no usa estructura fija: un extremo se amarra a un poste o árbol, el otro rodea la cintura de quien teje, que se inclina hacia adelante o atrás para tensar los hilos. Es una de las técnicas textiles más antiguas de Mesoamérica y sigue viva, casi sin cambios, en comunidades otomíes como Temoaya.\n\nCada patrón geométrico no es solo decorativo: codifica identidad regional, y una tejedora experimentada puede identificar de qué comunidad es una pieza solo por la combinación de colores y figuras.\n\nAprender los primeros nudos en un taller de una tarde no te va a volver experto, pero sí cambia por completo cómo se ve un textil otomí en un mercado — de pronto notas cuántas horas de tensión corporal y precisión hay detrás de cada pieza.",
    imagenSeed: "temoaya",
  },
  {
    slug: "la-ruta-del-mole-cocinar-en-oaxaca",
    titulo: "La ruta del mole: cocinar en Oaxaca de mercado a mesa",
    categoria: "Gastronomía",
    listingSlug: "clase-cocina-oaxaquena",
    extracto:
      "Oaxaca tiene al menos siete moles reconocidos. Entender uno solo, desde el mercado hasta el comal, cambia cómo se prueban los otros seis.",
    contenido:
      "Oaxaca es la única región de México con una familia completa de moles reconocidos y distintos entre sí — negro, rojo, amarillo, verde, coloradito, chichilo y manchamanteles, cada uno con su propia combinación de chiles secos, especias y técnica.\n\nEntender uno desde cero — comprando los chiles en el mercado, tostándolos, moliéndolos en metate o licuadora, y ajustando el punto de sazón — es la mejor forma de dimensionar por qué un mole 'de verdad' toma horas, no minutos.\n\nEl mercado local es, de hecho, la mitad de la experiencia: regatear chiles secos, identificar hierba santa fresca, elegir el chocolate correcto para un mole negro. Cocinarlo después, con una cocinera que lleva haciéndolo toda su vida, es la diferencia entre leer una receta y entender un oficio.",
    imagenSeed: "mole",
  },
  {
    slug: "bacalar-laguna-de-los-siete-colores",
    titulo: "Bacalar: por qué le dicen la laguna de los siete colores",
    categoria: "Naturaleza",
    listingSlug: "cabana-bacalar-laguna",
    extracto:
      "El agua de Bacalar no cambia de color por filtro de cámara — cambia por la profundidad real del suelo calizo que pisa.",
    contenido:
      "La Laguna de Bacalar, en Quintana Roo, debe sus tonos — desde turquesa pálido hasta azul profundo — a la profundidad variable del fondo calizo y a la altísima transparencia del agua, alimentada por cenotes subterráneos que la conectan con el manto freático de toda la región.\n\nA diferencia del mar Caribe cercano, Bacalar es agua dulce (con zonas salobres), lo que permite la formación de estromatolitos vivos — estructuras microbianas de hasta 9,000 años, entre las más antiguas registradas en el planeta, visibles en ciertas zonas protegidas de la laguna.\n\nHospedarse justo sobre la laguna, con acceso directo al agua desde la propia terraza, es la forma más directa de entender por qué el lugar se ganó el apodo mucho antes de que existiera Instagram: el color cambia literalmente según la hora del día y la posición del sol.",
    imagenSeed: "bacalar",
  },
];

async function ensureArticulo(a) {
  const { data: existing } = await admin
    .from("articulos")
    .select("id")
    .eq("slug", a.slug)
    .maybeSingle();
  if (existing) return existing.id;

  let listingId = null;
  if (a.listingSlug) {
    const { data: listing } = await admin
      .from("listings")
      .select("id")
      .eq("slug", a.listingSlug)
      .maybeSingle();
    listingId = listing?.id ?? null;
  }

  const { error } = await admin.from("articulos").insert({
    titulo: a.titulo,
    slug: a.slug,
    extracto: a.extracto,
    contenido: a.contenido,
    imagen: img(a.imagenSeed),
    categoria: a.categoria,
    listing_id: listingId,
    autor: "Equipo Rutaru",
  });
  if (error) throw new Error(`articulo ${a.slug}: ${error.message}`);
}

async function main() {
  console.log("Sembrando articulos...");
  for (const a of ARTICULOS) {
    await ensureArticulo(a);
  }
  console.log(`Articulos: ${ARTICULOS.length}.`);
}

main().catch((err) => {
  console.error("ERROR:", err.message);
  process.exit(1);
});
