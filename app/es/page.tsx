import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/es";
const TITLE = "PDF Modo Oscuro — Lector de PDF Gratis Online | PDF Dark";
const DESCRIPTION =
  "Lee cualquier PDF en modo oscuro directamente en tu navegador. Gratis, sin subir archivos, sin registro. ¿Quieres conservarlo? Convierte y descarga un PDF oscuro permanente.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "pdf modo oscuro",
    "pdfdark",
    "pdf modo nocturno",
    "lector pdf modo oscuro",
    "convertidor pdf modo oscuro",
  ],
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/",
      es: SLUG,
      pt: "/pt",
      tr: "/tr",
      id: "/id",
      de: "/de",
      "x-default": "/",
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
  },
};

const COMPARISON_ROWS: [string, string, string, string][] = [
  ["No hace falta instalar nada", "sí", "no", "sí"],
  ["Leer en el navegador antes de descargar", "sí", "no", "Varía"],
  ["Guardar como nuevo PDF", "sí", "no", "sí"],
  ["Las fotos mantienen sus colores originales (no negativos)", "sí", "no", "no"],
  ["El texto sigue siendo seleccionable y buscable", "sí", "no", "no"],
  ["Control de imágenes: Original / Auto / Invertir", "sí", "no", "no"],
  ["Sliders de oscuridad y calidez, guardados en el archivo", "sí", "no", "no"],
  ["Funciona en iOS Safari", "sí", "no", "sí"],
  ["100% local (sin subir archivos)", "sí", "sí", "no"],
];

