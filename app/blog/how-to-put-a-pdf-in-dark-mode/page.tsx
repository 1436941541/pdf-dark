import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/how-to-put-a-pdf-in-dark-mode";
const TITLE = "How to Put a PDF in Dark Mode: Browser, Mac, iOS, Adobe";
const DESCRIPTION =
  "Learn how to put a PDF in dark mode permanently in any browser (photos kept in color), or use the built-in toggles in Acrobat, macOS 26+, and iOS 26+.";
const PUBLISHED = "2026-06-26";
const UPDATED = "2026-11-18";

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

const BUILTIN_PATHS = [
  {
    viewer: "Adobe Acrobat Reader (Windows & Mac)",
    path: "Menu (or Acrobat) -> Preferences (Ctrl+K / Cmd+K) -> Accessibility -> check Replace Document Colors -> choose Use High-Contrast Colors (White text on black) or Custom Color",
    catchNote:
      "Uncheck Only change the color of black text or line art, otherwise colored headings and shaded callout boxes fail to recolor",
    scansAndSharing: "Viewer-only; flat scanned pages often stay white",
  },
  {
    viewer: "Apple Preview (macOS Tahoe 26+)",
    path: "Open the PDF in Preview -> top menu bar View -> Use Dark Appearance for PDF",
    catchNote:
      "Requires macOS 26 (Tahoe) or newer; macOS 15 Sequoia and earlier have no PDF page dark toggle in Preview",
    scansAndSharing: "Viewer-only; flat image scans stay white",
  },
  {
    viewer: "Files & Apple Books (iOS / iPadOS 26+)",
    path: "In Files, tap More (...) -> Dark Background; in Books, tap the page -> Themes & Settings -> dark theme",
    catchNote:
      "Requires iOS / iPadOS 26 or newer; older iPhones and iPads leave PDF pages white",
    scansAndSharing: "Viewer-only; resets when shared via Mail or AirDrop",
  },
  {
    viewer: "Chrome, Edge, Android, or older OS versions",
    path: "Open /invert-pdf-colors to save a dark copy, or / to read live in a tab",
    catchNote:
      "Runs in browser memory; keep the tab active while converting multi-hundred-page books",
    scansAndSharing: "Yes: darkens scanned pages too and saves a permanent .pdf",
    highlight: true,
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
    image: `${site}/blog/how-to-put-a-pdf-in-dark-mode/exported-dark-pdf.webp`,
    author: { "@type": "Organization", name: "PDF Dark Team" },
    datePublished: PUBLISHED,
    dateModified: UPDATED,
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to put a PDF in dark mode permanently (3 steps)",
    description: DESCRIPTION,
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: [{ "@type": "HowToTool", name: "A modern web browser" }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Pick a dark theme",
        text: "Open /invert-pdf-colors in any browser and select Midnight, Sepia, Solarized, or OLED.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Keep Images on Auto",
        text: "Leave Images set to Auto so photographs stay in color and white diagrams invert, then adjust Darkness or Warmth if desired.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Drop your PDF to download",
        text: "Drop your PDF onto the drop zone; your browser saves <filename>-midnight.pdf automatically with zero server upload.",
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

export default function HowToDarkenPdfPage() {
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
            How to Put a PDF in Dark Mode (Permanent File or Built-In Settings)
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-6">
            PDF files bake a white canvas into every page, so enabling OS dark
            mode darkens only your app&apos;s outer menus and leaves the
            document glaring white. When deciding how to put a PDF in dark mode,
            choose between two routes: rewrite the <code>.pdf</code> file itself
            in a browser tab with the{" "}
            <Link
              href="/invert-pdf-colors"
              className="text-amber-400 hover:underline"
            >
              PDF color inverter
            </Link>{" "}
            so it stays dark on every device and scanned page, or flip the
            hidden document-color setting inside the viewer already installed on
            your Mac, iPhone, or PC.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/invert-pdf-colors"
              className="inline-block px-5 py-2.5 bg-amber-400 text-neutral-950 rounded-full text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              Create a permanent dark PDF →
            </Link>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 border border-neutral-700 text-neutral-100 rounded-full text-sm font-medium hover:border-amber-400/60 hover:text-amber-300 transition-colors"
            >
              Read in dark mode without saving →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            How to put a PDF in dark mode permanently (3 steps)
          </h2>
          <ol className="list-decimal pl-6 space-y-3 mb-12">
            <li>
              Open the{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                PDF color inverter
              </Link>{" "}
              in any browser and select <code>Midnight</code>,{" "}
              <code>Sepia</code>, <code>Solarized</code>, or <code>OLED</code>.
            </li>
            <li>
              Leave <code>Images</code> set to <code>Auto</code> so photographs
              stay in color and white diagrams invert, then adjust{" "}
              <code>Darkness</code> or <code>Warmth</code> if desired.
            </li>
            <li>
              Drop your PDF onto the drop zone; your browser saves{" "}
              <code>&lt;filename&gt;-midnight.pdf</code> (suffixed with your
              chosen theme) automatically with zero server upload.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            Built-in dark mode paths on Adobe, Mac, and iPhone
          </h2>
          <p className="mb-5">
            If you only need a temporary dark view on your own screen and do not
            want to save a second file, use the built-in document toggle on your
            device. Check the OS version and checkbox details below.
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-4">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Device or viewer
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Exact menu path
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Crucial catch
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Works on scans or shared files?
                  </th>
                </tr>
              </thead>
              <tbody>
                {BUILTIN_PATHS.map((r) => (
                  <tr
                    key={r.viewer}
                    className={
                      r.highlight
                        ? "bg-amber-400/5 border-b border-amber-400/20 last:border-b-0"
                        : "border-b border-neutral-900 last:border-b-0"
                    }
                  >
                    <td className="px-4 py-3.5 align-top font-medium text-neutral-100">
                      {r.viewer}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.highlight ? (
                        <>
                          Open{" "}
                          <Link
                            href="/invert-pdf-colors"
                            className="text-amber-400 hover:underline"
                          >
                            <code>/invert-pdf-colors</code>
                          </Link>{" "}
                          to save a dark copy, or{" "}
                          <Link
                            href="/"
                            className="text-amber-400 hover:underline"
                          >
                            <code>/</code>
                          </Link>{" "}
                          to read live in a tab
                        </>
                      ) : (
                        r.path
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.catchNote}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.scansAndSharing}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-neutral-400 mb-12">
            If you want to install a dedicated third-party desktop, Linux, or
            Android reader instead, see our{" "}
            <Link
              href="/blog/pdf-reader-dark-mode-comparison"
              className="text-amber-400 hover:underline"
            >
              12-viewer dark mode comparison
            </Link>
            .
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            What a permanently darkened PDF looks like
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/blog/how-to-put-a-pdf-in-dark-mode/source-white-pdf.webp"
                  alt="Original white PDF report with dark text and a color studio portrait photo before conversion"
                  width={966}
                  height={1282}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before: standard white-page PDF
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/blog/how-to-put-a-pdf-in-dark-mode/exported-dark-pdf.webp"
                  alt="Exported -midnight.pdf file opened directly in a default viewer: dark blue-gray background, selectable light text, and untouched color portrait"
                  width={966}
                  height={1282}
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                After: exported -midnight.pdf opens dark in any default viewer,
                photo intact
              </figcaption>
            </figure>
          </div>
          <p className="mb-12">
            Viewer toggles only repaint your screen inside that single app;
            attach the PDF to an email or open it on a tablet and the pages turn
            white again. Exporting through{" "}
            <Link
              href="/invert-pdf-colors"
              className="text-amber-400 hover:underline"
            >
              <code>/invert-pdf-colors</code>
            </Link>{" "}
            rewrites the PDF&apos;s own color instructions into your chosen dark
            theme so the file opens dark in stock Preview, Chrome, Gmail
            attachments, or e-readers, and <code>Images: Auto</code> keeps
            embedded photographs in natural color instead of flipping them into
            negatives.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-6">
            Frequently asked questions
          </h2>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Why did Adobe Acrobat on the web stay white after I enabled Dark
              Mode?
            </h3>
            <p className="text-neutral-400">
              Acrobat on the web (<code>acrobat.adobe.com</code>) only changes
              its outer menus and sidebars when you select Dark theme. Document
              page recoloring (<code>Replace Document Colors</code>) exists only
              in the installed desktop Acrobat app, or you can recolor the{" "}
              <code>.pdf</code> directly in your browser at{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                <code>/invert-pdf-colors</code>
              </Link>
              .
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Can I still highlight text and press <code>Ctrl+F</code> in the
              darkened PDF?
            </h3>
            <p className="text-neutral-400">
              Yes. Standard digital pages keep their original vector text,
              clickable links, and bookmarks at any zoom level. Scanned or
              complex gradient pages receive an invisible searchable text layer
              (on upright pages in English and Western European languages) so
              copy and search keep working.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Which dark theme is easiest on the eyes for long reading sessions?
            </h3>
            <p className="text-neutral-400">
              <code>Midnight</code> (<code>rgb(25, 30, 45)</code>) avoids the
              bright glare of pure white text on pitch black; <code>OLED</code>{" "}
              (<code>#000000</code>) shuts off background pixels on OLED phones
              and tablets; <code>Sepia</code> (<code>rgb(40, 35, 25)</code>)
              gives a warm amber tone; <code>Solarized</code> (
              <code>rgb(0, 43, 54)</code>) uses a muted teal base. Before
              dropping your file, you can also lower <code>Darkness</code> (
              <code>50%–100%</code>) or raise <code>Warmth</code> (
              <code>0%–100%</code>).
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              What if I want darker black text on a white page for printing (or
              white paper on dark lecture slides)?
            </h3>
            <p className="text-neutral-400">
              Use{" "}
              <Link
                href="/pdf-to-black-and-white"
                className="text-amber-400 hover:underline"
              >
                PDF to Black and White
              </Link>{" "}
              (<code>1–254</code> threshold) to crisp up faded gray scan text
              without filling letter loops, or{" "}
              <Link
                href="/whiten-pdf-background"
                className="text-amber-400 hover:underline"
              >
                Whiten PDF Background
              </Link>{" "}
              to clean gray copier paper. To print dark-background lecture
              slides without wasting black toner, switch{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                <code>/invert-pdf-colors</code>
              </Link>{" "}
              to <code>Dark → Light (Print)</code> so dark boards snap to{" "}
              <code>#FFFFFF</code> white.
            </p>
          </div>
        </article>

        <RelatedVariants currentSlug="how-to-put-a-pdf-in-dark-mode" />
      </main>

      <Footer />
    </div>
  );
}
