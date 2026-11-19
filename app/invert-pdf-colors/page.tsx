import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { ToolNavigation } from "@/components/tool-navigation";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/invert-pdf-colors";
const TITLE = "Invert PDF Colors: Free Online PDF Inverter (No Upload)";
const DESCRIPTION =
  "Free online PDF inverter (color / colour): turn white PDFs dark without photo negatives, or flip dark-background slides & notes to white for printing.";
const SOCIAL_IMAGE_ALT =
  "Invert PDF Colors with PDF Dark: free browser-side PDF inverter for dark mode and print";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: SLUG,
    languages: {
      en: SLUG,
      es: "/es/invert-pdf-colors",
      pt: "/pt/invert-pdf-colors",
      de: "/de/invert-pdf-colors",
      "x-default": SLUG,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: SLUG,
    siteName: "PDF Dark",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${SLUG}/opengraph-image`, alt: SOCIAL_IMAGE_ALT }],
  },
};

const FAQ = [
  {
    q: "How do I invert PDF colour from black or dark-blue to white for printing?",
    a: "Switch the converter at the top to Dark → Light (Print) and drop your file. Black, dark-navy, and dark-green slide backgrounds snap to pure white (#FFFFFF), already-white cover or question pages stay white, and white or colored strokes (yellow, cyan, green, royal blue, red) darken within their hue family so formulas print clearly.",
  },
  {
    q: "Which Light → Dark setting gives an exact grayscale reversal?",
    a: "Choose OLED with Darkness at 100% and Warmth at 0%. On grayscale text and backgrounds, OLED applies a symmetric 255 − value mapping without the blue or warm tint of Midnight, Sepia, or Solarized. Because saturated colors keep their hue and rasterized pages save as JPEG, running a converted PDF through a second time will not restore the original file byte-for-byte.",
  },
  {
    q: "How does Auto decide which images to invert and which to keep?",
    a: "In Light → Dark mode, Auto keeps photographs in their original colors, lightly dims bright colorful graphics, and inverts white-background screenshots, diagrams, and full-page scans (85% or more page coverage). Print mode (Dark to Light) applies the reverse rule automatically: dark blackboard captures flip to white while pasted white textbook questions and daylight photos stay untouched.",
  },
  {
    q: "Does the downloaded PDF keep sharp selectable text and a small file size?",
    a: "On compatible vector pages whose images do not require pixel inversion, PDF Dark rewrites the PDF color stream directly (including manuals with copy-restriction owner passwords), keeping crisp vector glyphs, clickable links, and compact file sizes instead of ballooning 15–20x. Scanned pages and pages with inverted images render as JPEG up to 1.5x scale (capped at 4,096 px per side and ~8.4 MP per page) with an invisible Helvetica text layer added on upright Latin pages (no OCR).",
  },
  {
    q: "Is my PDF uploaded to a server or limited by file size?",
    a: "Nothing is uploaded. Page rendering, color mapping, and PDF assembly all run locally in your browser tab (with pixel mapping offloaded to a background worker), with no account, watermark, or hourly task cap. Practical document size only depends on available device memory, so desktop browsers handle multi-hundred-page textbooks best.",
  },
];

const STEPS = [
  {
    t: "Pick direction & settings",
    d: "Keep Light → Dark (Midnight, Sepia, Solarized, or OLED with Auto, Original, or Invert images), or choose Dark → Light (Print) for dark lecture slides and notes.",
  },
  {
    t: "Drop your PDF",
    d: "Drag and drop or click to select a local PDF. Conversion runs inside your browser tab with zero server upload.",
  },
  {
    t: "Download your new PDF",
    d: "Your converted file saves automatically as -midnight.pdf, -oled.pdf, or -light.pdf with the new colors baked into the document.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Color Inverter",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(app).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default function InvertPdfColorsPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />

      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold whitespace-nowrap">
              PDF Dark
            </span>
          </Link>
          <ToolNavigation active="invert" />
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Invert PDF Colors
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Choose how you want to invert PDF colors online, then drop your
            file. This PDF color inverter turns white documents dark without
            turning photos into negatives, or switches to{" "}
            <strong className="text-neutral-100 font-medium">
              Dark → Light (Print)
            </strong>{" "}
            to flip dark-background lecture slides into clean white pages for
            printing. Free, local in your browser, and saved into the new PDF.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Light → Dark &amp; Dark → Light
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% Browser-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> Photos Stay Natural (Auto)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Mobile
            </span>
          </div>

          {/* Downloader — settings first, then drop → convert → auto-download */}
          <div className="mt-8">
            <Downloader />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Just here to read tonight without saving a copy?{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              Open the dark mode PDF reader
            </Link>
            .
          </p>
          <p className="mt-2.5 text-sm text-neutral-500">
            Need monochrome without flipping backgrounds?{" "}
            <Link
              href="/pdf-to-black-and-white"
              className="text-amber-400 hover:underline"
            >
              Convert PDF to black and white
            </Link>{" "}
            or{" "}
            <Link
              href="/whiten-pdf-background"
              className="text-amber-400 hover:underline"
            >
              whiten gray scan paper
            </Link>
            .
          </p>
        </section>

        {/* How it works + two real 3-column output comparisons */}
        <section
          id="how"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              How to invert PDF colors
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              This PDF inverter rewrites page backgrounds and text in either
              direction, while letting you control how embedded pictures and
              board snapshots are handled. Curious about the per-page pipeline?{" "}
              <Link
                href="/blog/how-pdf-dark-mode-conversion-works"
                className="text-amber-400 hover:underline"
              >
                Read how the conversion works
              </Link>
              .
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.t}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
                >
                  <div className="text-2xl font-bold text-amber-400">
                    {i + 1}
                  </div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
                </div>
              ))}
            </div>

            {/* Real comparison 1 — Light → Dark with embedded photo */}
            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Light → Dark: what the Images setting changes
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Text and background darken either way. The photograph shows why
                flipping every RGB pixel blindly ruins illustrated documents.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="PDF page before inversion: black text on a white background with a full-color sunset photo"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
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
                      alt="The same page after a raw pixel inversion where the sunset photo turns into a blue negative"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Every pixel flipped
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="The same page processed here in Light to Dark with Images on Auto: dark background and natural sunset photo"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Midnight + Images: Auto
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-500 text-center">
                Actual tool output: left is the source page, middle is a plain
                RGB reversal, right is Midnight with Images on Auto.
              </p>
            </div>

            {/* Real comparison 2 — Dark → Light (Print) on dark coaching / smartboard notes */}
            <div className="mt-14 pt-12 border-t border-neutral-900">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                Printing dark lecture slides &amp; blackboard notes
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Digital smartboard handouts often use dark-blue or green
                backgrounds with yellow and cyan writing. Plain RGB inversion
                tints the whole sheet and scrambles pen colors; print mode keeps
                the paper pure white and darkens colored ink in place.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-source.webp"
                      alt="Dark-navy smartboard lecture PDF with white equations, yellow highlights, and cyan diagram arrows"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Dark smartboard PDF
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/board-naive.webp"
                      alt="Plain 255 minus RGB inversion turning the dark-navy board into a tan background and flipping yellow notes to blue"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Plain RGB invert (tinted bg)
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/board-print.webp"
                      alt="Processed here in print mode: pure white paper background and crisp dark amber, teal, and black ink"
                      width={720}
                      height={933}
                      sizes="(max-width: 768px) 33vw, 280px"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Print mode (-light.pdf)
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-500 text-center">
                Actual tool output on a dark-navy lecture note PDF: pure #FFFFFF
                paper background saves toner while yellow, cyan, and green
                annotations stay distinct and dark enough to print.
              </p>
            </div>
          </div>
        </section>

        {/* Why invert the file instead of the viewer */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Why invert PDF files instead of flipping a viewer setting?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Viewer themes, browser extensions, and OS color filters only alter
            how a PDF looks while it stays open in that one app; the document
            itself never changes. Exporting a{" "}
            <strong className="text-neutral-100">new PDF</strong> writes the
            converted colors into the pages so you can send it to a phone or
            e-reader, share it with classmates, or take a dark handout to a
            print shop with zero setup on the other machine.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            A screen-wide invert switch also treats every pixel the same, so
            photographs, charts, and colored slides shift into false-color
            negatives. Working on the PDF directly lets each embedded image be
            classified separately or left untouched.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Viewer / extension / OS invert
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Applies only while that specific viewer or extension runs</li>
                <li>Reopening in Acrobat, mobile, or a print shop reverts to the original</li>
                <li>Cannot export or print a white copy from dark lecture slides</li>
                <li>Turns embedded photos and charts into negatives</li>
                <li>Resets when you switch devices or share the file</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                A PDF with saved color changes
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Saved in the file:</strong>{" "}
                  displays the same way in Acrobat, Preview, mobile, and print
                </li>
                <li>
                  Works both ways: white pages to dark themes, or dark slides to
                  pure white paper
                </li>
                <li>
                  Per-image control so photos stay natural while diagrams flip
                </li>
                <li>
                  Hue-preserving ink mapping keeps blue, yellow, and green notes
                  in their original color family
                </li>
                <li>
                  Vector pages recolor in place, keeping crisp text and compact
                  file sizes
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            When to invert PDF colors
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Dark lecture slides and blackboard notes you need to print
              </h3>
              <p className="text-sm text-neutral-400">
                Coaching handouts, smartboard class exports, and dark slide
                decks soak paper in toner at the print shop. Print mode clears
                dark board backgrounds to white paper and darkens colored
                chalk or marker strokes so worked derivations stay easy to
                follow on physical sheets.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Scanned documents and handwritten notes
              </h3>
              <p className="text-sm text-neutral-400">
                On a scan there is no separate text layer because the writing is
                part of the page image. Whole-page scans invert automatically in
                Auto, and cropped notebook or whiteboard photos flip when you
                set Images to Invert.{" "}
                <Link
                  href="/blog/scanned-pdf-dark-mode"
                  className="text-amber-400 hover:underline"
                >
                  More on scanned PDFs
                </Link>
                .
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Papers and slide decks full of figures
              </h3>
              <p className="text-sm text-neutral-400">
                Line charts, circuit diagrams, sheet music, and technical
                drawings on white boxes flip cleanly in Auto while photographs
                on the very same page retain their natural colors.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Reading at night without wrecking the pictures
              </h3>
              <p className="text-sm text-neutral-400">
                Bright white textbooks glare in a dim room, especially on OLED
                tablets and phones. Saving a Midnight or Sepia copy lets you
                read comfortably in any native PDF app without negative-looking
                photos.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Frequently Asked Questions
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
                <p className="px-4 pb-4 -mt-1 text-sm text-neutral-400">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
