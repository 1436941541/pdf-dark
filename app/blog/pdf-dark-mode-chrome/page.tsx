import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-chrome";
const TITLE = "PDF Dark Mode Chrome: 5 Ways Tested (No Extension)";
const DESCRIPTION =
  "Get PDF dark mode Chrome without extensions or inverted photos. Compare 5 Chrome methods, fix local file:// permissions, or convert free in a tab.";
const PUBLISHED = "2026-06-26";
const UPDATED = "2026-11-19";

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

type ChromeMethodRow = {
  method: string;
  href?: string;
  darkensPage: string;
  photos: string;
  localFiles: string;
  android: string;
  outsideChrome: string;
  highlight?: boolean;
};

const CHROME_METHODS: ChromeMethodRow[] = [
  {
    method: "chrome://flags/#enable-force-dark",
    darkensPage: "No (PDFium ignores web force-dark)",
    photos: "Untouched",
    localFiles: "Opens on white background",
    android: "Flag ignored on PDFs",
    outsideChrome: "No",
  },
  {
    method: "CSS filter extensions (Dark Reader, PDF Dark Mode)",
    darkensPage: "Yes (applies CSS invert over the viewer frame)",
    photos: "Turned into negatives unless masked",
    localFiles: "Blocked until Allow access to file URLs is enabled",
    android: "Not supported (no Web Store extensions on Android Chrome)",
    outsideChrome: "No (browser overlay only)",
  },
  {
    method: "Android 12+ built-in Chrome viewer",
    darkensPage: "No (themes outer toolbar and Edit controls only)",
    photos: "Untouched",
    localFiles: "Hands downloaded files to external Android apps",
    android: "Built in on Android 12+ for web links",
    outsideChrome: "No",
  },
  {
    method: "PDF Dark in-tab reader",
    href: "/",
    darkensPage: "Yes (Midnight, Sepia, Solarized, OLED + sliders)",
    photos: "Kept in original color (Images: Auto)",
    localFiles: "Opens immediately via drag-and-drop (no extension permissions)",
    android: "Works in mobile Chrome and Incognito",
    outsideChrome: "Live tab view (open Settings -> Invert & download → to export)",
    highlight: true,
  },
  {
    method: "PDF Dark file inverter",
    href: "/invert-pdf-colors",
    darkensPage: "Yes (rewrites PDF color instructions or scan pixels)",
    photos: "Kept in original color (Images: Auto)",
    localFiles: "Converts immediately via drag-and-drop",
    android: "Works in desktop and Android Chrome",
    outsideChrome: "Yes (saves <filename>-<theme>.pdf that opens dark everywhere)",
    highlight: true,
  },
];

