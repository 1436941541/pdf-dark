import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/de/invert-pdf-colors";
const TITLE = "PDF-Farben invertieren — Online-Konverter ohne Upload";
const DESCRIPTION =
  "Invertieren Sie die Farben einer PDF und laden Sie die neue Datei herunter. Fotos können ihre Originalfarben behalten statt negativ zu werden. Kostenlos.";

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
  },
};

const FAQ = [
  {
    q: "Was genau entsteht beim Invertieren einer PDF?",
    a: "Eine komplett neue PDF, bei der die Farben im Seiteninhalt selbst umgekehrt sind — Hintergrund und Text vertauscht, Bilder je nach Ihrer Bildeinstellung behandelt. Öffnen Sie sie in Acrobat, in der Vorschau, im Browser oder auf einem E-Reader: überall sieht sie gleich aus, weil die Änderung in der Datei steckt und nicht in einer Einstellung des Viewers.",
  },
  {
    q: "Welche Einstellung ergibt eine mathematisch exakte Umkehrung?",
    a: "Das OLED-Design. Dort gilt für Graustufeninhalte exakt Ausgabe = 255 − Eingabe: reines Weiß wird reines Schwarz, reines Schwarz wird reines Weiß, und wenn Sie das Ergebnis erneut durchlaufen lassen, erhalten Sie das Original zurück. Midnight, Sepia und Solarized setzen den hellen Text stattdessen auf einen leicht getönten Hintergrund — angenehmer für lange Sitzungen, aber keine exakte Umkehrung.",
  },
  {
    q: "Kann eine PDF mit schwarzem Hintergrund wieder weiß werden?",
    a: "Ja. Weil die OLED-Abbildung symmetrisch ist, kommt ein dunkles Dokument hell wieder heraus: schwarze Flächen werden weiß, heller Text wird schwarz. Für den Druck ist das praktisch: ein dunkler Hintergrund frisst viel Toner, invertieren Sie ihn vorher weg.",
  },
  {
    q: "Werden Fotos zu Negativen?",
    a: "Nur wenn Sie es wollen. Der Auto-Modus belässt Fotos in ihren Originalfarben, kehrt weiße Screenshots und Diagramme um, damit sie zur Seite passen, und dunkelt sehr helle Bilder leicht ab. Stellen Sie Bilder auf Umkehren, um wirklich alles mit umzukehren, oder auf Original, um jedes Bild unangetastet zu lassen.",
  },
  {
    q: "Kann ich Text und Hintergrund invertieren, Bilder aber unangetastet lassen?",
    a: "Ja — stellen Sie Bilder auf Original. Jedes eingebettete Bild bleibt pixelgenau wie in der Quelle, auch ganzseitige Scans, und nur Text und Hintergrund werden umgekehrt. Kreisförmig beschnittene Bilder wie Profilfotos werden durch ihren runden Rahmen wiederhergestellt, sodass keine hellen Ecken auf der dunklen Seite stehen bleiben.",
  },
  {
    q: "Bleibt der Text in der invertierten PDF auswählbar?",
    a: "Ja, soweit die Originalseite das zulässt. Textseiten werden als Vektorobjekte neu eingefärbt, der ausgegebene Text bleibt also auswählbar und durchsuchbar. Gescannte Seiten sind von vornherein Bilder und werden entsprechend als Bilder invertiert.",
  },
  {
    q: "Kann ich die invertierte Version drucken?",
    a: "Ja — das ist einer der Hauptgründe, die Datei zu invertieren statt ein Design im Viewer einzustellen. Drucken Sie die heruntergeladene Datei aus einem beliebigen Reader, und die Seite kommt genau so heraus, wie Sie sie sehen.",
  },
  {
    q: "Gibt es eine Begrenzung der Dateigröße?",
    a: "Keine feste Grenze. Die Umwandlung läuft vollständig auf Ihrem Gerät, die praktische Grenze ist also der Arbeitsspeicher Ihres Browsers — große Dokumente dauern einfach länger.",
  },
  {
    q: "Wird meine PDF auf einen Server hochgeladen?",
    a: "Nein. Rendern, Invertieren und Neuaufbau der PDF passieren alle im Tab Ihres Browsers. Die heruntergeladene Datei wird lokal erzeugt — es gibt keinen Server, der Ihr Dokument je zu sehen bekommt.",
  },
  {
    q: "Kann ich die invertierte Datei an andere weitergeben?",
    a: "Ja. Per Mail verschicken, per AirDrop übertragen, in Google Drive oder Dropbox ablegen — wer sie erhält, sieht automatisch die invertierte Fassung. Es muss nichts eingestellt werden.",
  },
];

