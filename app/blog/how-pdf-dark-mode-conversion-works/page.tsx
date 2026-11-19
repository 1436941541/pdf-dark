import { ResponsiveNavigation } from "@/components/responsive-navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/how-pdf-dark-mode-conversion-works";
const TITLE = "How PDF Dark Mode Conversion Works: Vector vs Raster Math";
const DESCRIPTION =
  "Inside client-side PDF dark mode conversion: rewriting content streams, preserving HSL hue and photos, invisible OCR fallback, and Dark-to-Light print.";
const PUBLISHED = "2026-07-17";
const UPDATED = "2026-11-15";

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

const ARCHITECTURES = [
  {
    behavior: "Standard digital text & file size",
    raster:
      "Destroys vector glyphs; pages turn into blurry bitmaps at multi-megabyte sizes",
    naive: "Keeps selectable vector text and compact file size",
    hybrid:
      "Keeps selectable vector text, outlines, and links at near-original size",
  },
  {
    behavior: "Vendor manuals with permissions-only lock",
    raster: "Renders via canvas, losing vector text across the entire manual",
    naive:
      "Often fails pdf-lib load on owner-locked files and drops to flat bitmaps",
    hybrid:
      "Unlocks permissions-only owner passwords automatically so vector pages stay sharp",
  },
  {
    behavior: "Colored headings & callouts",
    raster: "Flips RGB channels into harsh complementary colors unless filtered",
    naive:
      "255 - channel turns dark blue headings bright orange and red notes cyan",
    hybrid:
      "Flips lightness in HSL, preserving hue and saturation (dark blue becomes light blue)",
  },
  {
    behavior: "Embedded photographs & white charts",
    raster: "Flips photos into X-ray negatives",
    naive:
      "Straight 255 - channel flip turns photographs into color negatives and reverses chart colors",
    hybrid:
      "Vector pages leave photo bytes untouched (optional subtle night veil); raster pages classify brightness/saturation and re-embed photos up to 2x render box",
  },
  {
    behavior: "Gradients (sh), spot colors, or scans",
    raster: "Flattens the entire PDF, destroying text search on every page",
    naive:
      "Single-page raster fallback loses selectable text on fallback pages",
    hybrid:
      "Per-page health check isolates complex/scanned pages and replays standard Latin text in PDF rendering mode 3 (invisible searchable text)",
  },
  {
    behavior: "Printing dark slides on white paper",
    raster: "Not supported (dark PDFs dump black toner across the sheet)",
    naive: "Not supported (warns against printing inverted files)",
    hybrid:
      "Dedicated Dark → Light (Print) math snaps dark boards to #FFFFFF and darkens yellow/cyan strokes for legibility",
  },
];