type FaqItem = {
  q: string;
  a: string;
  link?: { href: string; text: string };
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "¿Puedo poner un PDF en modo oscuro?",
    a: "Sí — gratis y sin instalar nada. Suelta el PDF en esta página para leerlo de inmediato sobre un fondo oscuro, o invierte sus colores y descarga una copia con el tema oscuro escrito en el archivo.",
  },
  {
    q: "¿Mi PDF se sube a algún servidor?",
    a: "No. PDF Dark funciona 100% en tu navegador. Literalmente no tenemos ningún servidor que reciba tu archivo.",
  },
  {
    q: "¿Cómo puedo imprimir un PDF en modo oscuro?",
    a: "Descarga primero una copia con el tema oscuro, luego imprímela desde cualquier lector. Como los colores quedan escritos en el propio archivo, la impresión también sale oscura, no solo la vista en pantalla.",
    link: { href: "/es/invert-pdf-colors", text: "Invertir colores de PDF" },
  },
  {
    q: "¿Funciona en iPhone o iPad?",
    a: "Sí. Safari en iOS puede abrir PDFs directamente en esta página, sin instalar ninguna app, y el archivo nunca sale de tu dispositivo.",
  },
  {
    q: "¿En qué se diferencia de una extensión de modo oscuro del navegador?",
    a: "Las extensiones solo cambian el estilo de la página mientras está abierta en tu navegador — cierra la pestaña o pásale el archivo a otra persona y vuelve a verse claro. PDF Dark reescribe el PDF de verdad: el texto y el fondo se recolorean según el tema elegido, las imágenes se tratan según tu configuración, y el resultado queda guardado en el archivo. El tema oscuro se mantiene esté donde esté el PDF.",
    link: { href: "/blog/pdf-dark-mode-chrome", text: "PDF en modo oscuro en Chrome" },
  },
  {
    q: "¿Funciona con PDFs escaneados?",
    a: "Sí. Las páginas escaneadas se tratan como lo que son — imágenes — y se invierten de forma uniforme, así que la letra manuscrita y el texto escaneado quedan en claro sobre oscuro automáticamente. Incluso los escaneos amarillentos y antiguos se normalizan al fondo de tu tema.",
    link: {
      href: "/blog/scanned-pdf-dark-mode",
      text: "PDF escaneado en modo oscuro",
    },
  },
  {
    q: "¿Cómo leo un PDF de noche sin cansar la vista?",
    a: "Convierte el PDF a modo oscuro aquí y elige OLED o Midnight — ambos convierten el fondo blanco en negro puro o casi puro para que tus ojos no tengan que pelear contra una página brillante en un cuarto oscuro. El texto se invierte a tonos claros; las imágenes se tratan con inteligencia para que las fotos no se conviertan en negativos.",
  },
  {
    q: "¿Mis fotos también se invierten?",
    a: "Solo si quieres. Por defecto, cada imagen recibe el mejor tratamiento automáticamente: las fotos mantienen sus colores originales, las capturas de pantalla y diagramas blancos se invierten para mezclarse con la página, y las imágenes muy brillantes se atenúan un poco. El interruptor de Imágenes en la barra de herramientas (junto a los temas) te deja forzar todo a Original o todo a Invertido.",
    link: {
      href: "/es/invert-pdf-colors",
      text: "Invertir colores de PDF",
    },
  },
  {
    q: "¿Puedo poner el fondo de un PDF en negro?",
    a: "Sí. El tema OLED renderiza el fondo en negro puro (#000) y el texto en tonos claros — casi blanco para el texto normal — que es el modo oscuro más agresivo para PDFs. También puedes descargar el PDF con ese fondo negro ya escrito en el archivo.",
  },
  {
    q: "¿Es esto un modo oscuro para Adobe Acrobat?",
    a: "No exactamente. Acrobat tiene su propio modo oscuro interno, pero solo cambia cómo ves el PDF dentro de Acrobat — el archivo en sí sigue siendo claro. PDF Dark produce un archivo PDF con modo oscuro de verdad, que puedes abrir en cualquier lector (Acrobat, Preview, navegador) y se mantiene oscuro.",
    link: { href: "/blog/pdf-dark-mode-adobe-acrobat", text: "PDF en modo oscuro en Adobe Acrobat" },
  },
  {
    q: "¿El modo oscuro de PDF funciona en Firefox?",
    a: "Sí. El visor PDF.js integrado de Firefox solo oscurece la barra de herramientas, no el contenido de la página. PDF Dark convierte el contenido real de la página, así que el archivo se ve oscuro en cualquier visor, incluido Firefox.",
    link: { href: "/blog/pdf-dark-mode-firefox", text: "PDF en modo oscuro en Firefox" },
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF Dark",
    alternateName: ["pdfdark", "pdfdark.org", "PDF Modo Oscuro"],
    url: `${site}${SLUG}`,
    sameAs: [
      "https://github.com/1436941541/pdf-dark",
      "https://www.saashub.com/pdf-dark",
      "https://www.libhunt.com/r/pdf-dark",
      "https://devpost.com/software/pdf-dark",
      "https://www.producthunt.com/products/pdf-dark",
      "https://yunjie3.substack.com/p/stop-installing-pdf-dark-mode-extensions",
      "https://www.youtube.com/watch?v=ugLGDvqoSe0",
    ],
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description:
      "Convertidor y lector de PDF en modo oscuro, gratis y del lado del navegador. Lee PDFs sobre un fondo oscuro directamente en el navegador o descarga el archivo con el tema aplicado. Funciona 100% en local — pensado para leer PDFs de noche.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Conversión 100% del lado del navegador (sin subir archivos)",
      "Cuatro temas: Midnight, Sepia, Solarized, OLED",
      "Las fotos mantienen sus colores originales — sin imágenes en negativo",
      "Tratamiento por imagen: Original, Auto (inteligente) o Invertir completo",
      "El texto de salida sigue siendo seleccionable y buscable",
      "Leer en el navegador antes de descargar",
      "Descargar como nuevo PDF",
      "Funciona en iOS Safari",
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

function Mark({ v }: { v: "sí" | "no" | string }) {
  if (v === "sí") return <span className="text-amber-400 font-semibold">✓</span>;
  if (v === "no") return <span className="text-neutral-600">✗</span>;
  return <span>{v}</span>;
}

export default function HomeEs() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold hidden sm:inline">PDF Dark</span>
          </div>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <Link href="/es/invert-pdf-colors" className="hover:text-neutral-100">Invertir y descargar</Link>
            <Link href="/blog" className="hover:text-neutral-100">Blog</Link>
            <a href="#faq" className="hover:text-neutral-100">FAQ</a>
            <LanguageSwitcher page="home" current="es" />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Lee PDFs en modo oscuro
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Suelta un PDF y léelo aquí mismo sobre un fondo oscuro — elige un
            tema, ajusta la oscuridad y la calidez, y pasa las páginas cómodamente
            de noche. Todo funciona en tu navegador: sin subir archivos, sin
            registro, sin instalar nada.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% en el navegador
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 4 temas
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Funciona en el móvil
            </span>
          </div>

          <div className="mt-8">
            <Converter locale="es" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            ¿Quieres conservar la versión oscura?{" "}
            <Link href="/es/invert-pdf-colors" className="text-amber-400 hover:underline">
              Invierte los colores y descarga el archivo
            </Link>
            .
          </p>
        </section>

        {/* Visual proof */}
        <section
          id="compare"
          className="max-w-5xl mx-auto px-6 py-16 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-3 text-center">
            El modo oscuro no debería arruinar tus fotos
          </h2>
          <p className="text-sm text-neutral-400 text-center mb-10 max-w-2xl mx-auto">
            La misma página, de tres formas. Un invertidor básico voltea cada
            píxel, así que las fotos salen como negativos. PDF Dark oscurece el
            texto y el fondo pero detecta las fotos y conserva sus colores.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <figure className="m-0">
              <div className="rounded-xl overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Página de PDF original antes de convertirla a modo oscuro: texto negro sobre fondo blanco brillante con una foto a color de un atardecer"
                  width={720}
                  height={933}
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <div className="font-semibold text-neutral-100 text-sm">
                  PDF original
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Una página blanca y brillante — bien de día, dura de noche.
                </div>
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-xl overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/naive-invert.png"
                  alt="La misma página de PDF oscurecida con un invertidor ingenuo de píxeles: el fondo se vuelve negro pero la foto del atardecer se convierte en un negativo de color falso"
                  width={720}
                  height={933}
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <div className="font-semibold text-neutral-100 text-sm">
                  Invertidor básico
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  Cada píxel invertido — el atardecer se vuelve un negativo de color falso.
                </div>
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-xl overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="La misma página de PDF convertida a modo oscuro con PDF Dark: fondo oscuro, texto claro, y la foto del atardecer conserva sus colores originales"
                  width={720}
                  height={933}
                  sizes="(min-width: 640px) 33vw, 100vw"
                />
              </div>
              <figcaption className="mt-3 text-center">
                <div className="font-semibold text-amber-400 text-sm">
                  PDF Dark — Auto
                </div>
                <div className="mt-1 text-xs text-neutral-500">
                  El texto y el fondo se oscurecen; la foto conserva sus colores originales.
                </div>
              </figcaption>
            </figure>
          </div>
          <p className="mt-8 text-xs text-neutral-600 text-center max-w-2xl mx-auto">
            Izquierda: la página original tal como se renderiza. Centro: la
            misma página tras una inversión de píxeles RGB — el método que usan
            la mayoría de las herramientas básicas. Derecha: resultado real de
            este convertidor (tema Midnight, modo de imagen Auto).
          </p>
          <p className="mt-4 text-sm text-center">
            <Link href="/es/invert-pdf-colors" className="text-amber-400 hover:underline">
              Invierte los colores de tu propio PDF →
            </Link>
          </p>
        </section>

        {/* Why us */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              PDF Dark vs. extensiones de Chrome vs. otras herramientas online
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Hay varias formas de leer PDFs en modo oscuro o modo nocturno
              hoy en día — extensiones del navegador, otros convertidores online,
              lectores nativos. Así se comparan para el uso diario.
            </p>

            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">
                      Función
                    </th>
                    <th className="py-3 px-4 font-medium text-amber-400">PDF Dark</th>
                    <th className="py-3 px-4 font-medium text-neutral-500">
                      Extensiones de Chrome
                    </th>
                    <th className="py-3 px-4 font-medium text-neutral-500">
                      Otras herramientas online
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {COMPARISON_ROWS.map(([feat, a, b, c]) => (
                    <tr key={feat} className="border-b border-neutral-900">
                      <td className="py-3 px-4 text-left text-neutral-200">{feat}</td>
                      <td className="py-3 px-4"><Mark v={a} /></td>
                      <td className="py-3 px-4"><Mark v={b} /></td>
                      <td className="py-3 px-4"><Mark v={c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-3">
              {COMPARISON_ROWS.map(([feat, a, b, c]) => (
                <div
                  key={feat}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"
                >
                  <p className="font-medium text-base text-neutral-100 m-0 mb-3">{feat}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="text-amber-400 text-base"><Mark v={a} /></span>
                      <span className="text-neutral-500 mt-1">PDF Dark</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base"><Mark v={b} /></span>
                      <span className="text-neutral-500 mt-1">Ext. Chrome</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base"><Mark v={c} /></span>
                      <span className="text-neutral-500 mt-1">Otras</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What & why */}
        <section
          id="what"
          className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">
            ¿Qué es el modo oscuro para PDF?
          </h2>

          <h3 className="text-lg font-semibold text-neutral-100 mt-2 mb-3">
            La versión corta
          </h3>
          <p className="text-neutral-300 leading-relaxed">
            Es una forma de leer documentos PDF con fondo oscuro y texto claro
            en lugar de la página blanca por defecto. También se lo conoce como
            PDF modo nocturno, lector de PDF oscuro o PDF invertido — distintos
            nombres para lo mismo: un tema de poca luz incorporado en el archivo,
            así se mantiene oscuro en cualquier visor, no solo en el que lo abriste.
          </p>

          <h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">
            Por qué usar un PDF en modo oscuro
          </h3>
          <p className="text-neutral-300 leading-relaxed">
            La gente usa el modo oscuro en PDF para leer de noche y reducir el
            cansancio visual, para alargar la batería en pantallas OLED, para
            estudiar papers de investigación hasta tarde, y para que los
            documentos cargados de texto o código sean menos duros bajo luz
            brillante de oficina. Las extensiones del navegador pueden simular
            un tema oscuro dentro del visor, pero el archivo PDF subyacente
            sigue siendo claro. PDF Dark produce un PDF con tema oscuro real que
            puedes guardar, compartir y reabrir en cualquier lado — un PDF
            oscuro de verdad, no un truco del visor.
          </p>

          <h3 className="text-lg font-semibold text-neutral-100 mt-8 mb-3">
            Conversión, no solo un truco del visor
          </h3>
          <p className="text-neutral-300 leading-relaxed">
            Un buen lector en modo oscuro para PDF hace más que pintar la
            pantalla de oscuro — reescribe el archivo con los colores invertidos
            para que el documento se mantenga oscuro donde sea que lo abras. Con
            PDF Dark puedes leer en Chrome, Firefox, Safari o Edge, y luego
            llevar el archivo convertido a tu teléfono o e-reader. Nunca sale
            de tu dispositivo: toda la conversión ocurre en tu navegador
            mediante un Web Worker, así que nada se sube nunca.
          </p>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-3 text-center">
            Cómo leer un PDF en modo oscuro
          </h2>
          <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
            El texto y el fondo se invierten a un tema de poca luz mientras las
            imágenes reciben un tratamiento inteligente por separado — las fotos
            mantienen sus colores. Puedes empezar a leer en cuanto se renderiza
            la primera página.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Suelta tu PDF", d: "Arrastra y suelta, o haz clic para buscarlo. Nunca sale de tu navegador.", offset: "sm:translate-y-0" },
              { n: "2", t: "Elige un tema", d: "Midnight, Sepia, Solarized, u OLED negro puro — más sliders de oscuridad y calidez.", offset: "sm:-translate-y-2" },
              { n: "3", t: "Lee", d: "Pasa las páginas con el teclado, el tacto o los controles. ¿Necesitas un archivo para conservar? Usa el convertidor.", offset: "sm:translate-y-0" },
            ].map((s) => (
              <div
                key={s.n}
                className={`p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 transition-transform ${s.offset}`}
              >
                <div className="text-2xl font-bold text-amber-400">{s.n}</div>
                <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20"
        >
          <h2 className="text-2xl font-bold mb-10 text-center">
            Preguntas frecuentes
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f) => (
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
                  {f.link && (
                    <>
                      {" "}
                      <Link
                        href={f.link.href}
                        className="text-amber-400 hover:underline"
                      >
                        {f.link.text}
                      </Link>
                      .
                    </>
                  )}
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
