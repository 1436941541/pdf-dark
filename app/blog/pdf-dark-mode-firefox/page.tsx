import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-firefox";
const TITLE = "PDF Dark Mode in Firefox — What Works and What Doesn't";
const DESCRIPTION =
  "Firefox's dark theme only darkens the PDF toolbar — the page stays white. Here's why, and how to get a real dark PDF in your browser, free.";
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
    q: "Does Firefox have a built-in PDF dark mode?",
    a: "Partially. The viewer's toolbar can go dark, but the page content itself always renders on a white background — there's no public preference for the page canvas.",
  },
  {
    q: "What about the about:config pdfjs.viewerCssTheme hack?",
    a: "Setting pdfjs.viewerCssTheme to 2 darkens the toolbar and the area around the page, but the page itself stays white. It's a cosmetic fix, not a real one.",
  },
  {
    q: "Do Firefox dark-mode extensions help?",
    a: "Barely. Firefox's PDF viewer is privileged browser UI that extensions mostly can't restyle — Dark Reader itself notes its PDF support is limited — and filter-based approaches invert photos into negatives anyway.",
  },
  {
    q: "Aren't you just using PDF.js like Firefox does?",
    a: "Yes — same Mozilla engine, different next step: text and background are recolored into your theme, images are detected and handled separately so photos keep their colors, and the result is a downloadable file, not a viewer toggle.",
  },
  {
    q: "Does this work on Firefox for Android?",
    a: "Yes. The conversion runs on your phone, the dark PDF saves to your Downloads folder, and it opens in any reader afterwards.",
  },
  {
    q: "Is the original PDF uploaded anywhere?",
    a: "No. Everything runs in your Firefox tab — watch the Network panel in Firefox DevTools while converting and you'll see no upload request for the file.",
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

export default function FirefoxVariantPage() {
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
            PDF Dark Mode in Firefox — What Works and What Doesn&apos;t
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You switched Firefox to its dark theme, opened a PDF from your
            Downloads folder, and watched the toolbar go dark while the page
            underneath stayed a bright white sheet. So you searched, found the
            hidden-preference trick every forum mentions, flipped the value —
            and the toolbar got a little darker while the page itself
            didn&apos;t change at all. That&apos;s the whole story of
            Firefox&apos;s built-in options: the darkness stops at the edge of
            the document. Here&apos;s what actually darkens the page.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            To just read, open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in a Firefox tab and drag your PDF onto it. To make the file
            itself dark — in Acrobat, on your phone, in Firefox next week —
            use the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            and download a dark copy. Both run entirely in your browser; the
            file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: read with a dark theme in Firefox
          </h2>
          <p className="mb-4">
            The fastest route — no hidden preferences, nothing installed:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open a new Firefox tab and go to the{" "}
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
            it&apos;s a paper you&apos;ll be reading all week, Option 2 below
            gives you a copy that opens dark on its own.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as Firefox normally shows it: black text on a bright white background with a color photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — Firefox&apos;s default white page
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
            Option 2: convert the file, then keep it dark everywhere
          </h2>
          <p className="mb-4">
            Firefox renders PDFs with{" "}
            <a
              href="https://github.com/mozilla/pdf.js"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              PDF.js
            </a>
            , Mozilla&apos;s open-source engine — and the converter uses the
            same engine, so anything Firefox can open, it can open. Instead
            of framing the page, it rewrites the colors saved inside the
            file:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in Firefox and drop your PDF on it.
            </li>
            <li>Pick a theme and click Download.</li>
            <li>
              Open the dark copy from Firefox&apos;s downloads panel — the
              arrow icon in the toolbar — or press{" "}
              <strong className="text-neutral-100">Ctrl+O</strong> and pick
              it from Downloads. This time the page renders dark.
            </li>
          </ol>
          <p className="mb-5">
            Background dark, text light, photos detected and left in their
            original colors — the recoloring keeps text selectable on most
            PDFs, since it isn&apos;t a screen filter. And because the change
            lives inside the file, the copy opens dark in Acrobat, on your
            phone, in any viewer. Works in Firefox on Windows, macOS, Linux,
            and Android.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Have a PDF open right now? Drop it on the reader and it renders
              dark in this same Firefox tab — nothing installed, nothing
              saved.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode in Firefox FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-firefox" />
      </main>

      <Footer />
    </div>
  );
}
