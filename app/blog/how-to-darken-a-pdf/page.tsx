import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/how-to-darken-a-pdf";
const TITLE = "How to Darken a PDF — 3 Steps, No Install";
const DESCRIPTION =
  "Darken any PDF in your browser in three steps: drop the file, pick a dark theme, download the new file. Free, no upload, works offline.";

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
    q: "What does 'darken a PDF' actually mean here?",
    a: "We invert each page so the bright background becomes a dark color (your choice of Midnight, Sepia, Solarized, or OLED) and the originally-dark text becomes near-white. The result is a normal PDF file with dark pages baked in — it stays dark in every reader and on every device.",
  },
  {
    q: "Do I have to upload my PDF somewhere?",
    a: "No. The whole process runs in your browser using the File API and a Web Worker. The PDF never touches a server. Open DevTools → Network and you'll see zero upload requests during conversion.",
  },
  {
    q: "Is this free? Do I need an account?",
    a: "Free, no account, no email, no watermark, no page limit. It's a one-page web tool — drop the file, pick a theme, download.",
  },
  {
    q: "Which theme should I pick?",
    a: "Midnight (dark blue) is the most neutral choice for general reading. OLED (pure black) is best on OLED screens for battery savings and the deepest contrast. Sepia is warm and easy on the eyes for long sessions. Solarized is a popular developer color scheme — try them and switch instantly without re-uploading.",
  },
  {
    q: "Can I still select text in the darkened PDF?",
    a: "No. The output is image-based (one JPEG page per PDF page). Keep your original file if you need selectable text or OCR — use the darkened file just for comfortable reading.",
  },
  {
    q: "What about photos and color charts inside the PDF?",
    a: "Every pixel is brightness-mapped the same way: bright pixels move toward your theme color, dark pixels move toward white. Photos and color charts stay readable, but their colors will shift — for serious image fidelity, keep the original file.",
  },
  {
    q: "What's the largest PDF I can darken?",
    a: "There's no hard limit, but everything runs in your browser, so memory is the ceiling. Hundreds of pages work on a modern laptop. Phones may struggle with very large documents — try chunking if it stalls.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "How to Darken a PDF",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser)",
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Darken a PDF in 3 steps",
    description: DESCRIPTION,
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: "0" },
    tool: [{ "@type": "HowToTool", name: "A modern web browser" }],
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Drop your PDF",
        text: "Open PDF Dark and drag your PDF onto the drop zone, or click to choose a file from disk.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Pick a dark theme",
        text: "Switch between Midnight, Sepia, Solarized, and OLED to preview the darkened pages instantly.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download the darkened PDF",
        text: "Click Download to save a new PDF file with the dark theme baked in. Open it in any reader on any device.",
      },
    ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
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
            <span className="text-lg font-semibold hidden sm:inline">
              PDF Dark
            </span>
          </Link>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <Link href="/" className="hover:text-neutral-100">
              Home
            </Link>
            <a href="#steps" className="hover:text-neutral-100">
              Steps
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            How to Darken a PDF
            <span className="block text-amber-400 mt-2">
              in your browser
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            This guide walks through the three things you&apos;ll click — pick
            the file, pick a theme, save the result. The whole flow stays in
            the browser tab, so the PDF doesn&apos;t get uploaded anywhere.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated June 26, 2026</span>
            <span aria-hidden>·</span>
            <span>4 min read</span>
          </div>
        </section>

        {/* Steps */}
        <section
          id="steps"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              The three steps
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              From dropping the file to having the darkened PDF on disk usually
              takes well under a minute on a normal-sized document.
            </p>

            <ol className="space-y-5">
              <li className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-base">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold text-neutral-50 m-0 mt-0.5 text-lg">
                      Drop your PDF on the page
                    </h3>
                    <p className="text-sm text-neutral-400 mt-2">
                      Open the{" "}
                      <Link
                        href="/"
                        className="text-amber-400 hover:text-amber-300"
                      >
                        PDF Dark home page
                      </Link>{" "}
                      and drag the file onto the drop zone, or click to pick a
                      file from disk. The file is parsed in-browser with PDF.js
                      — nothing is uploaded.
                    </p>
                  </div>
                </div>
              </li>

              <li className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-base">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold text-neutral-50 m-0 mt-0.5 text-lg">
                      Pick a dark theme
                    </h3>
                    <p className="text-sm text-neutral-400 mt-2">
                      Toggle between <strong>Midnight</strong> (cool blue),{" "}
                      <strong>Sepia</strong> (warm amber),{" "}
                      <strong>Solarized</strong> (developer-popular teal), and{" "}
                      <strong>OLED</strong> (pure black, battery-friendly).
                      Switching is instant — the preview re-renders every page
                      using the same algorithm that goes into the download.
                    </p>
                  </div>
                </div>
              </li>

              <li className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="flex items-start gap-4">
                  <span className="shrink-0 w-9 h-9 rounded-full bg-amber-400 text-neutral-950 font-bold flex items-center justify-center text-base">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold text-neutral-50 m-0 mt-0.5 text-lg">
                      Download the darkened PDF
                    </h3>
                    <p className="text-sm text-neutral-400 mt-2">
                      Click Download. You get a standard PDF file with each page
                      stored as a darkened JPEG — opens dark in Acrobat,
                      Preview, Firefox, iPad, Kindle, anywhere. The dark theme
                      is part of the file now, not a viewer setting.
                    </p>
                  </div>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* Why this beats the alternatives */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            What people usually try first — and why it falls short
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Inverting colors in the OS
              </h3>
              <p className="text-sm text-neutral-400">
                macOS Smart Invert and Windows High Contrast affect the whole
                screen, distort photos, and only last as long as the toggle is
                on. They never produce a sharable file.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Installing a browser extension
              </h3>
              <p className="text-sm text-neutral-400">
                Dark Reader and friends only invert what the browser renders.
                The PDF is still light if you download it, email it, or open it
                in Acrobat tomorrow. Most extensions also request broad page
                permissions you probably don&apos;t want.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Uploading to a SaaS converter
              </h3>
              <p className="text-sm text-neutral-400">
                Most online converters upload your file, queue it on their
                servers, and email you a download. For a one-shot color flip,
                that&apos;s a lot of trust and a lot of waiting. PDF Dark runs
                entirely client-side — the file never leaves your machine.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-3">
            Try it on a PDF you&apos;ve been meaning to read
          </h2>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a file on the home page and switch between the themes — the
            preview re-renders right away so you can see which one feels right
            for that document before you save it.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Open PDF Dark →
          </Link>
        </section>

        <RelatedVariants currentSlug="how-to-darken-a-pdf" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            How to darken a PDF — FAQ
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
