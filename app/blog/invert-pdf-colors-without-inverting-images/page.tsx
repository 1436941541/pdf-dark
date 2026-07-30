import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/invert-pdf-colors-without-inverting-images";
const TITLE = "Invert PDF Colors — Without Turning Images into Negatives";
const DESCRIPTION =
  "Invert PDF colors to dark mode while photos keep their original colors. Per-image smart detection — or full manual control. Free, browser-only, no upload.";
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
    q: "Why do photos turn into negatives when I invert a PDF?",
    a: "A naive inversion flips every pixel on the page, including the pixels inside photos — skin turns cyan, skies turn orange. The fix is to locate each embedded image and paste its original pixels back after the page is darkened.",
  },
  {
    q: "How does the automatic mode decide what to do with each image?",
    a: "Each image is sampled for brightness and colorfulness: bright, colorless figures (screenshots, tables, diagrams) are inverted with the page so they blend in, photos keep their original colors, and bright colorful images get a gentle dim.",
  },
  {
    q: "Can I force all images to stay exactly as they are?",
    a: "Yes — switch the Images control to Original. Every image, even a full-page scan, stays pixel-identical to the source; only text and background are darkened.",
  },
  {
    q: "Can I invert everything, images included?",
    a: "Yes — the Invert option runs every image through the same dark mapping as the page, the right choice for scanned documents or the deepest possible dark.",
  },
  {
    q: "Does this work for circular profile photos (like in a resume)?",
    a: "Yes. Round-cropped images are restored through their circular frame, so the corners around the circle stay dark instead of flashing the original light background.",
  },
  {
    q: "Is my PDF uploaded anywhere?",
    a: "No. Detection, inversion, and image restoration all run in your browser — the file never leaves your device.",
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

export default function InvertWithoutImagesPage() {
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
            Invert PDF Colors — Without Turning Images into Negatives
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You ran your PDF through a color inverter — or flipped on your
            device&apos;s invert setting — and the text finally sits on a
            dark background. Then you scrolled to the first photo: faces gone
            cyan, sky gone orange, every picture wrecked. So you undid it,
            and now you&apos;re back to the white page, searching for a way
            to invert the document without inverting the images. That way
            exists, and it doesn&apos;t require touching each image by hand.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            Use a converter that detects images before inverting. Drop your
            PDF on the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>
            : background and text are inverted into a dark theme, while
            photos are detected automatically and kept in their original
            colors — no{" "}
            <a
              href="https://en.wikipedia.org/wiki/Negative_(photography)"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              film negatives
            </a>
            . The result downloads as a normal PDF, and nothing is uploaded —
            the whole conversion runs in your browser.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            How to invert without wrecking the images
          </h2>
          <ol className="list-decimal pl-6 space-y-4 mb-5">
            <li>
              Open the converter and drop your PDF on it. The converter
              doesn&apos;t guess where images are — the PDF&apos;s own
              structure declares every image placement, position and size
              included, so each one is found exactly and restored after the
              page around it is darkened.
            </li>
            <li>
              Leave the Images control on{" "}
              <strong className="text-neutral-100">Auto</strong>: it samples
              each image for brightness and colorfulness — photos keep their
              original colors, white screenshots and diagrams are inverted
              so they blend into the dark page, and bright colorful images
              get a gentle dim. Or override it:{" "}
              <strong className="text-neutral-100">Original</strong> leaves
              every image pixel-identical to the source, and{" "}
              <strong className="text-neutral-100">Invert</strong> darkens
              everything, images included — the right choice for scans.{" "}
              <Link
                href="/blog/how-pdf-dark-mode-conversion-works"
                className="text-amber-400 hover:underline"
              >
                Here&apos;s the full breakdown of how the detection works
              </Link>
              .
            </li>
            <li>
              Pick a theme and click Download. Colored text keeps its
              identity — a dark-blue heading comes out light blue, not gray —
              and even round-cropped avatars (think resume headshots) are
              restored through their circular frame, so no light corners
              leak onto the dark page. To preview all of this without saving
              anything, open the file in the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                dark mode reader
              </Link>{" "}
              first.
            </li>
          </ol>
          <p className="mb-5">
            A rule of thumb for the override: pick Original for photo albums,
            portfolios, and slide decks, where the images matter more than
            the deepest dark; pick Invert for scanned documents, where the
            &ldquo;image&rdquo; <em>is</em> the text, and for the deepest
            possible black on OLED screens. For everything else, Auto&apos;s
            per-image decision is the point of the tool.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            What the inverted output looks like
          </h2>
          <p className="mb-6">
            The same page three ways — the source file, a naive inversion,
            and inversion with image detection:
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="Original PDF page: black text on a white background with a full-color sunset photo"
                  width={720}
                  height={933}
                  sizes="33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Original
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/naive-invert.png"
                  alt="The same page after naive inversion — the sunset photo becomes a false-color negative"
                  width={720}
                  height={933}
                  sizes="33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Naive invert — photo ruined
              </figcaption>
            </figure>
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-amber-400/40">
                <Image
                  src="/compare/pdf-dark.png"
                  alt="The same page inverted by PDF Dark — dark background, light text, photo keeps its original colors"
                  width={720}
                  height={933}
                  sizes="33vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-amber-400">
                PDF Dark — photo preserved
              </figcaption>
            </figure>
          </div>
          <p className="text-xs text-neutral-600 mb-10">
            Real output, not a mockup: left is the source page, middle a raw
            RGB inversion, right PDF Dark&apos;s Auto mode (Midnight theme).
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Set the Images control, drop your file on the converter, and
              download the dark PDF — photos intact, nothing uploaded.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Invert my PDF — photos stay photos →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            Inverting PDF colors FAQ
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

        <RelatedVariants currentSlug="invert-pdf-colors-without-inverting-images" />
      </main>

      <Footer />
    </div>
  );
}