const FAQ = [
  {
    q: "Why won't Chrome on Android open PDF links directly in Incognito mode?",
    a: "Chrome's built-in Android 12+ PDF viewer disables inline viewing inside Incognito tabs and prompts you to download the file instead. Once downloaded, you can open the dark mode reader on our homepage inside an Incognito tab and drop the local PDF in.",
    link: { href: "/", label: "Open dark mode reader" },
  },
  {
    q: "Pure black backgrounds with bright white letters still hurt my eyes. Can I soften the contrast?",
    a: "Yes. Pick Midnight (rgb(25, 30, 45)) instead of OLED (#000000), drag Darkness (50%–100%) left for a lighter charcoal background, or drag Warmth (0%–100%) right for an amber candle-light tint.",
  },
  {
    q: "Will a 500-page textbook freeze my Chrome tab?",
    a: "The in-tab reader keeps only pages near your current scroll position rendered in memory and releases distant pages automatically. When exporting a permanent copy in /invert-pdf-colors, vector pages recolor in place without storing page JPEGs; keep the Chrome tab active in the foreground until <filename>-midnight.pdf finishes saving.",
  },
  {
    q: "Does dropping a PDF into a Chrome tab upload my file to a server?",
    a: "No. Page parsing, color mapping, and PDF export all run locally inside your Chrome tab's memory. Open Chrome DevTools (F12 -> Network) during conversion and you will see zero network requests carrying document data.",
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
    image: `${site}/blog/pdf-dark-mode-chrome/chrome-pdf-dark.webp`,
    author: { "@type": "Organization", name: "PDF Dark Team" },
    datePublished: PUBLISHED,
    dateModified: UPDATED,
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to get PDF dark mode Chrome without an extension",
    description: DESCRIPTION,
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: [{ "@type": "HowToTool", name: "Google Chrome (desktop or Android)" }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Open the in-tab inverter or reader",
        text: "Open /invert-pdf-colors in a desktop or Android Chrome tab (or open / to read live in the tab without saving a new file).",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Choose theme and Auto image protection",
        text: "Pick Midnight, Sepia, Solarized, or OLED, keep Images on Auto, and adjust Darkness or Warmth if needed.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Drop your PDF to save automatically",
        text: "Drop any local or downloaded PDF onto the box; Chrome converts it in memory and saves <filename>-midnight.pdf automatically.",
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

export default function PdfDarkModeChromePage() {
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
            PDF Dark Mode Chrome: 5 Ways to Read PDFs at Night (Tested)
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-6">
            Chrome&apos;s built-in PDFium viewer ignores your browser appearance
            setting: the tab strip and top bar turn charcoal, yet every document
            page still renders on bright white paper. To get PDF dark mode
            Chrome without installing extensions or flipping textbook
            photographs into X-ray negatives, open your document in the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              in-tab dark mode reader
            </Link>{" "}
            for live reading or save a dark copy in the{" "}
            <Link
              href="/invert-pdf-colors"
              className="text-amber-400 hover:underline"
            >
              PDF color inverter
            </Link>
            . Both run locally inside desktop and Android Chrome tabs with zero
            file uploads.
          </p>

          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-amber-400 text-neutral-950 rounded-full text-sm font-semibold hover:bg-amber-300 transition-colors"
            >
              Open in-tab dark reader →
            </Link>
            <Link
              href="/invert-pdf-colors"
              className="inline-block px-5 py-2.5 border border-neutral-700 text-neutral-100 rounded-full text-sm font-medium hover:border-amber-400/60 hover:text-amber-300 transition-colors"
            >
              Export a permanent dark PDF →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            How to get PDF dark mode Chrome without an extension
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
              in a desktop or Android Chrome tab (or open{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                <code>/</code>
              </Link>{" "}
              to read live in the tab without saving a new file).
            </li>
            <li>
              Pick <code>Midnight</code>, <code>Sepia</code>,{" "}
              <code>Solarized</code>, or <code>OLED</code>, keep{" "}
              <code>Images</code> on <code>Auto</code>, and adjust{" "}
              <code>Darkness</code> or <code>Warmth</code> if needed.
            </li>
            <li>
              Drop any local or downloaded PDF onto the box; Chrome converts it
              in memory and saves <code>&lt;filename&gt;-midnight.pdf</code>{" "}
              (named after your chosen theme) automatically.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            5 Chrome PDF dark mode options compared
          </h2>
          <p className="mb-5">
            Every option below works inside Chrome without installing a separate
            desktop PDF app. Here is how each one handles page backgrounds,
            embedded photos, local disk files, and mobile tabs.
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Chrome method
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Darkens PDF page?
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Embedded photos
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Local <code>file://</code> PDFs
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Android Chrome
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Stays dark outside Chrome?
                  </th>
                </tr>
              </thead>
              <tbody>
                {CHROME_METHODS.map((r) => (
                  <tr
                    key={r.method}
                    className={
                      r.highlight
                        ? "bg-amber-400/5 border-b border-amber-400/20 last:border-b-0"
                        : "border-b border-neutral-900 last:border-b-0"
                    }
                  >
                    <td className="px-4 py-3.5 align-top font-medium text-neutral-100">
                      {r.href ? (
                        <Link
                          href={r.href}
                          className="text-amber-400 hover:underline"
                        >
                          {r.method}
                        </Link>
                      ) : (
                        r.method
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.darkensPage}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.photos}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.localFiles}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.android}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.outsideChrome}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            Why Chrome extensions turn textbook photos into negatives
          </h2>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/blog/pdf-dark-mode-chrome/chrome-pdfium.webp"
                  alt="Default desktop Chrome PDFium viewer rendering a white PDF page with black text and a color portrait photograph"
                  width={966}
                  height={1282}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                1. Default Chrome PDFium: dark toolbar, glaring white page
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/blog/pdf-dark-mode-chrome/chrome-css-filter.webp"
                  alt="The same PDF under a CSS invert filter in Chrome: dark page background, but the portrait photograph turns into an inverted negative"
                  width={966}
                  height={1282}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                2. CSS filter extension: dark page, photo flipped into a negative
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/blog/pdf-dark-mode-chrome/chrome-pdf-dark.webp"
                  alt="The same PDF opened in a Chrome tab with PDF Dark Midnight theme and Auto image mode: dark slate page, crisp white text, and natural color photograph"
                  width={966}
                  height={1282}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                3. PDF Dark in Chrome: Midnight page, natural photo colors kept
              </figcaption>
            </figure>
          </div>
          <p className="mb-12">
            Chrome isolates open PDFs inside an{" "}
            <code>&lt;embed type=&quot;application/pdf&quot;&gt;</code> plugin
            frame instead of standard HTML elements. Because extension
            stylesheets cannot inspect individual paragraphs or images inside
            PDFium, dark-mode extensions wrap the entire{" "}
            <code>&lt;embed&gt;</code> frame in a CSS <code>invert()</code>{" "}
            filter, flipping photographs, medical scans, and color-coded charts
            into negatives right alongside the white paper. Opening the document
            in a regular Chrome tab with{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF Dark
            </Link>{" "}
            parses the page structure directly in JavaScript, locates every
            image bounding box before painting, keeps photographs in original
            color, and inverts bright white diagrams.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            Fixing extensions on local files and Google Drive
          </h2>
          <ul className="list-disc pl-6 space-y-3 mb-12">
            <li>
              <span className="text-neutral-100 font-medium">
                Local <code>file:///</code> PDFs stay white after installing an
                extension:
              </span>{" "}
              Chrome blocks extensions from local disk paths by default. Open{" "}
              <code>chrome://extensions</code>, click <code>Details</code> on
              your dark-mode extension, turn on{" "}
              <code>Allow access to file URLs</code>, and reload the local PDF
              tab.
            </li>
            <li>
              <span className="text-neutral-100 font-medium">
                Google Drive PDF preview or locked work/school Chrome:
              </span>{" "}
              Google Drive renders PDFs inside its own web overlay rather than
              Chrome&apos;s PDFium viewer, and enterprise-managed Chrome
              profiles often block Web Store installs altogether. Download the
              PDF once and drop it into{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                <code>/</code>
              </Link>{" "}
              or{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                <code>/invert-pdf-colors</code>
              </Link>{" "}
              inside a regular tab.
            </li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-50 mb-6">
            Frequently asked questions
          </h2>
          {FAQ.map((f) => (
            <div key={f.q} className="mb-7">
              <h3 className="text-lg font-semibold text-neutral-50 mb-2">
                {f.q}
              </h3>
              <p className="text-neutral-400">
                {f.a}
                {f.link && (
                  <>
                    {" "}
                    <Link
                      href={f.link.href}
                      className="text-amber-400 hover:underline"
                    >
                      {f.link.label} →
                    </Link>
                  </>
                )}
              </p>
            </div>
          ))}
        </article>

        <RelatedVariants currentSlug="pdf-dark-mode-chrome" />
      </main>

      <Footer />
    </div>
  );
}
