import type { Metadata } from "next";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/invert-pdf-colors";
const TITLE = "Invert PDF Colors — Without Breaking Your Images";
const DESCRIPTION =
  "Invert a PDF's colors in your browser while keeping photos, charts, and diagrams in their original color. Free, no upload, downloads as a new PDF.";

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
    q: "What does 'invert PDF colors' actually do?",
    a: "It flips each pixel's color to its opposite — black becomes white, dark grey becomes light grey, and so on. The result is a PDF with a dark background and light text, which is easier on the eyes at night.",
  },
  {
    q: "Why do my photos look weird after inverting a PDF?",
    a: "Naive color inversion is applied to every pixel — including images. Photos become negatives (skies turn orange, skin turns blue), and charts with colored backgrounds get mangled. PDF Dark avoids this by detecting image regions via pixel saturation and leaving them alone.",
  },
  {
    q: "Is this reversible? Can I go back to the original?",
    a: "Yes — the conversion produces a new PDF. Your original file is never modified. Keep both if you want.",
  },
  {
    q: "Can I invert colors for a specific page only?",
    a: "Not yet — the inverter runs on the whole document. If you need per-page control, open the PDF in a desktop editor like PDF Expert after converting.",
  },
  {
    q: "Does this work on scanned PDFs?",
    a: "Yes — scanned pages are just images inside a PDF, and our algorithm treats them the same way. Handwriting and typed text become light-on-dark automatically.",
  },
  {
    q: "Is my PDF uploaded anywhere?",
    a: "No. The inversion runs entirely in your browser via the File API and a Web Worker. You can verify this by opening DevTools → Network — there is no upload request for the file.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invert PDF Colors",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser)",
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

export default function InvertPdfColorsPage() {
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
              Why it matters
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
            Invert PDF Colors
            <span className="block text-amber-400 mt-2">Without Breaking Your Images</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Flip a PDF to a dark background in seconds — but{" "}
            <strong className="text-neutral-100">keep photos, charts, and
            diagrams in their original color</strong>. Runs entirely in your
            browser. No upload, no signup.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% Browser-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Images stay in color
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Download as new PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Mobile
            </span>
          </div>

          <div className="mt-14">
            <Converter />
          </div>
        </section>

        {/* Why it matters — the differentiator */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why regular &ldquo;invert colors&rdquo; breaks your PDFs
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Most invert tools flip every pixel. That works for text but
              ruins everything else.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="text-sm font-semibold text-red-400 mb-2">
                  Naive invert
                </div>
                <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                  <li>Sky turns <span className="text-neutral-200">orange</span></li>
                  <li>Skin turns <span className="text-neutral-200">blue</span></li>
                  <li>Charts with colored backgrounds get mangled</li>
                  <li>Logos look like negatives of themselves</li>
                  <li>Scanned signatures become illegible</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <div className="text-sm font-semibold text-amber-400 mb-2">
                  PDF Dark&apos;s approach
                </div>
                <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                  <li>
                    <strong className="text-neutral-100">Detects images</strong>{" "}
                    by pixel saturation before inverting
                  </li>
                  <li>Text + diagrams get the dark treatment</li>
                  <li>Photos and color figures stay untouched</li>
                  <li>Four themes: Midnight / Sepia / Solarized / OLED</li>
                  <li>No trial-and-error — the result just looks right</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-neutral-500 text-center mt-8">
              The saturation threshold is tuned to catch photos (high color
              variation) while converting monochrome content (low color
              variation). See{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                our home page
              </Link>{" "}
              for a comparison against Chrome extensions and other tools.
            </p>
          </div>
        </section>

        {/* When to invert */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            When you&apos;d want to invert PDF colors
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                Reading long PDFs at night
              </div>
              <p className="text-sm text-neutral-400">
                White PDF backgrounds are painful in a dimly-lit room. Invert
                once, save the output, and keep that copy for any time you need
                to read after sunset.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                OLED phones and e-ink displays
              </div>
              <p className="text-sm text-neutral-400">
                Black pixels are literally &ldquo;off&rdquo; on OLED and save
                power. Pick the <strong className="text-neutral-100">OLED</strong> theme for
                pure blacks — brighter text, better battery, deeper contrast.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                Accessibility and low-vision reading
              </div>
              <p className="text-sm text-neutral-400">
                High-contrast light-on-dark is easier for many readers with
                astigmatism, migraine sensitivity, or low vision. Produces a
                persistent, shareable file — not just a setting someone has to
                rediscover every time.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                Sharing a &ldquo;night-friendly&rdquo; copy
              </div>
              <p className="text-sm text-neutral-400">
                Unlike an OS-level invert toggle, the inverted PDF is a real
                file you can email, AirDrop, or upload anywhere. The recipient
                sees the dark version in every viewer.
              </p>
            </div>
          </div>
        </section>

        <RelatedVariants currentSlug="invert-pdf-colors" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Invert PDF colors FAQ
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
