import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/es/invert-pdf-colors";
const TITLE = "Invertir Colores PDF Online Gratis (PDF Negativo o Claro)";
const DESCRIPTION =
  "Herramienta para invertir colores PDF online y gratis en tu navegador: pasa a fondo negro sin volver negativas las fotos, o pasa un PDF oscuro a blanco.";

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
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const MODE_ROWS: { caso: string; ajuste: ReactNode; resultado: string }[] = [
  {
    caso: "Apuntes, libros o informes con fotos y diagramas",
    ajuste: (
      <span className="font-medium text-neutral-100">
        Midnight / Sepia + Imágenes: Auto
      </span>
    ),
    resultado:
      "Oscurece fondo y texto, invierte diagramas sobre fondo blanco y mantiene las fotografías en sus colores originales.",
  },
  {
    caso: "Diapositivas o apuntes con fondo negro para imprimir",
    ajuste: (
      <span className="font-medium text-neutral-100">
        OLED (Oscuridad 100%, Calidez 0%)
      </span>
    ),
    resultado:
      "Aplica 255 − entrada a los grises: el fondo negro pasa a blanco puro y las letras claras a negro para ahorrar tinta o tóner.",
  },
  {
    caso: "PDF escaneado o foto de pizarrón / cuaderno",
    ajuste: (
      <span className="font-medium text-neutral-100">Imágenes: Invertir</span>
    ),
    resultado:
      "Como toda la página escaneada es una sola imagen, Invertir transforma todos sus píxeles a fondo oscuro sin requerir OCR.",
  },
  {
    caso: "Catálogos donde ninguna ilustración debe cambiar",
    ajuste: (
      <span className="font-medium text-neutral-100">Imágenes: Original</span>
    ),
    resultado:
      "Recolorea únicamente texto y fondo del documento; cada foto o figura incrustada conserva sus píxeles intactos.",
  },
  {
    caso: "Opción de color de Adobe Reader o tecla i de Sumatra PDF",
    ajuste: <span className="text-neutral-300">Convertir aquí el archivo</span>,
    resultado:
      "Esos visores solo cambian tu pantalla local: al enviar el PDF por WhatsApp, correo o llevarlo a imprimir, vuelve a salir blanco.",
  },
];

const FAQ = [
  {
    q: "¿Cómo invertir colores PDF online sin que las fotos salgan en negativo?",
    a: "Deja Imágenes en Auto (activo por defecto) antes de soltar tu archivo. El clasificador analiza brillo y saturación en cada figura: las fotografías conservan su color, las imágenes muy brillantes se atenúan ligeramente y las capturas o esquemas blancos se invierten con la página.",
  },
  {
    q: "¿Cómo cambiar el fondo negro de un PDF a blanco para imprimir?",
    a: "Elige el tema OLED con Oscuridad al 100% y Calidez al 0%. En tonos grises aplica salida = 255 − entrada, pasando el fondo negro a blanco y el texto claro a negro. Los colores saturados mantienen su matiz y algunas páginas se recomponen en JPEG, así que invertir dos veces seguidas no restaura el archivo original byte a byte.",
  },
  {
    q: "¿Cómo invertir los colores de una imagen o un PDF escaneado?",
    a: "Cambia Imágenes a Invertir. En un documento escaneado la página entera es un mapa de bits; con Auto u Original una foto de página completa puede conservar su aspecto original, mientras que Invertir pasa toda la hoja a fondo oscuro y trazos claros.",
  },
  {
    q: "¿El PDF descargado conserva el texto seleccionable y los enlaces?",
    a: "En páginas vectoriales compatibles cuyas imágenes no requieren inversión, PDF Dark recolorea el flujo del PDF directamente (incluso en manuales con bloqueo de permisos sin contraseña de apertura), conservando letras nítidas, búsqueda y enlaces. Las páginas escaneadas o con imágenes invertidas se exportan como JPEG a escala 1.5x con una capa Helvetica invisible para texto latino sin rotación (sin OCR para escaneos puros ni soporte CJK).",
  },
  {
    q: "¿Se sube mi PDF a algún servidor o hay límite por hora?",
    a: "No se sube nada: todo el proceso corre en un Web Worker dentro de tu navegador, sin límite de tareas por hora ni marca de agua. El único límite práctico es la memoria libre de tu dispositivo; en escaneos de cientos de páginas conviene usar una computadora y mantener la pestaña activa.",
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
            Herramienta para invertir colores PDF online y gratis en tu
            navegador: pasa páginas claras a fondo oscuro sin volver negativas
            las fotos, o convierte diapositivas negras a fondo blanco para
            imprimir sin gastar tóner.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Descarga un PDF nuevo
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Fotos sin efecto negativo (Auto)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> Procesado en tu navegador
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
          className="w-full py-14 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-center">
              Qué pasa con las fotos y gráficas al cambiar el color
            </h2>
            <p className="mt-3 mb-8 text-sm text-neutral-400 text-center max-w-2xl mx-auto">
              Capturas reales de la misma página. Una inversión RGB simple
              convierte el atardecer en negativo; el modo{" "}
              <strong className="text-neutral-200">Auto</strong> invierte
              esquemas blancos y conserva las fotografías a color.
            </p>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <figure className="m-0">
                <div className="rounded-lg overflow-hidden border border-neutral-800">
                  <Image
                    src="/compare/original.png"
                    alt="Página PDF original con texto negro sobre blanco y fotografía de un atardecer"
                    width={720}
                    height={933}
                    sizes="33vw"
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
                    sizes="33vw"
                  />
                </div>
                <figcaption className="mt-2 text-center text-xs text-neutral-400">
                  Inversión RGB simple (foto en negativo)
                </figcaption>
              </figure>
              <figure className="m-0">
                <div className="rounded-lg overflow-hidden border border-amber-400/40">
                  <Image
                    src="/compare/pdf-dark.png"
                    alt="Resultado en PDF Dark con tema Midnight e Imágenes en Auto: fondo oscuro y foto en color real"
                    width={720}
                    height={933}
                    sizes="33vw"
                  />
                </div>
                <figcaption className="mt-2 text-center text-xs text-amber-400">
                  PDF Dark · Midnight + Auto
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section id="ajustes" className="max-w-5xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold text-center sm:text-3xl">
            Qué ajuste usar al invertir colores PDF
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
