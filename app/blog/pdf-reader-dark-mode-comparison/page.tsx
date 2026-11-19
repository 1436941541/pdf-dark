import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-reader-dark-mode-comparison";
const TITLE = "PDF Reader Dark Mode Comparison: 12 Viewers Tested";
const DESCRIPTION =
  "Side-by-side PDF reader dark mode comparison across Acrobat, Foxit, Sumatra, PDFgear, macOS 26 Preview, iOS 26, ReadEra, Zathura, Chrome, and Firefox.";
const PUBLISHED = "2026-07-29";
const UPDATED = "2026-11-16";

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

type ReaderRow = {
  name: string;
  platforms: string;
  pageDarkMode: string;
  photos: string;
  scans: string;
  scanLink?: { href: string; label: string };
  savesDarkPdf: string;
  highlight?: boolean;
};

const READERS: ReaderRow[] = [
  {
    name: "Adobe Acrobat Reader",
    platforms: "Win, Mac, iOS, Android",
    pageDarkMode:
      "Yes (Accessibility override on desktop; Night Mode on mobile)",
    photos: "Preserved",
    scans: 'Desktop skips scans if "Only black text" stays checked',
    savesDarkPdf: "No (app display)",
  },
  {
    name: "Foxit PDF Reader",
    platforms: "Win, Mac, iOS, Android",
    pageDarkMode: "Yes (Night Mode + Accessibility colors)",
    photos: "Preserved",
    scans: "Text pages darken; raw image scans stay white",
    savesDarkPdf: "No (display toggle)",
  },
  {
    name: "SumatraPDF",
    platforms: "Windows",
    pageDarkMode: "Yes (i key invert or custom GradientColors)",
    photos: "Inverted into negatives under i",
    scans: "Yes (i flips all scan pixels)",
    savesDarkPdf: "No (local view)",
  },
  {
    name: "PDFgear",
    platforms: "Win, Mac, iOS, Android",
    pageDarkMode: "Partial (soft gray or warm page tint, not black)",
    photos: "Preserved",
    scans: "Light tint only; bright scans still glare",
    savesDarkPdf: "No (theme preset)",
  },
  {
    name: "Apple Preview",
    platforms: "macOS Tahoe 26+",
    pageDarkMode:
      "Yes (Use Dark Appearance for PDF; absent on macOS 15 and older)",
    photos: "Preserved",
    scans: "No (flat scanned pages stay white)",
    savesDarkPdf: "No (Preview window)",
  },
  {
    name: "Apple Files & Books",
    platforms: "iOS / iPadOS 26+",
    pageDarkMode: "Yes (Dark Background; absent on iOS 18 and older)",
    photos: "Preserved",
    scans: "No on raw image scans",
    savesDarkPdf: "No (device view)",
  },
  {
    name: "ReadEra / MJ PDF",
    platforms: "Android",
    pageDarkMode: "Yes (built-in Night toggle)",
    photos: "Inverted in full-canvas night modes",
    scans: "Yes (pixel inversion darkens scans)",
    savesDarkPdf: "No (app view)",
  },
  {
    name: "Zathura / Okular",
    platforms: "Linux",
    pageDarkMode: "Yes (Ctrl+R recolor / Invert Colors)",
    photos: "Inverted into negatives by default",
    scans: "Yes (full-page pixel recolor)",
    savesDarkPdf: "No (session view)",
  },
  {
    name: "Chrome built-in viewer",
    platforms: "Desktop, Android 12+",
    pageDarkMode: "No (darkens outer UI bar only; page stays white)",
    photos: "Not applicable",
    scans: "No",
    scanLink: {
      href: "/blog/pdf-dark-mode-chrome",
      label: "full Chrome breakdown",
    },
    savesDarkPdf: "No",
  },
  {
    name: "Firefox (PDF.js)",
    platforms: "Win, Mac, Linux",
    pageDarkMode: "Hidden (about:config pdfjs.forcePageColors + hex codes)",
    photos: "Canvas override can alter figures or flash white on scroll",
    scans: "Partial (canvas override)",
    savesDarkPdf: "No (about:config)",
  },
  {
    name: "Microsoft Edge",
    platforms: "Win, Mac",
    pageDarkMode:
      "No per-PDF toggle (browser-wide edge://flags force-dark only)",
    photos: "Distorted by experimental flag",
    scans: "Distorted if flag is forced",
    savesDarkPdf: "No (edge://flags)",
  },
  {
    name: "PDF Dark",
    platforms: "Any modern browser",
    pageDarkMode: "Yes (Midnight, Sepia, Solarized, OLED + Darkness / Warmth)",
    photos: "Preserved automatically (Images: Auto)",
    scans: "Yes (normalizes yellowed scans; keeps existing Latin OCR search)",
    savesDarkPdf: "Yes: live reader + exports <filename>-<theme>.pdf",
    highlight: true,
  },
];

