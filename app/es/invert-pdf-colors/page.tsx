import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  IconLock,
  IconPalette,
  IconDownload,
  IconSmartphone,
} from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/es/invert-pdf-colors";
const TITLE = "Invertir Colores PDF Online Gratis (Modo Oscuro o Imprimir)";
const DESCRIPTION =
  "Herramienta gratis para invertir colores PDF en tu navegador: oscurece páginas claras sin fotos en negativo o pasa diapositivas oscuras a blanco para imprimir.";
const SOCIAL_IMAGE_ALT =
  "Invertir colores PDF en el navegador: modo oscuro e impresión de diapositivas oscuras";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/invert-pdf-colors",
      es: SLUG,
      pt: "/pt/invert-pdf-colors",
      de: "/de/invert-pdf-colors",
      "x-default": "/invert-pdf-colors",
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SLUG,
    siteName: "PDF Dark",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${SLUG}/opengraph-image`, alt: SOCIAL_IMAGE_ALT }],
  },
};

const STEPS = [
  [
    "Elige dirección y tema",
    "Usa Claro → Oscuro (Midnight, Sepia, Solarized u OLED con Oscuridad 50-100%, Calidez 0-100% e Imágenes en Auto, Original o Invertir), o activa Oscuro → Claro (Imprimir) para apuntes oscuros.",
  ],
  [
    "Suelta tu PDF local",
    "Selecciona o arrastra tu archivo desde el dispositivo; la conversión corre en la pestaña de tu navegador sin subir documentos.",
  ],
  [
    "Descarga el nuevo PDF",
    "El archivo convertido se guarda solo con su sufijo (-midnight.pdf, -oled.pdf o -light.pdf), con los colores grabados en cada página para leer, compartir o imprimir.",
  ],
] as const;

const MODE_ROWS: { caso: string; ajuste: ReactNode; resultado: string }[] = [
  {
    caso: "Diapositivas o apuntes de pizarrón negro, azul marino o verde para imprimir",
    ajuste: (
      <span className="font-medium text-neutral-100">
        Oscuro → Claro (Imprimir)
      </span>
    ),
    resultado:
      "Lleva fondos oscuros a blanco puro (#FFFFFF), oscurece trazos amarillos, cian, azules o verdes dentro de su familia de color y conserva fotos o páginas ya blancas.",
  },
  {
    caso: "Libros, artículos o informes con fotografías y diagramas",
    ajuste: (
      <span className="font-medium text-neutral-100">
        Midnight / Sepia / Solarized + Auto
      </span>
    ),
    resultado:
      "Oscurece fondo y texto (o añade tono cálido con Calidez), invierte esquemas blancos y mantiene las fotografías en sus colores naturales.",
  },
  {
    caso: "Recortes de pizarrón o escaneos con margen amplio (en modo oscuro)",
    ajuste: (
      <span className="font-medium text-neutral-100">Imágenes: Invertir</span>
    ),
    resultado:
      "Fuerza la inversión sobre fotos incrustadas o capturas con borde ancho (< 85% de la hoja) que el modo Auto trataría como fotografía.",
  },
  {
    caso: "Catálogos o manuales donde ninguna imagen debe cambiar",
    ajuste: (
      <span className="font-medium text-neutral-100">Imágenes: Original</span>
    ),
    resultado:
      "Recolorea únicamente vectores de texto y fondo; deja intactas todas las fotos incrustadas y las páginas escaneadas completas.",
  },
  {
    caso: "Accesibilidad de Adobe Reader, extensión del navegador o tecla i de Sumatra PDF",
    ajuste: <span className="text-neutral-300">Convertir aquí el archivo</span>,
    resultado:
      "Esos visores solo alteran tu pantalla local mientras la app sigue abierta: al enviar el PDF por WhatsApp, abrirlo en el móvil o llevarlo a la copistería, vuelve al original.",
  },
];

const FAQ = [
  {
    q: "¿Cómo pasar un PDF de fondo negro o azul oscuro a blanco para imprimir?",
    a: "Selecciona Oscuro → Claro (Imprimir) arriba y suelta el archivo. Los fondos negros, azul marino y verde pizarra pasan a blanco puro (#FFFFFF) para ahorrar tinta o tóner, las portadas o páginas de ejercicios que ya son blancas se mantienen sin cambios, y las fórmulas en amarillo, cian, azul o verde se oscurecen conservando su matiz para leerse con nitidez en papel.",
  },
  {
    q: "¿Qué ajuste en modo oscuro aplica una inversión exacta en escala de grises?",
    a: "Elige el tema OLED con Oscuridad al 100% y Calidez al 0%. En textos y fondos grises aplica salida = 255 − entrada sin el matiz azulado ni sepia de Midnight, Sepia o Solarized. Como los colores saturados conservan su tono y las páginas rasterizadas se guardan en JPEG, volver a procesar el archivo descargado no restaura el PDF original byte a byte.",
  },
  {
    q: "¿Cómo decide el modo Auto qué imágenes invertir y cuáles conservar?",
    a: "Al oscurecer páginas claras, el clasificador evalúa brillo y saturación en cada imagen incrustada: conserva fotografías reales, atenúa ligeramente figuras muy intensas e invierte capturas claras, diagramas de líneas y escaneos de página completa (85% o más de la hoja). En el modo de impresión para fondos oscuros, voltea automáticamente capturas de pizarrón oscuro a blanco y respeta los recuadros de preguntas blancos y las fotos normales.",
  },
  {
    q: "¿El PDF descargado conserva el texto seleccionable y un tamaño ligero?",
    a: "En páginas vectoriales compatibles cuyas imágenes no requieren inversión, PDF Dark recolorea el flujo de color del PDF directamente (incluso en manuales con bloqueo de copia sin contraseña de apertura), manteniendo letras nítidas, enlaces y tamaño compacto sin inflar el archivo 15 o 20 veces. Las páginas escaneadas o con imágenes invertidas se exportan como JPEG hasta escala 1.5x (límite de 4096 px por lado y ~8.4 MP por página) con capa Helvetica invisible para texto latino sin rotación, sin OCR ni soporte CJK.",
  },
  {
    q: "¿Se sube mi PDF a algún servidor o hay límite de páginas?",
    a: "No se sube nada: el renderizado de páginas, el mapeo de color y el armado del nuevo PDF se ejecutan localmente en la pestaña de tu navegador (con el cálculo de píxeles en un worker en segundo plano), sin cuenta, marca de agua ni cuota por hora. El tamaño práctico depende solo de la memoria disponible en tu equipo.",
  },
];

export default function InvertPdfColorsEsPage() {
  const site = getSiteUrl();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invertir colores PDF",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    inLanguage: "es",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <div className="flex flex-col flex-1 w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/es"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">
              PDF Dark
            </span>
          </Link>
          <ResponsiveNavigation
            locale="es"
            desktopGap="wide"
            language={<LanguageSwitcher page="invert" current="es" />}
          >
            <Link href="/es" className="hover:text-neutral-100">
              Lector
            </Link>
          </ResponsiveNavigation>
        </div>
      </header>

      <main className="flex-1 w-full">
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Invertir colores PDF
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Herramienta para invertir colores PDF online y gratis desde tu
            navegador: pasa documentos claros a fondo oscuro sin volver
            negativas las fotos, o activa el{" "}
            <strong className="text-neutral-100 font-medium">
              modo de impresión (Oscuro a Claro)
            </strong>{" "}
            para convertir diapositivas y pizarrones oscuros a papel blanco sin
            desperdiciar tóner.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Modo oscuro e impresión
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Fotos sin negativo (Auto)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% en tu navegador
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Móvil y PC
            </span>
          </div>

          <div className="mt-8">
            <Downloader locale="es" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            ¿Solo quieres leer esta noche sin descargar copia?{" "}
            <Link href="/es" className="text-amber-400 hover:underline">
              Abre el lector de PDF en modo oscuro
            </Link>
            .
          </p>
        </section>

        <section
          id="ejemplos"
          className="w-full py-16 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center">
              Comparativa real al invertir colores PDF
            </h2>
            <p className="mt-3 text-sm text-neutral-400 text-center max-w-2xl mx-auto">
              El conversor reescribe texto y fondo en ambos sentidos mientras
              clasifica cada imagen incrustada por separado.
            </p>

            <div className="mt-10">
              <h3 className="text-lg font-semibold text-neutral-100 text-center m-0">
                Claro → Oscuro: qué cambia el ajuste de Imágenes
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-2xl mx-auto">
                Una inversión RGB directa convierte el atardecer en negativo; el
                modo <strong className="text-neutral-200">Auto</strong> invierte
                esquemas claros y conserva las fotografías a color.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="Página PDF original con texto negro sobre blanco y fotografía de un atardecer"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-400">
                    Original (fondo blanco y foto)
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/naive-invert.png"
                      alt="Inversión RGB simple donde la foto del atardecer queda en negativo azulado"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-400">
                    RGB simple (foto en negativo)
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="Resultado en PDF Dark con tema Midnight e Imágenes en Auto: fondo oscuro y foto en color real"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    PDF Dark · Midnight + Auto
                  </figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-12 pt-10 border-t border-neutral-900">
              <h3 className="text-lg font-semibold text-neutral-100 text-center m-0">
                Imprimir diapositivas y apuntes de pizarrón oscuro
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-2xl mx-auto">
                Los apuntes de pizarra digital suelen usar fondo azul marino o
                verde con trazos amarillos y cian. Una inversión RGB común tiñe
                toda la hoja y altera los colores; el modo de impresión entrega
                blanco puro (#FFFFFF) y tinta oscura legible.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-source.webp"
                      alt="Apuntes PDF sobre pizarrón azul oscuro con ecuaciones blancas, amarillas y cian"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-400">
                    PDF de pizarrón oscuro
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-naive.webp"
                      alt="Inversión RGB simple que deja la hoja con fondo crema y cambia las notas amarillas a azul"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-400">
                    RGB simple (fondo teñido)
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/board-print.webp"
                      alt="Resultado en modo de impresión: papel blanco puro y fórmulas oscuras en su color original"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Modo impresión (-light.pdf)
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como-usar"
          className="max-w-4xl mx-auto px-6 py-14 border-b border-neutral-900"
        >
          <h2 className="text-2xl font-bold text-center sm:text-3xl">
            Cómo invertir colores PDF paso a paso
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li
                key={title}
                className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5"
              >
                <span className="font-mono text-sm text-amber-400">
                  0{i + 1}
                </span>
                <h3 className="mt-2 font-semibold text-neutral-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section id="ajustes" className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-center sm:text-3xl">
            Qué ajuste elegir según tu documento
          </h2>
          <div
            role="region"
            aria-label="Tabla de ajustes según el tipo de PDF"
            tabIndex={0}
            className="mt-8 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            <table className="w-full min-w-[640px] text-left text-sm leading-6">
              <thead className="bg-neutral-900 text-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Tu documento o caso
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Ajuste recomendado
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Resultado en el PDF descargado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                {MODE_ROWS.map(({ caso, ajuste, resultado }) => (
                  <tr key={caso}>
                    <th
                      scope="row"
                      className="px-4 py-3.5 align-top font-medium text-neutral-200"
                    >
                      {caso}
                    </th>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      {ajuste}
                    </td>
                    <td className="px-4 py-3.5 align-top">{resultado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="faq"
          className="max-w-3xl mx-auto border-t border-neutral-900 px-6 py-12 pb-20"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
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
                <p className="px-4 pb-4 -mt-1 text-sm leading-relaxed text-neutral-400">
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
