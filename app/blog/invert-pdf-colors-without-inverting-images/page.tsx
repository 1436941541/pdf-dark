import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/invert-pdf-colors-without-inverting-images";
const TITLE = "Invert PDF Colors — Without Turning Images into Negatives";
const DESCRIPTION =
  "Invert PDF colors to dark mode while photos keep their original colors. Per-image smart detection — or full manual control. Free, browser-only, no upload.";

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
    a: "Naive inversion flips every pixel on the page — including the pixels inside photos. Skin turns cyan, skies turn orange, exactly like old film negatives. The fix is to treat images as separate objects: PDF Dark locates every embedded image on the page and pastes the original pixels back after the text and background have been darkened.",
  },
  {
    q: "How does the automatic mode decide what to do with each image?",
    a: "Each image is sampled for brightness and colorfulness. Bright, essentially colorless images (white-background screenshots, tables, diagrams) are inverted together with the page so they blend in. Photos are kept in their original colors. Bright but colorful images get a gentle dim so they don't glare at night.",
  },
  {
    q: "Can I force all images to stay exactly as they are?",
    a: "Yes — switch the Images control to 'Original'. Photos, figures, and even full-page scans then stay pixel-identical to the source file; only text and background are darkened.",
  },
  {
    q: "Can I invert everything, images included?",
    a: "Yes — the 'Invert' option runs every image through the same dark mapping as the rest of the page. That's the right choice for scanned documents or when you want the deepest possible dark.",
  },
  {
    q: "Does this work for circular profile photos (like in a resume)?",
    a: "Yes. Round-cropped images are detected and restored through their circular frame, so the corners around the circle stay dark instead of flashing the original light background.",
  },
  {
    q: "Is my PDF uploaded anywhere?",
    a: "No. Detection, inversion, and image restoration all run in your browser via a Web Worker. The file never leaves your device.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Invert PDF Colors Without Inverting Images",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser)",
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
            <a href="#how" className="hover:text-neutral-100">
              How it works
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Article hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Invert PDF Colors
            <span className="block text-amber-400 mt-2">
              Without Ruining Your Images
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Every basic inverter turns photos into creepy film negatives.{" "}
            <strong className="text-neutral-100">
              PDF Dark inverts the page and leaves your photos alone.
            </strong>
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 15, 2026</span>
            <span aria-hidden>·</span>
            <span>6 min read</span>
          </div>
        </section>

        {/* The problem */}
        <section className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              The negative-photo problem
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Color inversion is a great idea for text — and a terrible one
              for photos.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                  What naive inversion does
                </h3>
                <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                  <li>White page → dark page. Good.</li>
                  <li>Black text → light text. Good.</li>
                  <li>
                    Faces → <em>cyan</em>. Skies → <em>orange</em>. Every photo
                    becomes a film negative.
                  </li>
                  <li>
                    Charts and diagrams shift into colors the author never
                    chose — red warnings turn teal, brand colors flip.
                  </li>
                  <li>
                    OS-level &ldquo;Smart Invert&rdquo; tries to skip images,
                    but only inside that one device&apos;s screen — the file
                    itself never changes.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                  What PDF Dark does instead
                </h3>
                <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                  <li>
                    Reads the PDF&apos;s own structure to find{" "}
                    <strong className="text-neutral-100">
                      exactly where every image sits
                    </strong>{" "}
                    on the page
                  </li>
                  <li>
                    Darkens text, background, and vector graphics — with hue
                    preserved, so a dark-blue heading becomes light-blue, not
                    gray
                  </li>
                  <li>
                    <strong className="text-neutral-100">
                      Restores the original image pixels
                    </strong>{" "}
                    exactly where they were — photos stay photos
                  </li>
                  <li>
                    Round-cropped avatars are restored through their circular
                    frame — no light corners leaking back
                  </li>
                  <li>Downloads as a real PDF file with all of this baked in</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How the auto mode decides */}
        <section id="how" className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            Not every image should be preserved — so you get three modes
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
            A white-background screenshot glares at night even if you keep it
            &ldquo;original&rdquo;. A photo looks alien if you invert it. The
            right treatment depends on the image — so the default mode decides
            per image, and you can override globally.
          </p>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Auto <span className="text-amber-400">(default)</span> — each
                image gets the best treatment
              </h3>
              <p className="text-sm text-neutral-400">
                Every image is sampled for brightness and colorfulness.
                White, colorless figures (screenshots, tables, diagrams
                exported as images) are inverted with the page so they blend
                into the dark theme. Photos keep their original colors. Bright
                colorful images get a gentle dim so they don&apos;t glare.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Original — nothing touches your images
              </h3>
              <p className="text-sm text-neutral-400">
                Photos, figures, and even full-page scans stay pixel-identical
                to the source. Only text and background are darkened. Pick
                this for photo albums, portfolios, and slide decks.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Invert — everything goes dark, images included
              </h3>
              <p className="text-sm text-neutral-400">
                The classic full inversion, best for scanned documents where
                the &ldquo;image&rdquo; <em>is</em> the text. Deepest possible
                dark on OLED screens.
              </p>
            </div>
          </div>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Invert your PDF — keep your photos
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            Drop a file, watch the images survive, download the dark PDF
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Free and browser-only: the file never leaves your device. Check
            the Images toggle in the toolbar to switch between Auto, Original,
            and Invert.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Try PDF Dark →
          </Link>
        </section>

        <RelatedVariants currentSlug="invert-pdf-colors-without-inverting-images" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Inverting PDF colors FAQ
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
