import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/es/invert-pdf-colors";
const TITLE = "Invertir Colores de PDF — Convertidor Online Gratis, Sin Subir Archivos";
const DESCRIPTION =
  "Invierte los colores de un PDF y descarga el archivo invertido. Las fotos pueden mantener sus propios colores en vez de convertirse en negativos. Gratis, del lado del navegador, sin subir archivos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/invert-pdf-colors",
      es: SLUG,
      pt: "/pt/invert-pdf-colors",
      tr: "/tr/invert-pdf-colors",
      id: "/id/invert-pdf-colors",
      de: "/de/invert-pdf-colors",
      "x-default": "/invert-pdf-colors",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SLUG,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const FAQ = [
  {
    q: "¿Qué produce exactamente invertir un PDF?",
    a: "Un PDF completamente nuevo con los colores invertidos dentro del propio contenido de la página — fondo y texto intercambiados, imágenes tratadas según tu configuración de Imágenes. Ábrelo en Acrobat, Preview, un navegador o un e-reader y se ve igual en todos lados, porque el cambio está en el archivo, no en una preferencia del visor.",
  },
  {
    q: "¿Qué opción da una inversión exacta y real?",
    a: "El tema OLED. Con OLED el mapeo es exactamente salida = 255 − entrada para el contenido en escala de grises: el blanco puro se vuelve negro puro, el negro puro se vuelve blanco puro, y si vuelves a pasar la salida por el proceso obtienes el original. Midnight, Sepia y Solarized ponen el blanco sobre un fondo con tinte en vez de una inversión matemáticamente exacta — más cómodo para sesiones largas, pero no es lo mismo.",
  },
  {
    q: "¿Puede convertir un PDF con fondo negro de vuelta a blanco?",
    a: "Sí. Como el mapeo de OLED es simétrico, un documento oscuro que pasa por él sale claro: los fondos negros se vuelven blancos y el texto claro se vuelve negro. Por eso suele buscarse esto — un documento con tema oscuro sale carísimo de imprimir, e invertirlo primero ahorra tóner.",
  },
  {
    q: "¿Las fotos se van a convertir en negativos?",
    a: "Solo si quieres. El modo Auto por defecto mantiene las fotos en sus colores originales, invierte las capturas de pantalla y diagramas blancos para que combinen con la página, y atenúa suavemente las imágenes muy brillantes. Pon Imágenes en Invertir para voltear literalmente todo, u Original para dejar cada imagen intacta.",
  },
  {
    q: "¿Puedo invertir el texto y el fondo pero dejar las imágenes intactas?",
    a: "Sí — pon Imágenes en Original. Cada imagen incrustada queda idéntica píxel a píxel a la fuente, incluyendo escaneos de página completa, y solo el texto y el fondo se invierten. Las imágenes recortadas en círculo, como fotos de perfil, se restauran a través de su marco circular, así que no quedan esquinas brillantes sobre la página oscura.",
  },
  {
    q: "¿El PDF invertido conserva el texto seleccionable?",
    a: "Sí, donde la página original lo permita. Las páginas con texto se recolorean como objetos vectoriales, así que el texto de salida sigue siendo seleccionable y buscable. Las páginas escaneadas son imágenes desde el principio, así que se invierten como imágenes.",
  },
  {
    q: "¿Puedo imprimir la versión invertida?",
    a: "Sí — esa es una de las razones principales para invertir el archivo en vez de usar un tema del visor. Imprime el archivo descargado desde cualquier lector y la página sale exactamente como la ves.",
  },
  {
    q: "¿Hay un límite de tamaño de archivo?",
    a: "No hay un límite fijo. La conversión funciona enteramente en tu dispositivo, así que el límite práctico es la memoria de tu navegador — los documentos grandes solo tardan más.",
  },
  {
    q: "¿Mi PDF se sube a un servidor?",
    a: "No. Renderizar, invertir y reconstruir el PDF ocurre todo dentro de la pestaña de tu navegador. El archivo descargado se genera localmente — no hay ningún servidor que llegue a ver tu documento.",
  },
  {
    q: "¿Puedo compartir el archivo invertido con otra persona?",
    a: "Sí. Envíalo por correo, AirDrop, súbelo a Google Drive o Dropbox — quien lo reciba verá la versión invertida automáticamente. No necesita configurar nada.",
  },
];