const EXTENSION_ROWS = [
  {
    approach: "Dark Reader",
    cost: "Free and open source",
    localFiles:
      "Blocked until you enable Allow access to file URLs in browser extension settings",
    photos: "Whole-frame filter on browser PDF viewers flips photos into negatives",
    shared: "Desktop and supported mobile browsers only; file stays white",
  },
  {
    approach: "Night Eye",
    cost: "Commercial (3-month free trial, then paid plan; Lite tier capped by site count)",
    localFiles: "Requires manual local-file permission in Chromium browsers",
    photos:
      "Offers Dark and Filtered modes, still constrained by browser PDF frame rendering",
    shared: "Browser extension only; file stays white",
  },
  {
    approach: "Native desktop readers (Foxit, Acrobat, Preview)",
    cost: "Free reader tiers",
    localFiles: "Opens directly from disk",
    photos: "Preserves photos on digital PDFs",
    shared: "Resets to white outside that app; fails on raw scans",
  },
  {
    approach: "PDF Dark file inverter",
    href: "/invert-pdf-colors",
    cost: "Free, no account, runs locally",
    localFiles: "Drag-and-drop from disk with zero browser permissions",
    photos: "Images: Auto preserves photos and darkens scans",
    shared:
      "Yes: exports <filename>-<theme>.pdf that opens dark in any app on any OS",
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
    author: { "@type": "Organization", name: "PDF Dark Team" },
    datePublished: PUBLISHED,
    dateModified: UPDATED,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
    />
  );
}

