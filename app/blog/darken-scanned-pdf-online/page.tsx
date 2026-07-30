import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/darken-scanned-pdf-online";
const TITLE = "Darken a Scanned PDF Online — Free, In-Browser";
const DESCRIPTION =
  "Got a scanned PDF that's painfully bright at night? Darken every page online in seconds. Free, no upload, no install — works on phones and laptops.";
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
    q: "Will this make the original text darker, or invert the whole page?",
    a: "It inverts: the bright background becomes your theme color and the dark text becomes near-white. If you want to keep the white background and only deepen faded text for printing, use an OCR + contrast tool instead.",
  },
  {
    q: "Which theme works best for scanned pages?",
    a: "OLED (pure black) gives the deepest contrast and saves battery on OLED phones; Midnight (deep blue-grey) is the most comfortable for long sessions. Skip Sepia on yellow-tinted old scans — a warm theme on warm paper loses contrast.",
  },
  {
    q: "Does the scan need to be OCR'd first?",
    a: "No. A scanned page is treated as the image it is and darkened directly — the Images toggle controls it: Auto and Invert darken scans, Original leaves them as they came.",
  },
  {
    q: "Is my scanned PDF uploaded anywhere?",
    a: "No. Conversion happens entirely in your browser — open DevTools → Network during conversion and you'll see no upload. The file never leaves your device.",
  },
  {
    q: "My scan is 300+ pages. Will this still work?",
    a: "On a laptop, yes — pages are rendered and darkened in chunks. On a phone, very large scans can stall when memory runs out; split the PDF first and darken the halves separately.",
  },
  {
    q: "Will old yellowed paper still look yellowed after darkening?",
    a: "No. The brightness mapping pulls every page toward your theme color, so yellowed, off-white, and pure white pages all end up as the same dark background.",
  },
  {
    q: "Is there a file size or page limit?",
    a: "No hard limit — everything runs locally, so your device's memory is the only ceiling.",
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

export default function DarkenScannedPdfPage() {
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
            Darken a Scanned PDF Online — Free, In-Browser
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You finally tracked down the chapter you needed — a scan of an old
            book, photographed page by page — and opened it in bed. Every page
            is a picture of bright white paper. You flipped your reader&apos;s
            dark mode on, and nothing happened: the interface went dark, the
            pages stayed white. That&apos;s not a bug. A scan has no text for
            the reader to restyle, so the dark setting never reaches the page
            itself. Here&apos;s how to darken the scan for real.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            Drop your scanned PDF on the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>
            , pick a theme, and click Download. A scanned page is one big
            picture of paper, so the converter darkens it as an image — with
            the Images toggle on Auto, every page comes back dark, as a
            normal PDF you can keep. No OCR needed, no upload, no install;
            everything runs in your browser, on a phone or a laptop.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            The steps
          </h2>
          <ol className="list-decimal pl-6 space-y-4 mb-5">
            <li>
              Open the{" "}
              <Link
                href="/converter"
                className="text-amber-400 hover:underline"
              >
                converter
              </Link>{" "}
              in any browser and drag the scanned PDF onto the drop zone. The
              file is parsed locally and never leaves your device.
            </li>
            <li>
              Pick a theme and check the Images toggle. Because a scan has no
              text layer, the whole page is treated as a single image: Auto
              and Invert both darken scanned pages, while Original leaves
              them exactly as they came — only useful when a mostly digital
              PDF has a few scanned inserts you want to keep as-is. For a
              night-reading scan, leave it on Auto.
            </li>
            <li>
              Click Download. The brightness mapping pulls every shade of
              light paper — pure white, yellowed, gray near the spine — to
              the same dark background, so an old book scan whose page color
              drifts chapter to chapter comes back as one calm, uniform
              theme.
            </li>
          </ol>
          <p className="mb-5">
            Theme choice matters more on scans than on digital PDFs. OLED
            gives the deepest contrast and saves battery on OLED phones;
            Midnight is the most comfortable for long sessions; skip Sepia on
            yellow-tinted old scans, where a warm theme on warm paper loses
            contrast. To try them on your own scan before saving anything,
            open it in the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode reader
            </Link>{" "}
            and switch themes live.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Original bright PDF page: dark text on a white background with a full-color sunset photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — bright page, the way a scan opens
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="The same page darkened by PDF Dark — uniform dark background with near-white text"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                After — background normalized to the theme
              </figcaption>
            </figure>
          </div>
          <p className="text-xs text-neutral-600 mb-10">
            Real output (Midnight theme, Auto image mode) — not a mockup.
            Scanned pages get the same brightness mapping.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Reading an old scan tonight? Drop it on the converter and the
              darkened copy downloads right away — free, no account, nothing
              uploaded.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Darken my scanned PDF →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            Darken scanned PDF — FAQ
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

        <RelatedVariants currentSlug="darken-scanned-pdf-online" />
      </main>

      <Footer />
    </div>
  );
}