const STEPS = [
  {
    t: "Einstellungen wählen",
    d: "Legen Sie fest, wie weit die Umkehrung geht — Bilder: Original, Auto oder vollständig Umkehren — dazu Hintergrund, Dunkelheit und Wärme.",
  },
  {
    t: "PDF ablegen",
    d: "Per Drag-and-drop ablegen oder auf Ihrem Gerät auswählen. Die Datei verlässt den Browser nie.",
  },
  {
    t: "Invertierte PDF erhalten",
    d: "Die Umwandlung startet sofort und die neue Datei lädt von selbst herunter — mit den Farben im Dokument, bereit zum Teilen, Drucken oder Lesen, wo immer Sie wollen.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF-Farben invertieren",
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

export default function GermanInvertPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/de" className="flex items-center gap-2 hover:opacity-80">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold hidden sm:inline">PDF Dark</span>
          </Link>
          <nav className="text-sm text-neutral-400 flex gap-5 items-center">
            <Link href="/de" className="hover:text-neutral-100">PDF-Reader</Link>
            <a href="#faq" className="hover:text-neutral-100">FAQ</a>
            <LanguageSwitcher page="invert" current="de" />
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            PDF-Farben invertieren
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            PDF-Farben invertieren geht hier direkt: Einstellungen wählen,
            PDF ablegen — die invertierte Kopie lädt von selbst herunter. Die Farben stehen in der Datei selbst, sie bleibt
            also in jedem Viewer so: Acrobat, Vorschau, Browser, E-Reader.
            Kostenlos, und Ihre Datei verlässt den Browser nie.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Invertierte PDF herunterladen
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% im Browser
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 3 Bildmodi
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Mobil nutzbar
            </span>
          </div>

          <div className="mt-8">
            <Downloader locale="de" />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Nur lesen, keine Datei speichern?{" "}
            <Link href="/de" className="text-amber-400 hover:underline">
              PDF-Reader im Dunkelmodus öffnen
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
              So invertieren Sie die PDF-Farben
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Text und Hintergrund werden immer umgekehrt. Was mit den Bildern
              passiert, entscheiden Sie — dafür ist die Bildsteuerung da: Bilder
              unangetastet lassen, mit der Seite umkehren, oder jedes einzeln
              bewerten lassen.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div key={s.t} className="rounded-xl border border-neutral-800 p-5">
                  <div className="text-amber-400 font-bold text-lg">{i + 1}</div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <p className="text-sm text-neutral-400 mt-2">{s.d}</p>
                </div>
              ))}
            </div>

            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Was die Bildeinstellung ändert
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Text und Hintergrund werden in beiden Fällen umgekehrt. Beim
                Foto zeigt sich der Unterschied — und dort scheitert blindes
                Umkehren jedes einzelnen Pixels.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="PDF-Seite vor der Umkehrung: schwarzer Text auf weißem Hintergrund, dazu ein Farbfoto eines Sonnenuntergangs"
                      width={720}
                      height={933}
                      sizes="33vw"
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
                      alt="Dieselbe Seite nach einfacher Pixelumkehr — das Sonnenuntergangsfoto kippt in ein farbverfälschtes Negativ"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Jedes Pixel umgekehrt
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="Dieselbe Seite hier invertiert — Hintergrund und Text umgekehrt, das Sonnenuntergangsfoto behält seine Originalfarben"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Hier invertiert, Bilder: Auto
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-600 text-center">
                Echtes Ergebnis, kein Mockup: links die Quellseite, in der Mitte
                eine simple RGB-Umkehr jedes Pixels, rechts dieses Werkzeug im
                Auto-Modus (Design Midnight). Mit Bilder: Umkehren werden auch
                die Fotos zusammen mit der Seite invertiert — genau das, was ein Scan
                oder ein abfotografiertes Whiteboard braucht.
              </p>
            </div>
          </div>
        </section>

        {/* Why invert the file */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Warum die PDF-Farben invertieren statt den Viewer umzustellen?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Viewer-Designs, Browser-Erweiterungen und die Farbumkehr des
            Betriebssystems ändern nur, wie eine PDF aussieht, solange sie in
            dieser App geöffnet ist — die Datei selbst bleibt unverändert. Beim
            Invertieren entsteht eine{" "}
            <strong className="text-neutral-100">neue PDF</strong>: schicken Sie
            sie aufs Handy oder den E-Reader, geben Sie sie an Kolleginnen
            weiter, drucken oder archivieren Sie sie — die Farben reisen mit der
            Datei.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            Es gibt noch einen Unterschied, der zählt: wer eine PDF invertieren
            will, meint fast nie „alles umkehren“ — eine Umkehr auf Systemebene
            weiß aber nicht, was sie da umkehrt, also kommt jedes Foto,
            jede Grafik und jeder Screenshot als Negativ heraus. An der Datei zu
            arbeiten erlaubt es, jedes Bild einzeln zu bewerten — oder es ganz
            in Ruhe zu lassen. Wenn Sie nur heute Abend ein Dokument
            durchbekommen müssen, sparen Sie sich den Download und{" "}
            <Link href="/de" className="text-amber-400 hover:underline">
              lesen Sie es dunkel im Browser
            </Link>
            .
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Viewer / Erweiterung / Systemumkehr
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Nur umgekehrt, solange diese App oder Erweiterung aktiv ist</li>
                <li>In einem anderen Reader geöffnet, ist wieder alles hell</li>
                <li>Die invertierte Fassung lässt sich weder teilen noch drucken</li>
                <li>Kehrt Fotos, Screenshots und Grafiken mit um, ohne Ausnahme</li>
                <li>Geht beim Update oder Gerätewechsel verloren</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                Eine invertierte PDF-Datei
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Dauerhaft</strong> — die
                  Farben stehen in der Datei
                </li>
                <li>
                  Sieht in <strong className="text-neutral-100">jedem</strong>{" "}
                  PDF-Reader gleich aus, auf jedem Gerät
                </li>
                <li>
                  Teilbar — Mail, AirDrop, Drive, egal was; wer sie bekommt,
                  sieht die invertierte Fassung ohne eine einzige Einstellung
                </li>
                <li>
                  Steuerung pro Bild — Fotos behalten ihre Farben, während die
                  Seite ringsum umgekehrt wird
                </li>
                <li>
                  Farbtonerhaltende Abbildung — eine dunkelblaue Überschrift
                  wird hellblau, nicht grau
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            Anders gesagt: eine Erweiterung ist Schminke auf der PDF.
            PDF-Farben invertieren ergibt eine neue PDF.
          </p>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Wann sich das Invertieren der PDF-Farben lohnt
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Gescannte Dokumente und handschriftliche Notizen
              </h3>
              <p className="text-sm text-neutral-400">
                In einem Scan gibt es keine Textebene — die Handschrift <em>ist</em>{" "}
                das Bild. Stellen Sie Bilder auf Umkehren, dann dreht sich die
                ganze Seite und die Handschrift steht hell auf dunkel.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Eine dunkle PDF, die Sie drucken müssen
              </h3>
              <p className="text-sm text-neutral-400">
                Broschüren mit dunklem Design und exportierte Folien sind für
                jeden Drucker eine Zumutung. Einmal durch OLED geschickt, sind
                sie wieder schwarzer Text auf Weiß und druckfertig, ohne dass
                Sie etwas neu gestalten müssen — die Umkehrung funktioniert in
                beide Richtungen.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Fachtexte und Präsentationen voller Abbildungen
              </h3>
              <p className="text-sm text-neutral-400">
                Liniendiagramme, Schaltpläne, Notenblätter, technische
                Zeichnungen — schwarze Strichgrafik auf Weiß kehrt sich sauber
                um und bleibt lesbar. Auto übernimmt den gemischten Fall, wenn
                ein Aufsatz Diagramme und Fotos auf derselben Seite hat.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Nachts lesen, ohne die Bilder zu ruinieren
              </h3>
              <p className="text-sm text-neutral-400">
                Der übliche Grund, eine PDF zu invertieren, ist eine grelle
                Seite im dunklen Raum. Der übliche Grund, es wieder
                aufzugeben, sind Bilder, die als Negative herauskommen — genau
                der Fall, für den es den Auto-Modus gibt.
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
