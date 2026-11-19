import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/scanned-pdf-dark-mode";
const TITLE = "Scanned PDF Dark Mode: Read Scans at Night (Keep OCR)";
const DESCRIPTION =
  "Turn any scanned PDF dark for night reading right in your browser. Normalizes yellowed paper and spine shadows, keeps existing OCR search, zero upload.";
const PUBLISHED = "2026-06-26";
const UPDATED = "2026-11-17";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SLUG },
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

const SCAN_CONTROLS = [
  {
    control: "Images: Auto (default)",
    behavior:
      "Detects any single image covering 85% or more of the page as a full-page scan and darkens it automatically; also inverts smaller clean white scan blocks",
    when: "Standard full-page book, handout, and receipt scans",
  },
  {
    control: "Images: Invert",
    behavior:
      "Forces every raster image on the page through dark-mode mapping regardless of margin width or yellow paper tint",
    when: "Scans centered inside wide white PDF borders (< 85% page coverage) with heavy yellow or gray staining",
  },
  {
    control: "Images: Original",
    behavior:
      "Leaves detected full-page scans untouched and darkens only digital text pages",
    when: "Mostly digital reports that contain a few scanned signature or certificate appendices you want kept as-is",
  },
  {
    control: "OLED (#000000) vs Midnight (rgb(25, 30, 45))",
    behavior:
      "OLED maximizes text contrast and turns off pixels on OLED phones; Midnight reduces white-on-black halation during multi-hour study sessions",
    when: "Pick OLED in a dark bedroom or on faded gray ink; pick Midnight on desktop monitors (avoid Sepia on yellowed scans, where warm-on-warm lowers contrast)",
  },
];

const PRINT_ROUTING = [
  {
    problem: "Bright white or yellowed scan glares on screen at night",
    toolLabel: "Invert PDF Colors",
    toolHref: "/invert-pdf-colors",
    toolMode: " (Light → Dark)",
    changes:
      "Maps bright paper and spine shadows to OLED or Midnight and flips dark ink to crisp near-white",
  },
  {
    problem: "Gray copier haze or uneven book-gutter shading wastes toner",
    toolLabel: "Whiten PDF Background",
    toolHref: "/whiten-pdf-background",
    toolMode: "",
    changes:
      "Lifts gray scan paper to pure #FFFFFF white and protects embedded photos and color stamps",
  },
  {
    problem: "Faded pencil or light-gray scan text prints too faintly",
    toolLabel: "PDF to Black and White",
    toolHref: "/pdf-to-black-and-white",
    toolMode: "",
    changes:
      "Converts pages with a live 1–254 threshold so faint strokes turn solid black without filling loops in e, o, and p",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const article = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    url: `${site}${SLUG}`,
    description: DESCRIPTION,
    image: `${site}/blog/scanned-pdf-dark-mode/scanned-after.webp`,
    author: { "@type": "Organization", name: "PDF Dark Team" },
    datePublished: PUBLISHED,
    dateModified: UPDATED,
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to turn on scanned PDF dark mode (3 steps)",
    description: DESCRIPTION,
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: [{ "@type": "HowToTool", name: "A modern web browser" }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Select OLED or Midnight",
        text: "Open /invert-pdf-colors and select OLED (pure #000000 black) or Midnight (rgb(25, 30, 45) slate).",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Set Images mode for your scan",
        text: "Leave Images on Auto for full-page scans, or switch Images to Invert if wide white borders surround small, yellowed page crops.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Drop the scanned PDF to save",
        text: "Drop your scanned PDF onto the drop zone; your browser saves <filename>-oled.pdf or <filename>-midnight.pdf automatically without uploading the file.",
      },
    ],
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </>
  );
}

