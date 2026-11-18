import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/de/invert-pdf-colors";
const TITLE = "PDF-Farben invertieren kostenlos (Dunkelmodus & Druck)";
const DESCRIPTION =
  "PDF-Farben kostenlos im Browser invertieren: helle Seiten ohne Foto-Negative abdunkeln oder dunkle Vorlesungsfolien zum Drucken auf Weiß umkehren.";
const SOCIAL_IMAGE_ALT =
  "PDF-Farben invertieren im Browser: Dunkelmodus und heller Folien-Druckmodus";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SLUG,
    languages: {
      en: "/invert-pdf-colors",
      es: "/es/invert-pdf-colors",
      pt: "/pt/invert-pdf-colors",
      de: SLUG,
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

const FAQ = [
  {
    q: "Wie kehre ich eine schwarze oder dunkelblaue PDF zum Drucken auf Weiß um?",
    a: "Wählen Sie oben im Werkzeug Dunkel → Hell (Drucken) und legen Sie Ihre PDF ab. Schwarze, dunkelblaue und dunkelgrüne Tafel- oder Folienhintergründe werden zu Reinweiß (#FFFFFF), bereits weiße Deck- oder Aufgabenseiten bleiben weiß, und gelbe, türkise, blaue oder grüne Markierungen dunkeln im selben Farbton ab, damit Formeln auf Papier klar lesbar sind.",
  },
  {
    q: "Welche Einstellung im Dunkelmodus liefert eine exakte Graustufen-Umkehrung?",
    a: "Nutzen Sie das Design OLED mit Dunkelheit 100 % und Wärme 0 %. Für Graustufen gilt dort Ausgabe = 255 − Eingabe ohne den blauen oder warmen Grundton von Midnight, Sepia oder Solarized. Da gesättigte Farben ihren Farbton behalten und gerasterte Seiten als JPEG gespeichert werden, stellt ein zweiter Durchlauf die Originaldatei nicht Byte für Byte wieder her.",
  },
  {
    q: "Wie entscheidet Auto, welche Bilder umgekehrt und welche erhalten bleiben?",
    a: "Beim Abdunkeln heller Seiten prüft Auto Helligkeit und Sättigung jedes eingebetteten Bildes: Fotos behalten ihre Originalfarben, sehr helle farbige Abbildungen werden leicht gedimmt, und weiße Screenshots, Strichdiagramme sowie ganzseitige Scans (ab 85 % Seitenfläche) werden mit umgekehrt. Der Folien-Druckmodus kehrt dunkle Tafelbilder automatisch auf Weiß um und lässt eingefügte weiße Aufgabenkästen sowie normale Fotos unangetastet.",
  },
  {
    q: "Bleibt der Text in der heruntergeladenen PDF scharf und auswählbar?",
    a: "Auf kompatiblen Vektorseiten ohne invertierte Bilder färbt PDF Dark den PDF-Farbstrom direkt um (auch bei Handbüchern mit Kopierschutz ohne Öffnungspasswort). Schrift bleibt gestochen scharf, durchsuchbar und kompakt, statt auf das 15- bis 20-Fache anzuwachsen. Gescannte Seiten oder Seiten mit umgekehrten Bildern werden als JPEG bis Skalierung 1.5x (maximal 4096 px Kantenlänge und ~8,4 MP pro Seite) mit unsichtbarer Helvetica-Textebene für aufrechten lateinischen Text gespeichert, ohne OCR.",
  },
  {
    q: "Wird meine PDF auf einen Server hochgeladen oder in der Größe begrenzt?",
    a: "Es wird nichts hochgeladen. Seitenaufbau, Farbabbildung und PDF-Erzeugung laufen lokal in Ihrem Browser-Tab (mit Pixelberechnung im Hintergrund-Worker), ohne Registrierung, Wasserzeichen oder Stundenlimit. Die praktische Dateigröße hängt allein vom verfügbaren Arbeitsspeicher Ihres Geräts ab.",
  },
];

const STEPS = [
  {
    t: "Richtung & Design wählen",
    d: "Nutzen Sie Hell → Dunkel (Midnight, Sepia, Solarized oder OLED mit Bilder auf Auto, Original oder Umkehren) oder wechseln Sie für dunkle Folien in den Druckmodus.",
  },
  {
    t: "PDF lokal ablegen",
    d: "Datei per Drag-and-drop hineinziehen oder auswählen. Die Umwandlung läuft vollständig lokal im Browser-Tab ohne Upload.",
  },
  {
    t: "Neue PDF herunterladen",
    d: "Die fertige Datei speichert sich automatisch als -midnight.pdf, -oled.pdf oder -light.pdf, mit fest im Dokument hinterlegten Farben.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF-Farben invertieren",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    inLanguage: "de",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(app).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function GermanInvertPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/de" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">PDF Dark</span>
          </Link>
          <ResponsiveNavigation
            locale="de"
            desktopGap="wide"
            language={<LanguageSwitcher page="invert" current="de" />}
          >
            <Link href="/de" className="hover:text-neutral-100">
              PDF-Reader
            </Link>
          </ResponsiveNavigation>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            PDF-Farben invertieren
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Hier lassen sich PDF-Farben direkt im Browser invertieren und als
            neue Datei speichern: helle Dokumente abdunkeln, ohne Fotos in
            Negative zu verwandeln, oder im{" "}
            <strong className="text-neutral-100 font-medium">
              Folien-Druckmodus (Dunkel zu Hell)
            </strong>{" "}
            dunkle Vorlesungsfolien und Tafelnotizen tonersparend auf weißen
            Hintergrund umkehren.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Dunkelmodus &amp; Folien-Druck
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100 % im Browser
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Fotos ohne Negativ-Effekt
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Mobil &amp; Desktop
            </span>
          </div>

          <div className="mt-8">
            <Downloader locale="de" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Heute Abend nur lesen, ohne eine Kopie zu speichern?{" "}
            <Link href="/de" className="text-amber-400 hover:underline">
              PDF-Reader im Dunkelmodus öffnen
            </Link>
            .
          </p>
        </section>

        {/* How it works + two real comparisons */}
        <section
          id="how"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              So können Sie PDF-Farben invertieren
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Dieses Werkzeug schreibt Hintergrund- und Textfarben in beide
              Richtungen neu und bewertet eingebettete Fotos sowie
              Tafel-Screenshots getrennt.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div key={s.t} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-6">
                  <div className="text-amber-400 font-bold text-2xl">{i + 1}</div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <p className="text-sm text-neutral-400 mt-1">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Hell → Dunkel: was die Bildeinstellung bewirkt
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Text und Seitenhintergrund dunkeln in beiden Fällen ab. Am Foto
                zeigt sich, warum eine blinde RGB-Pixelumkehr illustrierte PDFs
                unbrauchbar macht.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="PDF-Seite vor dem Invertieren: schwarzer Text auf Weiß mit farbigem Sonnenuntergangsfoto"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Original-PDF
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/naive-invert.png"
                      alt="Dieselbe Seite nach einfacher RGB-Umkehrung mit blau verfärbtem Negativfoto"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Simple RGB-Umkehr
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="Dieselbe Seite hier mit Midnight und Bilder auf Auto verarbeitet: dunkler Hintergrund, echtes Foto"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Midnight + Bilder: Auto
                  </figcaption>
                </figure>
              </div>
            </div>

            <div className="mt-14 pt-12 border-t border-neutral-900">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Dunkle Vorlesungsfolien &amp; Tafelnotizen druckfertig machen
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Digitale Tafelaufschriebe nutzen oft dunkelblaue oder grüne
                Hintergründe mit gelber und türkiser Schrift. Eine simple
                RGB-Umkehr färbt das ganze Blatt beige ein und vertauscht
                Stiftfarben; der Druckmodus liefert Reinweiß und dunkle,
                farbtreue Tinte.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-source.webp"
                      alt="Dunkelblaue Smartboard-Vorlesungs-PDF mit weißen Gleichungen, gelben Kästen und türkisem Diagramm"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Dunkle Vorlesungs-PDF
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-naive.webp"
                      alt="Simple RGB-Umkehr mit beigem Seitenhintergrund und blau verfärbten gelben Formeln"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Simple RGB-Umkehr (getönt)
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/board-print.webp"
                      alt="Mit Dunkel zu Hell Drucken umgewandelt: reinweißes Papier und kräftig abgedunkelte Formelfarben"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Druckmodus (-light.pdf)
                  </figcaption>
                </figure>
              </div>
            </div>
          </div>
        </section>

        {/* Why invert the file */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Warum die PDF-Datei umfärben statt nur die Ansicht im Viewer?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Viewer-Designs, Browser-Erweiterungen und Betriebssystem-Filter
            ändern nur die Bildschirmanzeige in genau diesem Programm; die
            PDF-Datei selbst bleibt unverändert. Wenn Sie hier{" "}
            <strong className="text-neutral-100">PDF-Farben invertieren</strong>{" "}
            und eine neue Datei speichern, steckt das Ergebnis direkt in den
            Seiten: zum Lesen auf dem Tablet oder E-Reader, zum Teilen im
            Studium oder für den Ausdruck im Copyshop.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Eine systemweite Farbumkehr kippt außerdem jedes Foto, jedes
            Diagramm und jede farbige Folie ungefiltert ins Negativ. Durch die
            Verarbeitung der Datei selbst wird jedes eingebettete Bild separat
            klassifiziert oder unverändert übernommen.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Viewer / Erweiterung / Systemfilter
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Wirkt nur lokal, solange diese App oder Erweiterung läuft</li>
                <li>In Acrobat, auf dem Handy oder beim Drucken wieder im Originalzustand</li>
                <li>Erzeugt keine weiße Druckdatei aus dunklen Vorlesungsfolien</li>
                <li>Verwandelt eingebettete Fotos und Grafiken in Negative</li>
                <li>Geht beim Gerätewechsel oder Weiterleiten verloren</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                PDF mit gespeicherten Farbänderungen
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Fest in der Datei:</strong>{" "}
                  identische Darstellung in Acrobat, Vorschau, Mobilgeräten und im Druck
                </li>
                <li>
                  Beide Richtungen: helle Seiten abdunkeln oder dunkle Folien auf Reinweiß setzen
                </li>
                <li>
                  Bildgenaue Steuerung bewahrt echte Fotos und kehrt Diagramme sauber um
                </li>
                <li>
                  Farbtonerhaltende Abbildung für farbige Überschriften und Tafelmarkierungen
                </li>
                <li>
                  Vektorseiten werden direkt im PDF-Strom umgefärbt und bleiben scharf sowie schlank
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Typische Einsätze, wenn Sie PDF-Farben invertieren
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Dunkle Vorlesungsfolien und Skripte tonersparend drucken
              </h3>
              <p className="text-sm text-neutral-400">
                Skripte im Dark Mode und exportierte Smartboard-Tafelbilder
                verbrauchen beim Ausdrucken enorm viel Toner. Der Druckmodus
                setzt dunkle Hintergründe auf weißes Papier und dunkelt farbige
                Rechenwege lesbar ab.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Gescannte Dokumente und handschriftliche Aufschriebe
              </h3>
              <p className="text-sm text-neutral-400">
                In einem Scan liegt keine separate Textebene vor, da die Schrift
                Teil des Seitenbildes ist. Ganzseitige Scans werden im
                Auto-Modus automatisch mitgedreht; kleinere Notiz- oder
                Whiteboard-Ausschnitte kehren Sie über Bilder: Umkehren um.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Fachartikel und Präsentationen mit Diagrammen und Fotos
              </h3>
              <p className="text-sm text-neutral-400">
                Schaltpläne, Liniendiagramme, Notenblätter und technische
                Zeichnungen auf weißem Grund kehren sich im Auto-Modus sauber
                um, während Fotografien auf derselben Seite ihre natürlichen
                Farben behalten.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Abends auf Tablet oder Smartphone augenschonend lesen
              </h3>
              <p className="text-sm text-neutral-400">
                Grelle weiße Lehrbücher blenden im abgedunkelten Raum, besonders
                auf OLED-Displays. Mit einer gespeicherten Midnight- oder
                Sepia-Kopie lesen Sie entspannt in jeder nativen PDF-App.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Häufige Fragen
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

      <Footer locale="de" />
    </div>
  );
}