const PRINT_RECOVERY_ROWS = [
  {
    element:
      "Chalkboard, navy, or noisy JPEG-black backgrounds (effective level <= 55)",
    naive:
      "Light gray or tinted background haze that wastes toner across the whole page",
    recovery: "Snaps directly to pure #FFFFFF white (0% background ink)",
  },
  {
    element:
      "Deep royal-blue or crimson pen strokes (low Rec.601 luminance, high single RGB channel)",
    naive: "Risk getting misclassified as dark background and wiped out",
    recovery:
      "Gates background snapping on max(luminance, 0.58 * maxChannel) so saturated blue and red strokes survive",
  },
  {
    element: "Bright yellow, cyan, or green chalk highlights",
    naive: "Flips hue or stays too pale to read against white paper",
    recovery:
      "Preserves original hue in HSL and caps ink luminance (<= 110 / 255) so yellow and cyan notes print dark and legible",
  },
  {
    element: "Already-white cover sheets & daylight screenshots",
    naive: "Flips white pages and pasted exam boxes into solid black blocks",
    recovery:
      "Leaves light pages (page mean >= 150, border median >= 180) and light embedded figures (brightness > 125) untouched",
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
    image: `${site}/compare/pdf-dark.png`,
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
            How PDF Dark Mode Conversion Works: Streams, Images, and Print
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            6 min read
          </p>

          <p className="text-lg mb-12">
            Most online dark-mode converters paint each PDF page onto an HTML
            canvas, invert the RGB pixels, and wrap the resulting JPEGs or PNGs
            into a new file, which bloats file size, blurs text when zoomed, and
            flips embedded photos into negatives. Hybrid PDF dark mode
            conversion edits the PDF&apos;s own drawing instructions wherever
            the page structure allows it, isolates embedded images
            geometrically, and falls back to raster rendering with an invisible
            searchable text layer only on pages that require pixel-level work.
            You can inspect the output directly on your own files in the{" "}
            <Link
              href="/invert-pdf-colors"
              className="text-amber-400 hover:underline"
            >
              PDF color inverter
            </Link>
            .
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            Three PDF dark mode conversion architectures
          </h2>
          <p className="mb-5">
            Client-side and online converters fall into three architectures. The
            trade-offs show up as soon as you zoom to <code>300%</code>, inspect
            a color photograph, press <code>Ctrl+F</code> on a complex chart
            page, or print dark lecture slides.
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[780px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Engineering behavior
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Canvas rasterizers (2x PNG/JPEG tools)
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Naive <code>255 - RGB</code> stream inverters
                  </th>
                  <th className="px-4 py-3 font-semibold text-amber-400 border-b border-neutral-800">
                    PDF Dark hybrid pipeline
                  </th>
                </tr>
              </thead>
              <tbody>
                {ARCHITECTURES.map((r) => (
                  <tr
                    key={r.behavior}
                    className="border-b border-neutral-900 last:border-b-0"
                  >
                    <td className="px-4 py-3.5 align-top font-medium text-neutral-100">
                      {r.behavior}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.raster}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.naive}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-200 bg-amber-400/5">
                      {r.hybrid}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            1. Rewriting PDF color operators without shifting hue
          </h2>
          <p className="mb-5">
            A digital PDF page from Word, Google Docs, or LaTeX is a stream of
            postfix drawing operators: set grayscale fill or stroke (
            <code>g</code> / <code>G</code>), set RGB fill or stroke (
            <code>rg</code> / <code>RG</code>), set CMYK (<code>k</code> /{" "}
            <code>K</code>), or assign device, calibrated, or ICC color spaces (
            <code>cs</code>, <code>CS</code>, <code>sc</code>, <code>SC</code>,{" "}
            <code>scn</code>, <code>SCN</code>). Instead of rasterizing the
            page, the tokenizer walks that content stream, resolves each
            supported color operand, maps it into the target dark theme, and
            emits plain <code>DeviceRGB</code> (<code>rg</code> /{" "}
            <code>RG</code>) instructions in place. Text glyphs, vector line
            art, internal links, and document bookmarks remain intact. Before
            stream rewriting starts, <code>pdf-lib</code> also passes an empty
            user password (<code>password: &quot;&quot;</code>), unlocking the
            silent owner-password copy restrictions common on 500-page hardware
            manuals so their vector text is not downgraded to bitmaps.
          </p>
          <p className="mb-6">
            How each color is mapped matters just as much as keeping it vector.
            A naive <code>255 - channel</code> subtraction flips both brightness
            and hue, turning dark-blue headings bright orange. PDF Dark
            separates near-grayscale colors (mapped smoothly between pure white
            text and your chosen theme background via Rec.601 luminance) from
            chromatic colors: saturated headings and callouts convert to HSL,
            keep their original hue and saturation, and flip lightness onto a
            readable high-luminance band (<code>0.92 - 0.42 * L</code>).
          </p>

          <div className="grid sm:grid-cols-3 gap-3 mb-12">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Source PDF page with dark text, a dark-blue Chapter 3 subtitle, and a full-color sunset illustration"
                  width={720}
                  height={933}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Source PDF
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/naive-invert.png"
                  alt="Naive 255 minus RGB channel inversion: the blue Chapter 3 subtitle turns orange and the sunset illustration flips into a blue negative"
                  width={720}
                  height={933}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                255 - RGB channel flip: blue subtitle turns orange, artwork
                becomes a negative
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="PDF Dark output: Midnight slate background, light-blue Chapter 3 subtitle preserving its hue, and sunset illustration kept in original colors"
                  width={720}
                  height={933}
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                PDF Dark: hue-preserving vector recolor + untouched image
                XObject
              </figcaption>
            </figure>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            2. Locating images from operators, not computer vision
          </h2>
          <p className="mb-5">
            Protecting photographs does not require machine-learning object
            detection or server uploads because a PDF already declares where
            every raster image lands. Before rendering a page, PDF Dark walks{" "}
            <code>PDF.js</code>&apos;s operator list with a simulated
            graphics-state stack that tracks 2D affine transforms (
            <code>cm</code>) and clipping rectangles (<code>W</code> /{" "}
            <code>W*</code>) across <code>paintImageXObject</code>, inline
            images, and repeated image tiles. Two deliberate exclusions keep
            text legible: 1-bit stencil masks (
            <code>paintImageMaskXObject</code>, which JBIG2 scanners use to
            stamp text glyphs in the active fill color) are skipped so scanned
            lettering flips to white, and any single image covering{" "}
            <code>85%</code> or more of the page area marks the entire page as a
            scan rather than a figure to preserve.
          </p>
          <p className="mb-12">
            Next, a <code>32x32</code> thumbnail sample measures each
            image&apos;s average brightness and saturation before choosing the
            page pipeline. Under <code>Images: Auto</code>, if a page contains a
            bright, low-saturation figure (luminance <code>&gt;= 190</code> and
            saturation <code>&lt; 0.12</code>, such as a white-background chart
            or screenshot), that page routes to the raster pipeline so the
            figure&apos;s white background can invert alongside the page. Pages
            whose images only need preservation stay in vector mode:{" "}
            <code>Image</code> XObject bytes are never re-encoded, with at most
            a subtle black rectangle (<code>&lt;= 18%</code> opacity) drawn over
            bright figures on unrotated pages. On pages that do enter the raster
            pipeline, axis-aligned, unmirrored, uncropped photographs are pulled
            from the <code>PDF.js</code> object pool and re-embedded over the
            dark base up to <code>2x</code> the render box (<code>~3x</code> PDF
            user-space scale at standard <code>1.5x</code> render, never
            upscaled past native pixels) as PNG (if transparent) or{" "}
            <code>0.92</code>-quality JPEG.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            3. Per-page health check and mode-3 invisible text
          </h2>
          <p className="mb-5">
            Not every PDF content stream is safe to rewrite blindly. Pages
            exported from Illustrator, InDesign, or CAD tools sometimes rely on
            smooth shading gradients (<code>sh</code>), named spot inks or
            lookup palettes (<code>Separation</code>, <code>DeviceN</code>,{" "}
            <code>Indexed</code>, <code>Lab</code>, <code>Pattern</code>), or
            raw inline image bytes (<code>BI ... EI</code>). Whenever the stream
            tokenizer encounters one of those constructs, a per-page health
            check aborts vector rewriting for that page alone and hands it to
            the raster pipeline (capped at <code>4,096 px</code> per side and{" "}
            <code>8,388,608</code> total pixels so oversized architectural
            sheets never crash mobile browsers). In a 50-page report with one
            gradient cover page, the other 49 pages stay pure vector.
          </p>
          <p className="mb-12">
            On any page that takes the raster path, including scanned PDFs that
            already carry OCR, PDF Dark reads every text run and placement
            matrix via <code>PDF.js</code> and writes those characters over the
            darkened bitmap in <code>Helvetica</code> (<code>WinAnsi</code>)
            using PDF text rendering mode <code>3</code> (&ldquo;neither fill
            nor stroke&rdquo;). Visible dark pixels stay untouched, and
            selection, copy, and <code>Ctrl+F</code> keep working on upright
            horizontal Latin text (pages with a <code>/Rotate</code> flag skip
            the layer entirely; vertical <code>ttb</code> runs and text runs
            containing non-WinAnsi glyphs such as CJK, Cyrillic, or math symbols
            are skipped run by run rather than corrupting the file).
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-3">
            4. Reversing dark lecture slides for white-paper printing
          </h2>
          <p className="mb-5">
            Most PDF inverters warn users never to print an inverted PDF because
            a <code>#121212</code> or <code>#0f2042</code> slide background
            coats every sheet in toner, and a naive <code>255 - RGB</code>{" "}
            reversal turns bright yellow chalk formulas almost invisible on
            white paper. Switching{" "}
            <Link
              href="/invert-pdf-colors"
              className="text-amber-400 hover:underline"
            >
              <code>/invert-pdf-colors</code>
            </Link>{" "}
            to <code>Dark → Light (Print)</code> runs a dedicated print-recovery
            transfer function (<code>-light.pdf</code> output):
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-12">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Slide or page element
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    What plain <code>255 - RGB</code> produces
                  </th>
                  <th className="px-4 py-3 font-semibold text-amber-400 border-b border-neutral-800">
                    What PDF Dark <code>Dark → Light (Print)</code> does
                  </th>
                </tr>
              </thead>
              <tbody>
                {PRINT_RECOVERY_ROWS.map((r) => (
                  <tr
                    key={r.element}
                    className="border-b border-neutral-900 last:border-b-0"
                  >
                    <td className="px-4 py-3.5 align-top font-medium text-neutral-100">
                      {r.element}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-400">
                      {r.naive}
                    </td>
                    <td className="px-4 py-3.5 align-top text-neutral-200 bg-amber-400/5">
                      {r.recovery}
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
              Which PDF generators take the pure vector path vs the per-page
              raster fallback?
            </h3>
            <p className="text-neutral-400">
              Prose documents exported from Word, Google Docs, LibreOffice,
              LaTeX (<code>pdflatex</code> / <code>xelatex</code>), and browser{" "}
              <code>Save as PDF</code> write standard grayscale, RGB, CMYK, or
              ICC operators and stay vector unless an individual page embeds a
              white-background raster figure slated for pixel inversion under{" "}
              <code>Images: Auto</code>. Print-production pages with vector
              gradients or spot inks fall back individually and leave ordinary
              text pages in the same file untouched.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              If 100 pages share one Form XObject header or vector logo, does it
              get inverted twice?
            </h3>
            <p className="text-neutral-400">
              No. Rewritten <code>Form</code> XObjects are tracked in a
              document-wide deduplication map by object reference during export,
              so a shared header or watermark stream is recolored once on its
              first appearance and reused across the remaining 99 pages.
            </p>
          </div>

          <div className="mb-7">
            <h3 className="text-lg font-semibold text-neutral-50 mb-2">
              How can I verify that conversion happens locally in my browser?
            </h3>
            <p className="text-neutral-400">
              Load{" "}
              <Link
                href="/invert-pdf-colors"
                className="text-amber-400 hover:underline"
              >
                <code>/invert-pdf-colors</code>
              </Link>
              , open your browser&apos;s Network inspector (<code>F12</code>{" "}
              -&gt; <code>Network</code>), or disconnect Wi-Fi completely before
              dropping your PDF. Every step (<code>PDF.js</code> operator
              parsing, Web Worker pixel math, and <code>pdf-lib</code>{" "}
              serialization) executes inside local browser memory.
            </p>
          </div>
        </article>

        <RelatedVariants currentSlug="how-pdf-dark-mode-conversion-works" />
      </main>

      <Footer />
    </div>
  );
}