export default function ScannedPdfDarkModePage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />

      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">
              PDF Dark
            </span>
          </Link>
          <ResponsiveNavigation locale="en" desktopGap="wide">
            <Link href="/" className="hover:text-neutral-100">
              Home
            </Link>
          </ResponsiveNavigation>
        </div>
      </header>

      <main className="flex-1 w-full">
        <article className="max-w-3xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-50 leading-tight mb-4">
            Scanned PDF Dark Mode: Darken Scanned Pages Without Losing OCR
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-6">
            Standard dark-mode toggles in Adobe Acrobat and macOS Preview
            restyle text and vector backgrounds, so an old book chapter or
            photocopied handout stored as flat page images stays blindingly
            white. Getting scanned PDF dark mode to work requires remapping the
            page pixels themselves. You can convert a scan into a uniform dark
            PDF in the{" "}
            <Link
              href="/invert-pdf-colors"
              className="text-amber-400 hover:underline"
            >
              PDF color inverter
            </Link>{" "}
            and keep any existing OCR search layer intact, or preview themes
            live in the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode reader
            </Link>
            .
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/invert-pdf-colors"
              className="inline-block px-5 py-2.5 bg-amber-400 text-neutral-950 rounded-full text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              Convert a scanned PDF now →
            </Link>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 border border-neutral-700 text-neutral-100 rounded-full text-sm font-medium hover:border-amber-400/60 hover:text-amber-300 transition-colors"
            >
              Preview scan in reader →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            How to turn on scanned PDF dark mode (3 steps)
          </h2>
          <ol className="list-decimal pl-6 space-y-3 mb-12">
            <li>
              Open{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                <code>/invert-pdf-colors</code>
              </Link>{" "}
              and select <code>OLED</code> (pure <code>#000000</code> black) or{" "}
              <code>Midnight</code> (<code>rgb(25, 30, 45)</code> slate).
            </li>
            <li>
              Leave <code>Images</code> on <code>Auto</code> for full-page
              scans, or switch <code>Images</code> to <code>Invert</code> if
              wide white borders surround small, yellowed page crops.
            </li>
            <li>
              Drop your scanned PDF onto the drop zone; your browser saves{" "}
              <code>&lt;filename&gt;-oled.pdf</code> or{" "}
              <code>&lt;filename&gt;-midnight.pdf</code> automatically without
              uploading the file.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            Before and after on a yellowed, shadowed scan
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/blog/scanned-pdf-dark-mode/scanned-before.webp"
                  alt="Scanned book page before conversion: off-white yellowed paper with a dark spine shadow along the left margin"
                  width={900}
                  height={1165}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before: uneven yellowed scan with gutter shadow
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/blog/scanned-pdf-dark-mode/scanned-after.webp"
                  alt="The same scanned PDF page converted with Midnight theme and Auto image mode: uniform dark slate paper and crisp light serif text"
                  width={900}
                  height={1165}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                After: Midnight theme pulls aged paper to dark slate and softens
                margin glare
              </figcaption>
            </figure>
          </div>
          <p className="mb-5">
            Luminance mapping pulls pure white, aged cream paper, and light gray
            copier haze toward the same target background, so a book scan whose
            paper tint drifts across chapters reads as one calm surface. Match
            the <code>Images</code> toggle and theme to how your scan was
            captured:
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[660px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Control &amp; option
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    How it treats scanned pages
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    When to choose it
                  </th>
                </tr>
              </thead>
              <tbody>
                {SCAN_CONTROLS.map((r) => (
                  <tr
                    key={r.control}
                    className="border-b border-neutral-900 last:border-b-0"
                  >
                    <td className="px-4 py-3.5 align-top font-medium text-neutral-100 whitespace-nowrap">
                      {r.control}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.behavior}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.when}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            Why reader dark modes fail on scans (and how OCR search survives)
          </h2>
          <p className="mb-5">
            When you export a document from Word, each page stores explicit fill
            and text-color commands that apps like Adobe Acrobat (
            <code>Replace Document Colors</code>) or macOS Tahoe Preview (
            <code>Use Dark Appearance for PDF</code>) can swap on the fly. A
            scanned page contains none of those commands; it is a single
            full-page image. Acrobat also enables{" "}
            <code>Only change the color of black text or line art</code> by
            default, which tells it to skip scanned page images completely.
          </p>
          <p className="mb-12">
            Many university, legal, and archive scans (such as JSTOR papers)
            pair that page image with a hidden OCR text layer so you can press{" "}
            <code>Ctrl+F</code> and copy citations. Most image-based dark
            converters flatten every page into a bare JPEG and wipe out that
            hidden text. PDF Dark extracts the existing OCR text positions and
            places an invisible searchable text layer back over the darkened
            scan (see{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              how the conversion pipeline works
            </Link>{" "}
            for technical details). Search and copy keep working on upright
            horizontal text in English and Western European languages; rotated
            pages, vertical text, and non-Latin scripts such as CJK, Cyrillic,
            or Greek math symbols are skipped.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            Night reading vs darkening a faint scan for print
          </h2>
          <p className="mb-5">
            People searching to &ldquo;darken a scanned PDF&rdquo; are split
            between two opposite tasks: making bright paper dark for night
            reading on a screen, or making washed-out gray text blacker on white
            paper for printing. Pick the tool built for your target output:
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Scan problem
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Right browser tool
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    What it changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRINT_ROUTING.map((r) => (
                  <tr
                    key={r.problem}
                    className="border-b border-neutral-900 last:border-b-0"
                  >
                    <td className="px-4 py-3.5 align-top font-medium text-neutral-100">
                      {r.problem}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <Link
                        href={r.toolHref}
                        className="text-amber-400 hover:underline font-medium"
                      >
                        {r.toolLabel}
                      </Link>
                      {r.toolMode && (
                        <span className="text-neutral-400">{r.toolMode}</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.changes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-6">
            Frequently asked questions
          </h2>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Do I need to run OCR on my scanned PDF before darkening it?
            </h3>
            <p className="text-neutral-400">
              No. Darkening remaps the page pixels directly, so un-OCR&apos;d
              camera or flatbed scans convert right away for night reading. They
              remain image-only files unless you run OCR separately beforehand.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Will a 300-page scanned book crash my browser?
            </h3>
            <p className="text-neutral-400">
              On a laptop or desktop, pages convert one at a time and release
              temporary page memory after each sheet, so multi-hundred-page
              scans finish reliably (oversized sheets are capped at{" "}
              <code>4,096 px</code> per side). On phones, open
              multi-hundred-page scans in the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                dark mode reader
              </Link>{" "}
              instead of exporting the whole bitmap file: the reader holds only
              pages near your scroll position in memory and releases distant
              pages automatically.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Are confidential scanned contracts or medical records uploaded
              anywhere?
            </h3>
            <p className="text-neutral-400">
              Never. Every step runs locally inside your browser tab, and no
              file bytes leave your device.
            </p>
          </div>
        </article>

        <RelatedVariants currentSlug="scanned-pdf-dark-mode" />
      </main>

      <Footer />
    </div>
  );
}
