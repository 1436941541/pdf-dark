import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/how-pdf-dark-mode-conversion-works";
const TITLE = "How PDF Dark Mode Conversion Works — Under the Hood";
const DESCRIPTION =
  "Vector recoloring, per-image detection, hue-preserving color mapping, and a per-page fallback chain — how PDF Dark actually converts a PDF to dark mode, explained.";
const PUBLISHED = "2026-07-17";
const UPDATED = "2026-07-30";

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
    a: "Files from Word, Google Docs, LaTeX, and 'Print to PDF' declare their colors in plain RGB, grayscale, or CMYK and are recolored as vectors. Design and print-shop files using spot colors, gradients, or indexed palettes fall back to the raster path for that page, and scanned pages always do.",
  },
  {
    q: "Why not just invert every pixel? It sounds simpler.",
    a: "It is simpler — and it turns photos into negatives, locks text at screen resolution, destroys text selection, and bloats file size. Rewriting the PDF's own color instructions avoids all four problems.",
  },
  {
    q: "How do you find the images on a page?",
    a: "The PDF's drawing instructions declare every image placement, position and size included, so exact bounding boxes — even circular crops — come straight from the file. No computer vision involved.",
  },
  {
    q: "What does the Auto image mode actually measure?",
    a: "Average brightness and colorfulness per image: bright and colorless is inverted with the page, photo-like images stay original, and bright colorful images get a gentle dim. You can override with Original or Invert.",
  },
  {
    q: "If a page falls back to raster, do I lose text search?",
    a: "No. Raster pages get an invisible text layer with text and positions taken straight from the PDF, so search, selection, and copy still work.",
  },
  {
    q: "Does any of this require uploading my PDF?",
    a: "No. Parsing, recoloring, image detection, and reassembly all run inside your browser — the file never leaves your device.",
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
        <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-50 leading-tight mb-4">
            How PDF Dark Mode Conversion Works — Under the Hood
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You converted a PDF to dark mode, opened the result, and noticed
            something odd: the text was still selectable. That shouldn&apos;t
            work — a tool that just repaints the page hands back pictures of
            pages, where nothing selects and zooming turns letters to mush.
            So what did the converter actually do to the file? Here&apos;s
            the whole pipeline, minus the source code.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The short version
          </h2>
          <p className="mb-5">
            Wherever possible, the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            rewrites the file&apos;s own color instructions, so the text
            stays real text — selectable, searchable, sharp at any zoom.
            Images are located from the file&apos;s structure and treated
            per image, which is how photos survive with their colors intact.
            And when a page uses color machinery that can&apos;t be rewritten
            safely, that one page falls back to an upgraded pixel-level
            conversion with an invisible text layer, so search and copy keep
            working. All of it runs in your browser; nothing is uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Rewriting the file&apos;s own colors
          </h2>
          <p className="mb-5">
            Every PDF page is a list of{" "}
            <a
              href="https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/PDF32000_2008.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              drawing instructions
            </a>
            : &ldquo;set the fill color to black, write this text at these
            coordinates, place this image in this rectangle.&rdquo; A viewer
            replays that list to paint the page. The converter walks the
            list, finds every &ldquo;set color&rdquo; instruction, and swaps
            its value into the dark theme: white backgrounds become the theme
            color, black text becomes near-white, grays land proportionally
            in between.
          </p>
          <p className="mb-5">
            Colored text keeps its identity. A dark-blue heading comes out{" "}
            <em>light</em> blue rather than muddy gray, because only
            lightness is flipped while hue and saturation — which color it
            is, and how vivid — carry over unchanged. And since the file is
            edited rather than repainted, the text stays vector (stored as
            letter shapes, not pixels), and bookmarks, links, and the
            document outline survive untouched.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            What happens to images
          </h2>
          <p className="mb-5">
            No computer vision is needed to find images — the instruction
            list declares where every image sits, position and size included,
            down to circular crops like resume avatars. What to <em>do</em>{" "}
            with each one is the Auto classifier&apos;s job: it samples each
            image for brightness and colorfulness. Bright, colorless figures
            (white-background screenshots, tables) are inverted so they blend
            into the dark page; photos keep their original colors; bright
            colorful images get a gentle dim so they don&apos;t glare at
            night. Preserved images are re-embedded from their original data
            at full resolution, and the Images toggle can force all-Original
            or all-Invert instead.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            When a page can&apos;t be rewritten
          </h2>
          <p className="mb-5">
            Some pages use color features that are risky to edit — spot
            colors (named printing inks), gradients, or indexed palettes
            (colors stored as a numbered lookup list). Rather than risk a
            corrupted page, the converter renders that page dark as an image
            and adds an invisible text layer: transparent text placed exactly
            over the rendered words, the same technique OCR&apos;d scans use,
            so the page still selects and searches like text. The decision is
            per page, not per file — a report with one exotic chart page
            keeps vector text on the other forty-nine. Scanned pages are
            images by nature, so they always take this path.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Original PDF page: black text on a white background with a full-color sunset photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — the source page
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="The same page converted by PDF Dark — recolored vector text on a dark background, photo restored in original colors"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                After — vector recolor, photo restored
              </figcaption>
            </figure>
          </div>
          <p className="text-xs text-neutral-600 mb-10">
            Real output (Midnight theme, Auto image mode) — not a mockup.
            The same pipeline runs when you read a file in the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode reader
            </Link>
            .
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              All of the above runs in your browser, in seconds. Drop a file
              on the converter and check the output yourself: select the
              text, zoom into a figure, open the bookmarks.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              See it run on your own PDF →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            Under-the-hood FAQ
          </h2>
          {FAQ.map((f) => (
            <div key={f.q} className="mb-7">
              <h3 className="text-lg font-semibold text-neutral-50 mb-2">
                {f.q}
              </h3>
              <p className="text-neutral-400">{f.a}</p>
            </div>
          ))}
        </article>

        <RelatedVariants currentSlug="how-pdf-dark-mode-conversion-works" />
      </main>

      <Footer />
    </div>
  );
}
