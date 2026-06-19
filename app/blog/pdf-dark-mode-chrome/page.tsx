import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-chrome";
const TITLE = "PDF Dark Mode in Chrome — Without Installing an Extension";
const DESCRIPTION =
  "Chrome's built-in PDF viewer has no dark mode toggle. Skip the extensions and their permissions — convert any PDF to dark mode right in your browser, free.";

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
        {/* Article hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            PDF Dark Mode in Chrome
            <span className="block text-amber-400 mt-2">No Extension Needed</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Chrome&apos;s built-in PDF viewer has no dark mode toggle.{" "}
            <strong className="text-neutral-100">
              Skip the extensions and their permissions
            </strong>{" "}
            — here&apos;s the cleaner way.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated June 19, 2026</span>
            <span aria-hidden>·</span>
            <span>8 min read</span>
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
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Chrome&apos;s built-in viewer
                </h3>
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
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Extensions like &ldquo;Dark Reader for PDF&rdquo;
                </h3>
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
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
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

        {/* How it works in Chrome */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            How PDF Dark works in Chrome
          </h2>
          <div className="space-y-8">
            <div>
              <div className="text-xs text-amber-400 font-semibold mb-1">
                Step 1
              </div>
              <h3 className="text-lg font-semibold text-neutral-50 m-0 mb-2">
                You drop a PDF on the home page
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                From the{" "}
                <Link href="/" className="text-amber-400 hover:underline">
                  PDF Dark home page
                </Link>
                , drag a PDF from your desktop or click to pick from File
                Explorer / Finder / Downloads. Chrome hands the file to the
                page via the File API — no upload happens, no extension is
                involved.
              </p>
            </div>

            <div>
              <div className="text-xs text-amber-400 font-semibold mb-1">
                Step 2
              </div>
              <h3 className="text-lg font-semibold text-neutral-50 m-0 mb-2">
                Pages render in your Chrome tab
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                PDF.js (Mozilla&apos;s JavaScript PDF renderer, which Chrome
                also relies on internally) parses the file and paints each
                page onto a canvas inside your browser tab. The full document
                stays in memory locally.
              </p>
            </div>

            <div>
              <div className="text-xs text-amber-400 font-semibold mb-1">
                Step 3
              </div>
              <h3 className="text-lg font-semibold text-neutral-50 m-0 mb-2">
                You pick a theme
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                Choose from{" "}
                <strong className="text-neutral-100">Midnight</strong>,{" "}
                <strong className="text-neutral-100">Sepia</strong>,{" "}
                <strong className="text-neutral-100">Solarized</strong>, or{" "}
                <strong className="text-neutral-100">OLED</strong> (pure black
                — best on OLED laptops). The dark-mode algorithm runs in a
                Web Worker so the toolbar and viewer stay smooth even on a
                100-page document.
              </p>
            </div>

            <div>
              <div className="text-xs text-amber-400 font-semibold mb-1">
                Step 4
              </div>
              <h3 className="text-lg font-semibold text-neutral-50 m-0 mb-2">
                You download the dark PDF
              </h3>
              <p className="text-neutral-300 leading-relaxed">
                Click <strong className="text-neutral-100">Download</strong>{" "}
                and Chrome saves the dark version to your usual Downloads
                folder. Reopen it anywhere — Acrobat, Preview, your phone,
                an e-reader — it stays dark forever, no per-app toggle
                needed.
              </p>
            </div>
          </div>

          <p className="mt-10 text-sm text-neutral-500">
            Works on Chrome on Windows, Mac, Linux, ChromeOS, and Android.
            Needs modern Chrome (v90+), which covers the last 4 years of
            releases.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Ready to read a PDF in dark mode on Chrome?
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            3 steps, no Chrome extension, no permissions
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a PDF on the PDF Dark home page and download the dark
            version — runs right in Chrome.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Try PDF Dark →
          </Link>
        </section>

        <RelatedVariants currentSlug="pdf-dark-mode-chrome" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode in Chrome FAQ
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
