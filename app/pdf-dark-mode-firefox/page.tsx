import type { Metadata } from "next";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/pdf-dark-mode-firefox";
const TITLE = "PDF Dark Mode in Firefox — Beyond the about:config Hack";
const DESCRIPTION =
  "Firefox's PDF.js viewer only darkens the toolbar, not the page content. Here's the actual fix — convert any PDF to dark mode without tweaking about:config or installing extensions.";

export const metadata: Metadata = {
  title: `${TITLE} | PDF Dark`,
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

const FAQ = [
  {
    q: "Does Firefox have a built-in PDF dark mode?",
    a: "Partially. Firefox uses the PDF.js renderer, which supports a dark UI theme for the toolbar — but the actual page content still renders on a white background. There's no public preference to change the page canvas.",
  },
  {
    q: "What about the about:config pdfjs.viewerCssTheme hack?",
    a: "Setting pdfjs.viewerCssTheme to 2 does darken the toolbar and the area around the page, but the page itself stays white. It's a cosmetic fix, not a real one.",
  },
  {
    q: "Do Firefox dark-mode extensions help?",
    a: "Barely. Most Firefox extensions apply a CSS filter over the rendered PDF, which inverts images the same way it inverts text — you get photos as negatives and charts become unreadable. Dark Reader (the popular one) explicitly notes PDF support is limited.",
  },
  {
    q: "Why is this page using PDF.js too?",
    a: "Yes — we also use Mozilla's PDF.js for rendering. The difference is we render each page to a canvas, then apply a saturation-based color algorithm that treats text and images differently before reassembling the PDF. Same rendering library, very different post-processing.",
  },
  {
    q: "Does this work on Firefox for Android?",
    a: "Yes. Firefox on Android supports file upload and Web Workers. The conversion runs on your phone, saves to your Downloads folder, and the dark PDF opens in any reader afterwards.",
  },
  {
    q: "Is the original PDF uploaded anywhere?",
    a: "No. Everything runs in your Firefox tab. You can confirm this via Firefox DevTools (Ctrl/Cmd + Shift + E) — no upload request is made for the file.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Dark Mode for Firefox",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Firefox 90+ (desktop and Android)",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

export default function FirefoxVariantPage() {
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
            <span className="text-lg font-semibold hidden sm:inline">
              PDF Dark
            </span>
          </Link>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <Link href="/" className="hover:text-neutral-100">
              Home
            </Link>
            <a href="#why" className="hover:text-neutral-100">
              Why the gap
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            PDF Dark Mode in Firefox
            <span className="block text-amber-400 mt-2">
              Beyond the about:config Hack
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Firefox&apos;s PDF.js viewer only darkens the{" "}
            <em className="text-neutral-200">toolbar</em> — pages still render
            on white.{" "}
            <strong className="text-neutral-100">
              Drop your PDF below for an actual dark copy
            </strong>{" "}
            — no extensions, no config flags.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> No about:config edits
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Images stay in color
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Download as new PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Firefox Mobile
            </span>
          </div>

          <div className="mt-14">
            <Converter />
          </div>
        </section>

        {/* Why the gap */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why Firefox&apos;s dark mode stops at the toolbar
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              PDF.js is intentionally conservative with page rendering —
              here&apos;s why, and what actually works.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="font-semibold text-neutral-50 mb-1">
                  PDF.js renders the page faithfully
                </div>
                <p className="text-sm text-neutral-400">
                  PDF.js treats a PDF as authoritative — if the page background
                  is white, it paints white. That&apos;s the right default for
                  print/review work, but it&apos;s also why a
                  &ldquo;toggle&rdquo; dark mode would be contentious: Mozilla
                  would have to choose a color-inversion strategy that works
                  for every document in the world. They haven&apos;t.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="font-semibold text-neutral-50 mb-1">
                  <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">
                    about:config → pdfjs.viewerCssTheme
                  </code>
                </div>
                <p className="text-sm text-neutral-400">
                  This one comes up on every forum. Setting it to{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    2
                  </code>{" "}
                  darkens the <em>chrome</em> around the PDF — the toolbar,
                  the sidebar, the page border. The page canvas itself stays
                  white. It&apos;s a cosmetic fix dressed up as a feature.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="font-semibold text-neutral-50 mb-1">
                  Dark Reader and similar extensions
                </div>
                <p className="text-sm text-neutral-400">
                  These apply a CSS filter on top of the rendered page. The
                  result is the same as naive invert: photos become negatives,
                  diagrams get mangled, and PDFs with any non-white background
                  render unpredictably. Dark Reader itself notes limited PDF
                  support in its documentation.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <div className="font-semibold text-amber-400 mb-1">
                  What PDF Dark does differently
                </div>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Uses the same PDF.js underneath — so compatibility is
                    identical to Firefox
                  </li>
                  <li>
                    Post-processes each rendered page pixel by pixel, detecting
                    images by saturation before applying the theme
                  </li>
                  <li>
                    Produces a downloadable dark PDF — no about:config, no
                    extension, and no dependence on the Firefox session
                  </li>
                  <li>
                    The file never leaves your browser; check DevTools →
                    Network
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How to use in Firefox */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Using this tool in Firefox
          </h2>
          <ol className="space-y-5 text-neutral-300 list-decimal pl-6">
            <li>
              Scroll up to the drop zone, or refresh the page.
            </li>
            <li>
              Drop a PDF from your desktop, Downloads folder, or any file
              picker. Firefox will hand it to the page via the File API — no
              upload happens.
            </li>
            <li>
              The pages render in your tab. Pick a theme:{" "}
              <strong className="text-neutral-100">Midnight</strong>,{" "}
              <strong className="text-neutral-100">Sepia</strong>,{" "}
              <strong className="text-neutral-100">Solarized</strong>, or{" "}
              <strong className="text-neutral-100">OLED</strong>.
            </li>
            <li>
              Click <strong className="text-neutral-100">Download</strong>.
              Firefox saves the dark version to your Downloads folder. Open it
              in Firefox again or hand it off to another reader — it stays
              dark.
            </li>
          </ol>

          <p className="mt-8 text-sm text-neutral-500">
            Works on Firefox for Windows, macOS, Linux, and Android. Needs
            Firefox 90+ (Web Workers + OffscreenCanvas support).
          </p>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            FAQ
          </h2>
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60 transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer font-medium p-4 flex items-center justify-between list-none text-neutral-100">
                  <span>{f.q}</span>
                  <span
                    aria-hidden
                    className="text-neutral-500 transition-transform group-open:rotate-180 group-hover:text-amber-400"
                  >
                    ⌄
                  </span>
                </summary>
                <p className="px-4 pb-4 -mt-1 text-sm text-neutral-400">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
