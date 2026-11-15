import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/es/invert-pdf-colors";
const TITLE = "Invertir Colores PDF en Línea — Gratis y sin Subir Archivos";
const DESCRIPTION =
  "Invierte los colores de un PDF en línea y gratis: un PDF negativo con fondo negro y letras blancas, o al revés para imprimir. Las fotos conservan su color.";

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

const FAQ = [
  {
    q: "¿Cómo invierto los colores de un PDF en línea?",
    a: "Elige un tema arriba, arrastra tu PDF a la zona de carga y espera unos segundos: el PDF con los colores invertidos se descarga solo. No hace falta registrarse ni instalar nada, y funciona igual en Windows, Mac, Android o iPhone.",
  },
  {
    q: "¿Cómo invierto el fondo de un PDF de blanco a negro?",
    a: "Es justo lo que hace la herramienta: el fondo blanco pasa a negro (o al tono oscuro del tema que elijas) y el texto negro pasa a blanco. Si quieres un negro puro, usa el tema OLED; si prefieres algo más suave para leer mucho rato, Midnight o Sepia.",
  },
  {
    q: "¿Puedo pasar un PDF con fondo negro a fondo blanco para imprimirlo?",
    a: "Sí. La inversión con el tema OLED es simétrica: un PDF oscuro entra y sale con fondo blanco y letras negras. Sirve para imprimir presentaciones o apuntes con fondo negro sin gastar media tinta en una sola hoja.",
  },
  {
    q: "¿Qué opción da una inversión exacta, como un negativo?",
    a: "El tema OLED. Aplica exactamente salida = 255 − entrada a los tonos de gris: el blanco se vuelve negro, el negro se vuelve blanco, y si inviertes el resultado otra vez recuperas el original. Midnight, Sepia y Solarized usan un fondo con algo de color en lugar de un negativo exacto; cansan menos la vista, pero no son una inversión matemática.",
  },
  {
    q: "¿Las fotos se van a ver como negativos?",
    a: "Solo si tú quieres. El modo Auto, que viene activado, deja las fotos con sus colores originales, invierte las capturas y diagramas de fondo blanco para que no desentonen con la página y baja un poco el brillo de las imágenes muy claras. Con Imágenes en Invertir se invierte todo, fotos incluidas; con Original, ninguna imagen se toca.",
  },
  {
    q: "¿Puedo invertir solo el texto y el fondo, sin tocar las imágenes?",
    a: "Sí: pon Imágenes en Original. Cada imagen del PDF queda idéntica a la original, píxel por píxel, y solo cambian el texto y el fondo. Las fotos recortadas en círculo, como las de perfil, conservan su marco, así que no aparecen esquinas blancas sobre la página oscura.",
  },
  {
    q: "¿El texto del PDF invertido se puede seleccionar y buscar?",
    a: "Sí, siempre que el PDF original lo permita. Las páginas con texto se recolorean sin convertirlas en imagen, así que puedes seguir seleccionando, copiando y buscando palabras. Las páginas escaneadas ya son imágenes desde el principio y se invierten como tales.",
  },
  {
    q: "¿Mi PDF se sube a algún servidor?",
    a: "No. Todo el proceso ocurre dentro de la pestaña de tu navegador: abrir el PDF, invertir los colores y generar el archivo nuevo. Tu documento nunca sale de tu dispositivo, lo que importa si son contratos, apuntes de clase o documentos del trabajo.",
  },
  {
    q: "¿Hay límite de tamaño o de páginas?",
    a: "No hay un límite fijo. Como la conversión se hace en tu equipo, el único límite real es la memoria del navegador: un PDF grande simplemente tarda más. En el celular, los PDF escaneados muy pesados pueden quedarse sin memoria; en ese caso, mejor hazlo desde una computadora.",
  },
  {
    q: "¿El archivo invertido se ve igual en cualquier lector?",
    a: "Sí. Los colores nuevos quedan guardados dentro del PDF, no en una opción del visor. Ábrelo en Adobe Acrobat, en Chrome, en la app de Archivos del iPhone o en un lector de libros electrónicos y se verá igual. También lo puedes mandar por correo o WhatsApp y la otra persona lo verá invertido sin configurar nada.",
  },
];

