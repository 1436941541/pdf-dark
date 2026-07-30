import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/sumatra-pdf-dark-mode";
const TITLE = "PDF Dark Mode in Sumatra PDF — the i Key vs. Editing settings.txt";
const DESCRIPTION =
  "Sumatra PDF has two built-in ways to darken a page — the i shortcut and a settings.txt edit. How both work, why they fall short, and a fix that sticks.";
const PUBLISHED = "2026-07-29";
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
    q: "Does Sumatra PDF have a dark mode?",
    a: "Yes, several — press i to invert the current document, pick the built-in Dark theme (3.5.2 and later), or set custom page colors via Advanced Options. None of them is labeled \"dark mode\" in the menus.",
  },
  {
    q: "How do I invert colors in Sumatra PDF?",
    a: "Open a PDF and press the i key — the background goes black and the text goes white immediately. It lasts only for the current session.",
  },
  {
    q: "How do I make Sumatra's dark colors stick permanently?",
    a: "Settings → Advanced Options opens SumatraPDF-settings.txt; set TextColor and BackgroundColor under FixedPageUI to hex values and save. Every PDF then opens with those colors on this PC.",
  },
  {
    q: "Why do images look strange after pressing i or editing settings.txt?",
    a: "Both apply the color change to the whole rendered page, images included — photos come out as negatives and transparent images can distort. There's no way to invert text only.",
  },
  {
    q: "Will this work on my phone or on a Mac?",
    a: "No. Sumatra is Windows-only, so everything you set up lives on that one PC — the same file opens white everywhere else.",
  },
  {
    q: "Is my PDF uploaded anywhere when I use PDF Dark?",
    a: "No. The conversion runs entirely in your browser tab — open DevTools → Network while converting and you'll see no request carrying your file.",
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

export default function SumatraVariantPage() {
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
            PDF Dark Mode in Sumatra PDF — the i Key vs. Editing settings.txt
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You picked Sumatra because it opens a PDF before heavier readers
            finish drawing their splash screen. Tonight that speed delivers a
            wall of white into a dark room, and a pass through Sumatra&apos;s
            famously sparse menus turns up nothing called dark mode. It&apos;s
            there — twice, actually. Sumatra just never labels it.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            To darken the page right now, press the{" "}
            <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">
              i
            </code>{" "}
            key — Sumatra inverts the document on the spot. To get a copy
            that stays dark — with photos kept in their original colors, on
            any device — run the file through the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            once. Both take under a minute; the details are below.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: press the i key
          </h2>
          <p className="mb-4">
            Sumatra&apos;s fastest dark mode isn&apos;t in any menu —
            it&apos;s a keyboard shortcut:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>Open your PDF in Sumatra.</li>
            <li>
              Press the{" "}
              <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">
                i
              </code>{" "}
              key. The page inverts immediately — black background, white
              text.
            </li>
            <li>
              Press{" "}
              <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">
                i
              </code>{" "}
              again to flip back.
            </li>
          </ol>
          <p className="mb-5">
            Two things to know about its scope. The inversion covers the
            whole rendered page, images included, so photos come out as
            negatives — a long-standing complaint{" "}
            <a
              href="https://forum.sumatrapdfreader.org/t/update-has-made-all-images-negatives-unusable-now/4384"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              on Sumatra&apos;s own forum
            </a>
            . And it lasts only for the current session: close the file and
            it opens white again.
          </p>
          <p className="mb-5">
            For a dark page that survives restarts, recent builds (3.5.2 and
            later) ship Dark and Darker themes under the Settings menu, and
            Settings → Advanced Options lets you set permanent custom page
            colors — every field is documented in{" "}
            <a
              href="https://www.sumatrapdfreader.org/settings/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Sumatra&apos;s official settings reference
            </a>
            . Both recolor the page the same way the{" "}
            <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">
              i
            </code>{" "}
            key does, images included.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 2: convert the file
          </h2>
          <p className="mb-4">
            To keep photos in their real colors — or to have the document
            stay dark beyond this one Windows PC — change the file instead
            of the viewer:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in your browser and drop the PDF on it.
            </li>
            <li>
              Pick a theme — Midnight, Sepia, Solarized, or pure-black OLED.
            </li>
            <li>Click Download and open the copy in Sumatra as usual.</li>
          </ol>
          <p className="mb-5">
            The colors are rewritten inside the file: background dark, text
            light, photos detected and kept as they are. The conversion runs
            entirely in your browser — the file is never uploaded — and the
            result opens dark in Sumatra, on your phone, on a Mac, anywhere.
            Just want to read something once without saving a copy? Open it
            in the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode PDF reader
            </Link>{" "}
            instead.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as Sumatra normally shows it: black text on a bright white background with a color photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — Sumatra&apos;s default white page
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
            into a negative, which is where the i key falls short.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Reading in Sumatra tonight? Convert the file once and it opens
              dark from now on — no key to press per document, and it stays
              dark on every device.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Convert a PDF to dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            Sumatra PDF dark mode FAQ
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

        <RelatedVariants currentSlug="sumatra-pdf-dark-mode" />
      </main>

      <Footer />
    </div>
  );
}
