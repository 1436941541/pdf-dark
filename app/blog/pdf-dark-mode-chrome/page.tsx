import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-chrome";
const TITLE = "PDF Dark Mode in Chrome — Without Installing an Extension";
const DESCRIPTION =
  "Chrome's built-in PDF viewer has no dark mode toggle. Skip the extensions and their permissions — convert any PDF to dark mode right in your browser, free.";
const PUBLISHED = "2026-04-25";
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
    q: "Does Chrome have a built-in PDF dark mode?",
    a: "No. Chrome's dark theme recolors the toolbar and tabs only — the PDF page itself always renders on a white background, and Google has been asked about it for years without a fix.",
  },
  {
    q: "Do Chrome extensions like 'Dark Reader for PDF' work?",
    a: "Sort of. They lay a CSS invert filter over the page — text becomes readable, but photos turn into negatives, the extension needs broad permissions, and local files stay untouched until you enable 'Allow access to file URLs' manually.",
  },
  {
    q: "Is this faster than installing an extension?",
    a: "Yes — there's nothing to install. Open the converter, drop your PDF, and in seconds you have a dark-themed file you can reopen in any viewer later, not just Chrome.",
  },
  {
    q: "What happens to images in my PDF?",
    a: "Photos are detected and kept in their original colors — no film negatives, no theme-tinted faces. White screenshots and diagrams are inverted to blend into the dark page, and an Images toggle lets you force everything Original or Inverted.",
  },
  {
    q: "Does it work on Chrome for Android?",
    a: "Yes. The conversion runs in the phone's browser, and the dark PDF is saved to your usual download folder.",
  },
  {
    q: "Is my PDF uploaded to your server?",
    a: "No. The entire conversion runs in your Chrome tab — open DevTools → Network while converting and you'll see no upload request.",
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
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-50 leading-tight mb-4">
            PDF Dark Mode in Chrome — Without Installing an Extension
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            It&apos;s late. You double-click a PDF, it opens in a Chrome tab —
            and a wall of white lights up the room. Your system is set to dark
            mode, so Chrome&apos;s toolbar and tabs are already dark — yet the
            document itself glows like a lightbox. You scan the PDF
            viewer&apos;s toolbar — zoom, rotate, print, download — and
            there&apos;s no dark button anywhere. That&apos;s not you missing
            a setting. Chrome doesn&apos;t have one for PDF pages.
            Here&apos;s the fastest way out.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            To just read tonight, open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in a Chrome tab and drop your file on it. To keep a copy that
            stays dark — in Acrobat, on your phone, everywhere — run it
            through the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            and download the result. Both run entirely in your browser; the
            file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: read with a dark theme in Chrome
          </h2>
          <p className="mb-4">
            The fastest route — nothing installed, nothing saved:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open a new Chrome tab and go to the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                PDF dark mode reader
              </Link>
              .
            </li>
            <li>
              Drag your PDF onto the page, or click to pick it from your
              Downloads folder.
            </li>
            <li>
              Pick a theme — Midnight, Sepia, Solarized, or pure-black OLED —
              and read. Pages render dark right in the tab.
            </li>
          </ol>
          <p className="mb-5">
            Nothing is stored: close the tab and the file is gone. If
            it&apos;s a document you&apos;ll keep coming back to, Option 2
            below gives you a copy that opens dark on its own.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as Chrome normally shows it: black text on a bright white background with a color photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — Chrome&apos;s default white page
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="The same PDF page in dark mode: dark background, light text, and the photo kept in its original colors"
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

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 2: convert the file, then open it anywhere
          </h2>
          <p className="mb-4">
            The white background is written into the PDF itself, so the
            durable fix is to change what&apos;s saved — background to dark,
            text to light, photos left in their original colors:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in Chrome and drop your PDF on it. The rendering is done by{" "}
              <a
                href="https://github.com/mozilla/pdf.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                PDF.js
              </a>
              , the same open-source engine Firefox uses, running right in
              your tab.
            </li>
            <li>
              Pick a theme and click Download. If a white diagram looks out
              of place on the dark page, use the Images toggle to force
              everything Original or Inverted before downloading.
            </li>
            <li>
              Click the file in Chrome&apos;s downloads tray — or press{" "}
              <strong className="text-neutral-100">Ctrl+O</strong> in a new
              tab and pick it from Downloads. It opens dark this time.
            </li>
          </ol>
          <p className="mb-5">
            The darkness is now part of the file, so it survives sharing:
            email it, open it in Acrobat, or read it on your phone, and it
            stays dark everywhere. Works in Chrome on Windows, Mac, Linux,
            ChromeOS, and Android.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Have a PDF open right now? Drop it on the reader and it renders
              dark in this same Chrome tab — nothing installed, nothing saved.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode in Chrome FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-chrome" />
      </main>

      <Footer />
    </div>
  );
}