const STEPS = [
  {
    t: "Elige el tema y las imágenes",
    d: "Escoge el fondo (OLED para negro puro, Midnight, Sepia o Solarized) y qué hacer con las fotos: Auto, Original o Invertir.",
  },
  {
    t: "Sube tu PDF",
    d: "Arrástralo a la zona de carga o haz clic para elegirlo. Se procesa en tu navegador, sin enviarlo a ningún servidor.",
  },
  {
    t: "Descarga el PDF invertido",
    d: "La conversión empieza sola y el archivo nuevo se descarga al terminar, listo para leer, compartir o imprimir.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invertir colores PDF",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
            <span className="text-lg font-semibold whitespace-nowrap">
              PDF Dark
            </span>
          </Link>
          <ResponsiveNavigation locale="es" desktopGap="wide" language={<LanguageSwitcher page="invert" current="es" />}>
            <Link href="/es" className="hover:text-neutral-100">
              Lector
            </Link>
          </ResponsiveNavigation>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          {/* Sin preposición a propósito: es la forma en que se busca
              («invertir colores pdf»), y la que usan las webs de herramientas
              en español para un rótulo. En prosa se usa la forma completa. */}
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Invertir colores PDF
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Invierte los colores de un PDF en línea y gratis: el fondo blanco
            pasa a negro y las letras negras a blanco, o al revés si necesitas
            imprimirlo. Obtienes un PDF negativo de verdad, que se ve igual en
            cualquier lector, y las fotos pueden conservar su color. Tu archivo
            no se sube a ningún servidor.
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
            ¿Solo quieres leer el PDF en modo oscuro, sin descargar nada?{" "}
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
              Son tres pasos y no necesitas cuenta. El texto y el fondo
              siempre se invierten; con las imágenes decides tú: dejarlas como
              están, invertirlas junto con la página o que la herramienta
              revise cada una.
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
                Qué pasa con las fotos al invertir un PDF
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                En las tres versiones el texto y el fondo están invertidos. La
                diferencia está en la foto: si se invierte cada píxel sin
                distinguir, el atardecer queda como un negativo.
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
                    Inversión simple de píxeles
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
                    Con PDF Dark, Imágenes: Auto
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-600 text-center">
                Capturas reales, no una simulación: a la izquierda la página
                original, al centro una inversión RGB de todos los píxeles y a
                la derecha el resultado de esta herramienta en Auto (tema
                Midnight). Si eliges Imágenes: Invertir, las fotos también se
                invierten, que es lo que conviene en un escaneo o en la foto de
                un pizarrón.
              </p>
            </div>
          </div>
        </section>

        {/* Why invert the file */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            ¿Por qué invertir los colores del archivo y no solo los del visor?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Hay dos formas de ver un PDF con los colores invertidos. La
            primera es cambiar la vista: el modo oscuro de un lector, una
            extensión del navegador o la inversión de colores del sistema. Solo
            afecta a esa pantalla, y el archivo sigue igual. La segunda es
            invertir el archivo, y eso es lo que hace esta herramienta: genera
            un <strong className="text-neutral-100">PDF nuevo</strong> con los
            colores ya cambiados, que puedes pasar al celular, mandar a un
            compañero, imprimir o guardar.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Esto también aplica a los lectores que traen su propia opción.{" "}
            <strong className="text-neutral-100">Adobe Acrobat y Adobe Reader</strong>{" "}
            permiten reemplazar los colores del documento, pero solo dentro de
            Acrobat: si se lo mandas a alguien, lo recibe en blanco.{" "}
            <strong className="text-neutral-100">Sumatra PDF</strong> puede
            invertir con la tecla <kbd className="px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-xs">i</kbd>{" "}
            o editando <code className="text-xs text-neutral-400">settings.txt</code>,
            pero el cambio se queda en ese programa. Ninguno modifica el
            archivo, así que no te sirven si necesitas imprimirlo, guardarlo o
            compartirlo invertido.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Hay otra diferencia: la inversión de colores del sistema no
            distingue qué hay en la pantalla, así que cada foto, gráfica y
            captura queda en negativo. Al trabajar sobre el archivo, cada
            imagen se trata por separado o se deja intacta. Si solo quieres
            leer un documento esta noche, no necesitas descargar nada:{" "}
            <Link href="/es" className="text-amber-400 hover:underline">
              ábrelo en modo oscuro en el navegador
            </Link>
            .
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Modo oscuro del visor, extensión o inversión del sistema
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Solo se ve invertido en esa app o con esa extensión</li>
                <li>En otro lector o dispositivo aparece el original</li>
                <li>No puedes compartir ni imprimir la versión invertida</li>
                <li>Fotos, capturas y gráficas quedan en negativo</li>
                <li>Hay que volver a configurarlo en cada equipo</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                Un PDF con los colores invertidos
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Permanente</strong>: los
                  colores quedan guardados en el archivo
                </li>
                <li>
                  Se ve igual en <strong className="text-neutral-100">cualquier</strong> lector
                  de PDF y en cualquier dispositivo
                </li>
                <li>
                  Se comparte por correo, WhatsApp o Drive, y quien lo recibe
                  lo ve invertido sin configurar nada
                </li>
                <li>
                  Control de imágenes: las fotos pueden conservar su color
                  aunque la página se invierta
                </li>
                <li>
                  Respeta los tonos: un título azul oscuro pasa a azul claro, no
                  a gris
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            En resumen: el modo oscuro del visor cambia cómo lo ves; invertir el
            archivo cambia el PDF.
          </p>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Para qué sirve invertir los colores de un PDF
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Leer de noche con fondo negro y letras blancas
              </h3>
              <p className="text-sm text-neutral-400">
                Una página blanca en un cuarto a oscuras deslumbra. Invertir el
                fondo del PDF a negro hace que leer de noche sea mucho más
                cómodo, y con el modo Auto las fotos y gráficas no se convierten
                en negativos.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Imprimir un PDF con fondo negro sin gastar tinta
              </h3>
              <p className="text-sm text-neutral-400">
                Las presentaciones y los apuntes con fondo oscuro gastan muchísima
                tinta o tóner. Con el tema OLED, el PDF vuelve a tener fondo
                blanco y letras negras, listo para imprimir sin editar nada: la
                inversión funciona en los dos sentidos.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Escaneos y apuntes a mano
              </h3>
              <p className="text-sm text-neutral-400">
                En un PDF escaneado no hay texto separado: la página entera es
                una imagen. Pon Imágenes en Invertir y se invierte completa, así
                la letra queda clara sobre fondo oscuro. No hace falta OCR.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Artículos, tesis y planos con muchas figuras
              </h3>
              <p className="text-sm text-neutral-400">
                Gráficas, diagramas, partituras y planos en negro sobre blanco se
                invierten limpios y siguen siendo legibles. Si en la misma página
                hay diagramas y fotos, el modo Auto invierte los primeros y deja
                las fotos con su color.
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
