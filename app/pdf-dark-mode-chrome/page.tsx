import type { Metadata } from "next";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/pdf-dark-mode-chrome";
const TITLE = "PDF Dark Mode in Chrome — Without Installing an Extension";
const DESCRIPTION =
  "Chrome's built-in PDF viewer has no dark mode toggle. Skip the extensions and their permissions — convert any PDF to dark mode right in your browser, free.";

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
    q: "Does Chrome have a built-in PDF dark mode?",
    a: "No. Chrome's PDF viewer (chrome://pdf) respects the OS dark theme for the toolbar only — the page content itself always renders on a white background. Google has been asked about this in the Chromium issue tracker for years without a fix.",
  },
  {
    q: "Do Chrome extensions like 'Dark Reader for PDF' work?",
    a: "Sort of. They apply a CSS invert filter, which makes text readable but usually breaks images (photos become negatives, charts get mangled). They also require broad permissions and most don't work on local PDF files unless you toggle 'Allow access to file URLs' manually.",
  },
  {
    q: "Is this faster than installing an extension?",
    a: "Yes. There's nothing to install — drop a PDF on this page and it converts in seconds. You also get a downloadable dark-themed PDF that you can reopen in any viewer later, not just Chrome.",
  },
  {
    q: "What happens to images in my PDF?",
    a: "They keep their original colors. Our algorithm detects image regions by pixel saturation and leaves them alone while it darkens the surrounding text and diagrams.",
  },
  {
    q: "Does it work on Chrome for Android?",
    a: "Yes. Chrome on Android supports file uploads, and the conversion runs in the phone's browser. The downloaded PDF is saved to your usual download folder.",
  },
  {
    q: "Is my PDF uploaded to your server?",
    a: "No. The entire conversion runs in your Chrome tab via the File API and a Web Worker. Open DevTools → Network while using the tool — you'll see no upload request.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Dark Mode for Chrome",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any Chrome-compatible browser",
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

export default function ChromeVariantPage() {
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
              Why not an extension
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
            PDF Dark Mode in Chrome
            <span className="block text-amber-400 mt-2">No Extension Needed</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Chrome&apos;s built-in PDF viewer has no dark mode toggle.{" "}
            <strong className="text-neutral-100">
              Skip the extensions and their permissions
            </strong>{" "}
            — drop your PDF below and get a dark-themed copy in seconds.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> No extension to install
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Images stay in color
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Download as new PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Mobile Chrome
            </span>
          </div>

          <div className="mt-14">
            <Converter />
          </div>
        </section>

        {/* Why not an extension */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why Chrome&apos;s PDF dark mode is broken
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              The shortest version: the viewer Google shipped is minimal, and
              the extensions trying to fix it come with baggage.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="font-semibold text-neutral-50 mb-1">
                  Chrome&apos;s built-in viewer
                </div>
                <p className="text-sm text-neutral-400">
                  Despite Chrome respecting your OS dark theme for the browser
                  UI, the embedded PDF viewer always renders pages on a white
                  background. There&apos;s no toggle in{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    chrome://settings
                  </code>
                  , no command-line flag, no user pref. It&apos;s been an open
                  issue in the Chromium bug tracker for years.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="font-semibold text-neutral-50 mb-1">
                  Extensions like &ldquo;Dark Reader for PDF&rdquo;
                </div>
                <p className="text-sm text-neutral-400 mb-3">
                  They apply a CSS invert filter over the page. This has three
                  concrete problems:
                </p>
                <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-neutral-200">
                      Photos become negatives.
                    </strong>{" "}
                    Skies turn orange, skin turns blue. Any image gets
                    color-flipped alongside the text.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      Local files need extra permission.
                    </strong>{" "}
                    You have to manually enable &ldquo;Allow access to file
                    URLs&rdquo; in{" "}
                    <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                      chrome://extensions
                    </code>
                    .
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      Broad site permissions.
                    </strong>{" "}
                    Most of these extensions request &ldquo;Read and change all
                    your data on the websites you visit.&rdquo; That&apos;s a
                    lot of trust for a color flip.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <div className="font-semibold text-amber-400 mb-1">
                  What PDF Dark does differently
                </div>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Runs on one webpage — no install, no extension permissions
                  </li>
                  <li>
                    Detects image regions by saturation so photos stay in
                    original color
                  </li>
                  <li>
                    Produces a downloadable dark-themed PDF that&apos;s dark in
                    every viewer, forever
                  </li>
                  <li>
                    Your file never leaves your browser — verify in DevTools →
                    Network
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How to use in Chrome */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Using this tool in Chrome
          </h2>
          <ol className="space-y-5 text-neutral-300 list-decimal pl-6">
            <li>
              Scroll back to the top of this page (or refresh) — the drop zone
              is right there.
            </li>
            <li>
              Drop a PDF from your desktop, or click to pick from File Explorer
              / Finder / Downloads.
            </li>
            <li>
              Pages render in Chrome&apos;s tab. Pick a theme:{" "}
              <strong className="text-neutral-100">Midnight</strong>,{" "}
              <strong className="text-neutral-100">Sepia</strong>,{" "}
              <strong className="text-neutral-100">Solarized</strong>, or{" "}
              <strong className="text-neutral-100">OLED</strong> (pure black,
              great on OLED laptops).
            </li>
            <li>
              Click <strong className="text-neutral-100">Download</strong>.
              Chrome saves the dark version to your usual Downloads folder.
              Reopen it anywhere — it stays dark forever.
            </li>
          </ol>

          <p className="mt-8 text-sm text-neutral-500">
            Works on Chrome on Windows, Mac, Linux, ChromeOS, and Android.
            Needs modern Chrome (v90+), which covers the last 4 years of
            releases.
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

      <footer className="w-full border-t border-neutral-900 mt-4">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} PDF Dark</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-neutral-300">Home</Link>
            <Link href="/about" className="hover:text-neutral-300">About</Link>
            <Link href="/privacy" className="hover:text-neutral-300">Privacy</Link>
            <Link href="/terms" className="hover:text-neutral-300">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
