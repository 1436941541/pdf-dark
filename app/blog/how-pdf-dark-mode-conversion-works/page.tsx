import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/how-pdf-dark-mode-conversion-works";
const TITLE = "How PDF Dark Mode Conversion Works — Under the Hood";
const DESCRIPTION =
  "Vector recoloring, per-image detection, hue-preserving color mapping, and a per-page fallback chain — how PDF Dark actually converts a PDF to dark mode, explained.";
const PUBLISHED = "2026-07-17";
const UPDATED = "2026-07-29";

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
    q: "Which PDFs get the vector treatment, and which fall back?",
    a: "Files exported from Word, Google Docs, LaTeX, browsers ('Print to PDF'), and most e-book pipelines declare their colors in plain RGB, grayscale, or CMYK — those recolor as vectors, keeping text selectable and razor-sharp. Design and print-shop files that use spot colors, gradients, color patterns, or indexed palettes fall back to the raster path for that page. Scanned pages are images by nature and always take the raster path.",
  },
  {
    q: "Why not just invert every pixel? It sounds simpler.",
    a: "It is simpler — and it's what most tools do. But pixel inversion turns photos into film negatives, locks text at screen resolution (blurry when zoomed), destroys text selection, and bloats file size. Rewriting the PDF's own color instructions avoids all four problems at once.",
  },
  {
    q: "How do you find the images on a page?",
    a: "The PDF's drawing instructions are read directly: every image placement is declared in the file along with its transform matrix, so we compute each image's exact position — including whether it's cropped by a circular frame. No computer vision involved; the file itself tells us where its images are.",
  },
  {
    q: "What does the Auto image mode actually measure?",
    a: "Each image is downsampled and sampled for average brightness and colorfulness. Bright + colorless → treated as a document-style figure and inverted with the page. Mid or dark brightness → treated as a photo and kept original. Bright + colorful → gently dimmed so it doesn't glare. You can override with Original or Invert at any time.",
  },
  {
    q: "If a page falls back to raster, do I lose text search?",
    a: "No. Raster pages get an invisible text layer — the same technique OCR'd scans use. The text content and positions come straight from the PDF, so search, selection, and copy still work; only the visual sharpness is capped at render resolution for that page.",
  },
  {
    q: "Does any of this require uploading my PDF?",
    a: "No. Parsing, recoloring, image detection, and reassembly all run inside your browser (pdf.js for reading, a Web Worker for pixel work, pdf-lib for writing). The file never leaves your device.",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

export default function HowItWorksPage() {
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
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Blog · Under the hood
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            How Dark Mode Conversion
            <span className="block text-amber-400 mt-2">Actually Works</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Most tools repaint your PDF pixel by pixel.{" "}
            <strong className="text-neutral-100">
              PDF Dark rewrites the file&apos;s own color instructions
            </strong>{" "}
            — and falls back gracefully when it can&apos;t.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time>
            <span aria-hidden>·</span>
            <span>9 min read</span>
          </div>
        </section>

        {/* Two philosophies */}
        <section className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              A PDF is a program, not a picture
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Every PDF page is{" "}
              <a
                href="https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                a list of drawing instructions
              </a>
              : &ldquo;set the fill color to black, write this text at these
              coordinates, place this image in this rectangle.&rdquo; There are two very
              different ways to make that page dark.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                  Way 1 — repaint the pixels
                </h3>
                <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                  <li>Render the page to a bitmap, flip every pixel</li>
                  <li>Fast to build, works on anything</li>
                  <li>
                    But: photos become negatives, text turns into pixels
                    (blurry at zoom, no selection), files bloat
                  </li>
                  <li>This is what nearly every converter does</li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                  Way 2 — rewrite the instructions
                </h3>
                <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                  <li>
                    Find every &ldquo;set color&rdquo; instruction in the file
                    and swap its values into the dark theme
                  </li>
                  <li>
                    Text stays <strong className="text-neutral-100">real text</strong>:
                    selectable, searchable, sharp at any zoom
                  </li>
                  <li>Images aren&apos;t touched unless you want them to be</li>
                  <li>File size stays close to the original</li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-neutral-500 text-center mt-8">
              PDF Dark uses Way 2 wherever the file allows it — and Way 1,
              upgraded, everywhere else.
            </p>
          </div>
        </section>

        {/* Vector recoloring */}
        <section id="vector" className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            Vector recoloring, with hue preserved
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
            Swapping black↔white is easy. The interesting question is what to
            do with everything in between.
          </p>
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Near-grayscale colors follow the theme
              </h3>
              <p className="text-sm text-neutral-400">
                White backgrounds become your theme color (Midnight&apos;s deep
                blue, OLED&apos;s pure black…), black text becomes near-white,
                grays land proportionally in between. This is the classic
                luminance flip.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Colored text keeps its hue
              </h3>
              <p className="text-sm text-neutral-400">
                A dark-blue heading doesn&apos;t turn muddy gray — it becomes{" "}
                <em>light</em> blue. Red warnings stay recognizably red, links
                stay blue. Technically: chromatic colors get their lightness
                flipped while hue and saturation survive, so the author&apos;s
                color semantics carry into the dark theme.
              </p>
            </div>
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Bonus: everything else survives too
              </h3>
              <p className="text-sm text-neutral-400">
                Because the file is edited rather than re-rendered, bookmarks,
                internal links, and the document outline all survive
                conversion untouched.
              </p>
            </div>
          </div>
        </section>

        {/* Images */}
        <section
          id="images"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Images: found by structure, judged by content
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              No computer vision needed — the PDF declares where every image
              sits. What to <em>do</em> with each one is the real decision.
            </p>
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Exact positions from the file itself
                </h3>
                <p className="text-sm text-neutral-400">
                  Every image placement in a PDF comes with a transform matrix.
                  Replaying the page&apos;s instruction list gives pixel-exact
                  bounding boxes — including circular crops (think resume
                  avatars), which are restored through their round frame so no
                  light corners leak back onto the dark page.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  The Auto classifier
                </h3>
                <p className="text-sm text-neutral-400">
                  Each image is sampled for brightness and colorfulness, then
                  gets one of three treatments: white colorless figures
                  (screenshots, tables) are <em>inverted</em> so they blend
                  into the page; photos are <em>kept</em> in original colors;
                  bright colorful images get a gentle <em>dim</em> so they
                  don&apos;t glare at night. The Images toggle in the toolbar
                  can force all-Original or all-Invert instead.
                </p>
              </div>
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Downloads get the native-resolution originals
                </h3>
                <p className="text-sm text-neutral-400">
                  Preserved images are re-embedded into the saved file from
                  their original data at up to full native resolution — text
                  inside figures stays crisp when you zoom, instead of
                  inheriting screen-resolution blur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Fallback chain */}
        <section id="fallback" className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            The fallback chain: never ship a broken page
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
            PDF color is a deep rabbit hole — spot colors, gradients, indexed
            palettes, tiling patterns. Rewriting those wrongly could corrupt a
            page, so every page passes a health check first.
          </p>
          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 flex gap-4 items-start">
              <span className="text-amber-400 font-bold text-lg leading-none mt-0.5">
                1
              </span>
              <p className="text-sm text-neutral-400 m-0">
                <strong className="text-neutral-100">Vector recolor</strong> —
                used when every color instruction on the page is fully
                understood (plain RGB, grayscale, CMYK). Most Word, Google
                Docs, LaTeX, and print-to-PDF files land here.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 flex gap-4 items-start">
              <span className="text-amber-400 font-bold text-lg leading-none mt-0.5">
                2
              </span>
              <p className="text-sm text-neutral-400 m-0">
                <strong className="text-neutral-100">Raster fallback</strong> —
                if a page uses color machinery we can&apos;t safely rewrite
                (spot colors, gradients, patterns), just that page is rendered
                dark as a bitmap instead, with preserved images re-embedded at
                native resolution and an invisible text layer keeping search
                and copy alive. A wrong-looking gray page beats a corrupted
                one, every time.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 flex gap-4 items-start">
              <span className="text-amber-400 font-bold text-lg leading-none mt-0.5">
                3
              </span>
              <p className="text-sm text-neutral-400 m-0">
                <strong className="text-neutral-100">Scanned pages</strong> —
                a scan is one big image, so there are no instructions to
                rewrite; the page is inverted uniformly (or left untouched in
                Original mode). Handwriting and old book scans normalize
                beautifully to the theme background.
              </p>
            </div>
          </div>
          <p className="text-xs text-neutral-500 text-center mt-8">
            The decision is per page, not per file — a report with one exotic
            chart page keeps vector text on the other forty-nine.
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            See it run on your own PDF
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            All of the above happens in your browser, in seconds
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a file on the converter and watch: vector text, preserved
            photos, and a theme of your choice — nothing uploaded anywhere.
          </p>
          <Link
            href="/converter"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Try PDF Dark →
          </Link>
        </section>

        <RelatedVariants currentSlug="how-pdf-dark-mode-conversion-works" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Under-the-hood FAQ
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
