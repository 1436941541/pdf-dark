import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/how-to-darken-a-pdf";
const TITLE = "How to Darken a PDF — 3 Steps, No Install";
const DESCRIPTION =
  "Darken any PDF in your browser in three steps: drop the file, pick a dark theme, download the new file. Free, no upload, works offline.";
const PUBLISHED = "2026-06-26";
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
    q: "What does 'darken a PDF' actually mean here?",
    a: "Each page is inverted: the bright background becomes a dark color (Midnight, Sepia, Solarized, or OLED) and the dark text becomes near-white. The result is a normal PDF with dark pages baked in, so it stays dark in every reader on every device.",
  },
  {
    q: "I want darker text on a white page (for printing) — is this the right tool?",
    a: "No — this tool inverts pages into a dark theme for on-screen reading. To make faded text blacker on a white page for print, look for 'PDF contrast enhancement' tools or a scanner app's enhancement mode instead.",
  },
  {
    q: "Do I have to upload my PDF somewhere?",
    a: "No. The whole process runs in your browser — open DevTools → Network during conversion and you'll see zero requests carrying your file.",
  },
  {
    q: "Is this free? Do I need an account?",
    a: "Free, no account, no email, no watermark, no page limit.",
  },
  {
    q: "Which theme should I pick?",
    a: "Midnight is the most neutral for general reading, OLED gives the deepest contrast and saves battery on OLED screens, Sepia is warm for long sessions, and Solarized is the developer favorite. To compare them on your own document, open it in the reader on the homepage first.",
  },
  {
    q: "Can I still select text in the darkened PDF?",
    a: "Yes — most pages keep real, selectable text, and image-rendered pages carry an invisible text layer, so search and copy work either way.",
  },
  {
    q: "What about photos and color charts inside the PDF?",
    a: "In Auto mode photos keep their original colors, while white screenshots and diagrams are inverted to blend into the dark page. The Images toggle can force Original (nothing touched) or Invert (everything darkened) instead.",
  },
  {
    q: "What's the largest PDF I can darken?",
    a: "No hard limit — everything runs locally, so your device's memory is the ceiling. Hundreds of pages work on a modern laptop; phones may struggle with very large files.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    url: `${site}${SLUG}`,
    description: DESCRIPTION,
    author: { "@type": "Organization", name: "PDF Dark Team" },
    datePublished: PUBLISHED,
    dateModified: UPDATED,
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
        text: "Drag your PDF onto the converter's drop zone, or click to pick a file from disk. It's parsed right in the browser by PDF.js — nothing is uploaded.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Pick a dark theme",
        text: "Choose Midnight, Sepia, Solarized, or OLED, and leave the Images toggle on Auto so photos keep their original colors.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Download the darkened PDF",
        text: "Click Download to save a new PDF with the dark theme baked in. It opens dark in any reader on any device.",
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
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-50 leading-tight mb-4">
            How to Darken a PDF — 3 Steps, No Install
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            It&apos;s 11 pm and you still have forty pages to get through. You
            pulled the screen brightness all the way down, but the page itself
            is still a white rectangle, and your eyes are starting to give up.
            Your PDF reader has a dark theme in its settings — you tried it —
            and it only darkened the toolbar, not the document. What you
            actually need is to darken the pages themselves, and that takes
            about a minute.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            Open the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>{" "}
            in any browser, drag your PDF onto the drop zone, pick a dark
            theme, and click Download. You get a new PDF with the dark pages
            baked in — it opens dark in Acrobat, Preview, Firefox, on your
            phone, anywhere. Nothing is installed and nothing is uploaded;
            the conversion runs in your browser tab.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            The 3 steps, in detail
          </h2>
          <ol className="list-decimal pl-6 space-y-4 mb-5">
            <li>
              <strong className="text-neutral-100">Drop your PDF.</strong>{" "}
              Drag the file onto the converter&apos;s drop zone, or click it
              to pick from disk. It&apos;s parsed right in the browser by{" "}
              <a
                href="https://github.com/mozilla/pdf.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                PDF.js
              </a>
              , the same open-source engine Firefox uses to display PDFs — no
              account, no email, and no request ever carries your file.
            </li>
            <li>
              <strong className="text-neutral-100">Pick a dark theme.</strong>{" "}
              Midnight is a neutral dark blue, Sepia is warm amber, Solarized
              is the developer-favorite teal scheme, and OLED is pure black
              for the deepest contrast. The Images toggle next to the themes
              decides what happens to pictures — leave it on Auto and photos
              keep their original colors. To compare themes on your own
              document first, open it in the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                dark mode reader
              </Link>{" "}
              and switch them live.
            </li>
            <li>
              <strong className="text-neutral-100">Download.</strong> The
              darkened copy saves to your Downloads folder as a standard PDF.
              The dark theme is part of the file now, not a viewer setting,
              so it looks the same wherever you open it — a different reader,
              another device, a colleague&apos;s laptop.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Original PDF page before darkening: black text on a white background with a full-color sunset photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — the original white page
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="The same PDF page darkened: dark background, light text, and the photo kept in its original colors"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                After — dark page, photo untouched
              </figcaption>
            </figure>
          </div>
          <p className="text-xs text-neutral-600 mb-10">
            Real output (Midnight theme, Auto image mode) — not a mockup.
            Notice the photo keeps its original colors instead of flipping
            into a negative.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Got a PDF you&apos;ve been meaning to read? Drop it on the
              converter, pick a theme, and the darkened copy downloads right
              away — free, no account, nothing uploaded.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Darken a PDF now →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            How to darken a PDF — FAQ
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

        <RelatedVariants currentSlug="how-to-darken-a-pdf" />
      </main>

      <Footer />
    </div>
  );
}