const STEPS = [
  {
    t: "Elige tu configuración",
    d: "Decide hasta dónde llega la inversión — Imágenes: Original, Auto o Invertir completo — más el fondo donde queda, la oscuridad y la calidez.",
  },
  {
    t: "Suelta tu PDF",
    d: "Arrastra y suelta, o haz clic para buscarlo. Nunca sale de tu navegador.",
  },
  {
    t: "Obtén el PDF invertido",
    d: "La conversión empieza al instante y el nuevo archivo se descarga solo — con los colores escritos en el documento, listo para compartir, imprimir o leer donde sea.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Color Inverter",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Cómo invertir los colores de un PDF",
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: 0 },
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.t,
      text: s.d,
    })),
  };
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </>
  );
}

export default function InvertPdfColorsEsPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />

      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/es"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold hidden sm:inline">
              PDF Dark
            </span>
          </Link>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <Link href="/es" className="hover:text-neutral-100">
              Lector
            </Link>
            <Link href="/blog" className="hover:text-neutral-100">
              Blog
            </Link>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
            <LanguageSwitcher page="invert" current="es" />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Invertir colores de PDF
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Elige tu configuración, suelta tu PDF, y la copia invertida se
            descarga sola. Los colores quedan escritos en el propio archivo,
            así que se mantiene así en cualquier visor — Acrobat, Preview,
            navegadores, e-readers. Gratis, y tu archivo nunca sale del
            navegador.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Descargar PDF invertido
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% en el navegador
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 3 modos de imagen
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Funciona en el móvil
            </span>
          </div>

          <div className="mt-8">
            <Downloader locale="es" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            ¿Solo viniste a leer, no a guardar un archivo?{" "}
            <Link href="/es" className="text-amber-400 hover:underline">
              Abre el lector de PDF en modo oscuro
            </Link>
            .
          </p>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              Cómo invertir los colores de un PDF
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              El texto y el fondo siempre se invierten. Qué pasa con las
              imágenes depende de ti — para eso está el control de Imágenes:
              déjalas intactas, invierte con la página, o deja que cada una se
              evalúe por separado. ¿Curioso por saber cómo decide esa
              detección?{" "}
              <Link
                href="/blog/how-pdf-dark-mode-conversion-works"
                className="text-amber-400 hover:underline"
              >
                Así funciona la conversión
              </Link>
              .
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.t}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
                >
                  <div className="text-2xl font-bold text-amber-400">{i + 1}</div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Qué cambia la configuración de Imágenes
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                El texto y el fondo se invierten en ambos casos. La foto es
                donde se nota la diferencia — y donde invertir cada píxel a
                ciegas falla.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="Página de PDF antes de la inversión: texto negro sobre fondo blanco con una foto a color de un atardecer"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    PDF original
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/naive-invert.png"
                      alt="La misma página tras una inversión simple de píxeles — la foto del atardecer se convierte en un negativo de color falso"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Cada píxel invertido
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="La misma página invertida aquí — fondo y texto invertidos, la foto mantiene sus colores originales"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Invertido aquí, Imágenes: Auto
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-600 text-center">
                Resultado real, no un mockup: a la izquierda la página fuente,
                al centro una inversión RGB simple de cada píxel, a la derecha
                esta herramienta en Auto (tema Midnight). Elegir Imágenes:
                Invertir también voltea las fotos junto con la página — que es
                lo que necesita un escaneo o la foto de una pizarra.
              </p>
            </div>
          </div>
        </section>

        {/* Why invert the file */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            ¿Por qué invertir el archivo en vez de una preferencia del visor?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Los temas del visor, las extensiones del navegador y el interruptor
            de inversión del sistema solo cambian cómo se ve un PDF mientras
            está abierto en esa app — el archivo en sí no cambia. Invertirlo
            produce un <strong className="text-neutral-100">nuevo PDF</strong>:
            envíalo a tu teléfono o e-reader, compártelo con un compañero,
            imprímelo o archívalo, y los colores viajan con el archivo.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Hay otra diferencia que importa: una inversión a nivel de sistema no
            sabe qué está invirtiendo, así que cada foto, gráfico y captura de
            pantalla sale como un negativo. Trabajar sobre el archivo permite
            evaluar cada imagen por separado — o dejarla intacta del todo. Si
            solo necesitas terminar un documento esta noche, sáltate la
            descarga y{" "}
            <Link href="/es" className="text-amber-400 hover:underline">
              léelo oscuro en el navegador
            </Link>{" "}
            en su lugar.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Visor / extensión / inversión del sistema
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Invertido solo mientras esa app/extensión está activa</li>
                <li>Al reabrirlo en otro lector, vuelve al original</li>
                <li>No se puede compartir ni imprimir la versión invertida</li>
                <li>
                  Invierte fotos, capturas y gráficos sin forma de excluirlos
                </li>
                <li>Se rompe al actualizar o cambiar de dispositivo</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                Un archivo PDF invertido
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Permanente</strong> — los
                  colores están en el archivo
                </li>
                <li>
                  Se ve igual en <strong className="text-neutral-100">cualquier</strong> lector
                  de PDF, en cualquier dispositivo
                </li>
                <li>
                  Compartible — correo, AirDrop, Drive, lo que sea; quien lo
                  reciba ve la versión invertida sin configurar nada
                </li>
                <li>
                  Control por imagen — las fotos mantienen sus colores mientras
                  la página a su alrededor se invierte
                </li>
                <li>
                  Mapeo de color que preserva el tono — un encabezado azul
                  oscuro se vuelve azul claro, no gris
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            Piénsalo así: una extensión es maquillaje sobre el PDF. Invertirlo
            es un PDF nuevo.
          </p>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Cuándo invertir un PDF es la mejor opción
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Documentos escaneados y notas manuscritas
              </h3>
              <p className="text-sm text-neutral-400">
                En un escaneo no hay capa de texto — la escritura <em>es</em> la
                imagen. Pon Imágenes en Invertir y toda la página se voltea, así
                la letra manuscrita queda clara sobre oscuro.{" "}
                <Link
                  href="/blog/scanned-pdf-dark-mode"
                  className="text-amber-400 hover:underline"
                >
                  Más sobre PDFs escaneados
                </Link>
                .
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Un PDF oscuro que necesitas imprimir
              </h3>
              <p className="text-sm text-neutral-400">
                Los folletos con tema oscuro y las diapositivas exportadas son
                brutales para una impresora. Pásalo por OLED y vuelve a ser
                texto negro sobre blanco, listo para imprimir sin rediseñar
                nada — la inversión funciona en ambas direcciones.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Papers y presentaciones llenas de figuras
              </h3>
              <p className="text-sm text-neutral-400">
                Gráficos de líneas, diagramas de circuitos, partituras, dibujos
                técnicos — el arte en negro sobre blanco se invierte limpiamente
                y se mantiene legible. Auto maneja el caso mixto, donde un paper
                tiene tanto diagramas como fotografías en la misma página.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Leer de noche sin arruinar las imágenes
              </h3>
              <p className="text-sm text-neutral-400">
                El motivo habitual para invertir un PDF es una página brillante
                en un cuarto oscuro. El motivo habitual para rendirse es que las
                imágenes salen como negativos — que es exactamente el caso para
                el que existe Auto.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60 transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer p-4 flex items-center justify-between list-none text-neutral-100">
                  <h3 className="font-medium text-base m-0">{f.q}</h3>
                  <span
                    aria-hidden
                    className="text-neutral-500 transition-transform group-open:rotate-180 group-hover:text-amber-400"
                  >
                    ⌄
                  </span>
                </summary>
                <p className="px-4 pb-4 -mt-1 text-sm text-neutral-400">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer locale="es" />
    </div>
  );
}