export default function ComparisonPage() {
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
            PDF Reader Dark Mode Comparison: 12 Apps &amp; Browsers Tested
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            5 min read
          </p>

          <p className="text-lg mb-6">
            Some PDF apps advertise night reading yet only darken their outer
            window chrome; others invert the entire page canvas and turn
            photographs into blue negatives. This PDF reader dark mode
            comparison checks 12 desktop, mobile, Linux, and browser viewers
            across four practical criteria: page-canvas darkening, color photo
            preservation, scanned PDF support, and whether the dark theme stays
            with the <code>.pdf</code> file when shared.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 mb-12">
            <p className="text-sm font-semibold text-neutral-100 mb-3">
              Quick picks by platform:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-neutral-300">
              <li>
                <span className="text-neutral-100 font-medium">
                  Windows desktop:
                </span>{" "}
                Foxit PDF Reader for text PDFs with photos; SumatraPDF (
                <code>i</code> key) for fast keyboard toggling on text-only
                files.
              </li>
              <li>
                <span className="text-neutral-100 font-medium">
                  macOS (Tahoe 26 and newer):
                </span>{" "}
                Built-in Apple Preview for digital PDFs; leaves flat image scans
                white.
              </li>
              <li>
                <span className="text-neutral-100 font-medium">
                  iPhone &amp; iPad (iOS / iPadOS 26+):
                </span>{" "}
                Built-in Files or Apple Books (<code>Dark Background</code>) for
                native documents without extra apps.
              </li>
              <li>
                <span className="text-neutral-100 font-medium">
                  Android &amp; Linux:
                </span>{" "}
                ReadEra or open-source MJ PDF on Android; Zathura (
                <code>Ctrl+R</code> recolor) on Linux.
              </li>
              <li>
                <span className="text-neutral-100 font-medium">
                  Any browser, scanned PDFs, or shared files:
                </span>{" "}
                <Link href="/" className="text-amber-400 hover:underline">
                  PDF Dark
                </Link>{" "}
                to read in a tab with photos kept in color, or{" "}
                <Link
                  href="/invert-pdf-colors"
                  className="text-amber-400 hover:underline"
                >
                  <code>/invert-pdf-colors</code>
                </Link>{" "}
                to save a dark <code>.pdf</code> that opens dark in every viewer
                below.
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            Full PDF reader dark mode comparison table
          </h2>
          <p className="mb-5">
            Every viewer below was verified for supported operating systems,
            page-canvas recoloring, embedded photograph fidelity, scanned PDF
            behavior, and whether the setting is local to that app or saved into
            the document. For exact menu click-paths on your current device, see
            our{" "}
            <Link
              href="/blog/how-to-put-a-pdf-in-dark-mode"
              className="text-amber-400 hover:underline"
            >
              step-by-step PDF dark mode guide
            </Link>
            .
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Reader
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Platforms
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Page dark mode?
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Color photos
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Scanned PDFs
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Saves dark <code>.pdf</code>?
                  </th>
                </tr>
              </thead>
              <tbody>
                {READERS.map((r) => (
                  <tr
                    key={r.name}
                    className={
                      r.highlight
                        ? "bg-amber-400/5 border-b border-amber-400/20 last:border-b-0"
                        : "border-b border-neutral-900 last:border-b-0"
                    }
                  >
                    <td
                      className={
                        "px-4 py-3.5 align-top font-semibold whitespace-nowrap " +
                        (r.highlight ? "text-amber-400" : "text-neutral-100")
                      }
                    >
                      {r.name}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.platforms}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.pageDarkMode}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.photos}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.scans}
                      {r.scanLink && (
                        <>
                          {" ("}
                          <Link
                            href={r.scanLink.href}
                            className="text-amber-400 hover:underline"
                          >
                            {r.scanLink.label}
                          </Link>
                          {")"}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.highlight ? (
                        <>
                          Yes: live reader (
                          <Link
                            href="/"
                            className="text-amber-400 hover:underline"
                          >
                            <code>/</code>
                          </Link>
                          ) + exports <code>&lt;filename&gt;-&lt;theme&gt;.pdf</code> (
                          <Link
                            href="/invert-pdf-colors"
                            className="text-amber-400 hover:underline"
                          >
                            <code>/invert-pdf-colors</code>
                          </Link>
                          )
                        </>
                      ) : (
                        r.savesDarkPdf
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The trade-off in almost every reader: photos vs scans
          </h2>
          <p className="mb-12">
            Look across the <code>Color photos</code> and{" "}
            <code>Scanned PDFs</code> columns above and a structural split
            stands out. Viewers such as Adobe Acrobat, Foxit, macOS 26 Preview,
            and iOS 26 Files recolor text and vector backgrounds without
            touching embedded images: photographs stay natural, yet flat scanned
            pages remain glaring white. Whole-canvas pixel inverters such as
            SumatraPDF (<code>i</code>), Zathura, and ReadEra&apos;s night
            filter flip every rendered pixel instead. Scans turn dark right
            away, yet every face, chart, and photo becomes a color negative.
            Avoiding both failure modes requires inspecting each image on the
            page: a single image covering <code>85%+</code> of a page is
            darkened as a scan, and smaller photographs stay in original color.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            Dark Reader vs Night Eye vs rewriting the PDF file
          </h2>
          <p className="mb-5">
            If you mostly open PDFs inside a desktop browser, two popular
            extensions often come up alongside dedicated apps. Their licensing,
            local-file rules, and image handling differ sharply:
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Approach
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Cost &amp; license
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Local <code>file://</code> PDFs
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Embedded photos
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Works when shared or on mobile?
                  </th>
                </tr>
              </thead>
              <tbody>
                {EXTENSION_ROWS.map((r) => (
                  <tr
                    key={r.approach}
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
                          {r.approach}
                        </Link>
                      ) : (
                        r.approach
                      )}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.cost}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.localFiles}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.photos}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-300">
                      {r.shared}
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
              Why does PDFgear&apos;s dark mode look grayish-white or warm
              instead of black?
            </h3>
            <p className="text-neutral-400">
              PDFgear&apos;s eye-care background presets tint the page soft gray
              or warm beige rather than deep charcoal or <code>#000000</code>.
              That cuts daytime glare slightly, though the page still shines
              brightly in an unlit room.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              What works on macOS 15 Sequoia (or older) and iOS 18 (or older)?
            </h3>
            <p className="text-neutral-400">
              On macOS 15 and iOS 18, which lack Apple&apos;s newer PDF dark
              toggles, install Foxit or Acrobat Reader, or convert the document
              once at{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                <code>/invert-pdf-colors</code>
              </Link>{" "}
              so <code>&lt;filename&gt;-midnight.pdf</code> opens dark inside
              your existing Preview and Files apps.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              Is pure black (OLED) or dark blue-gray (Midnight) better for
              reading PDFs at night?
            </h3>
            <p className="text-neutral-400">
              <code>OLED</code> (<code>#000000</code>) turns off background
              pixels completely on OLED phones and tablets. On desktop LCD
              monitors, or if bright white letters cause astigmatism halation
              against pitch black, <code>Midnight</code> (
              <code>rgb(25, 30, 45)</code>) or dialing the{" "}
              <code>Darkness</code> slider (<code>50%–100%</code>) down to{" "}
              <code>80%–90%</code> is noticeably softer.
            </p>
          </div>
        </article>

        <RelatedVariants currentSlug="pdf-reader-dark-mode-comparison" />
      </main>

      <Footer />
    </div>
  );
}
