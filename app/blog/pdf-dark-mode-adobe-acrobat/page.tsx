import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-adobe-acrobat";
const TITLE = "PDF Dark Mode in Adobe Acrobat — Hidden in Accessibility";
const DESCRIPTION =
  "Acrobat's Dark Gray theme only skins the toolbar. The real page-darkening setting hides in Preferences → Accessibility — here's the path, and a faster way.";
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
    q: "I turned on Dark Gray in Acrobat but my PDF pages are still white — why?",
    a: "Dark Gray (View → Display Theme) is an interface theme — it recolors the toolbar, panels, and menus, not the page. The document canvas keeps rendering the PDF's own colors, almost always white.",
  },
  {
    q: "So how do you actually make the page content dark in Acrobat?",
    a: "Open Edit → Preferences on Windows (Acrobat → Preferences on Mac), pick the Accessibility category, check Replace Document Colors, then set a dark page background and light document text.",
  },
  {
    q: "Why is this setting under Accessibility instead of somewhere more obvious?",
    a: "Adobe built it for low-vision and high-contrast reading, not as a dark mode — nothing in the View or Theme menus points to it, which is why most users never find it.",
  },
  {
    q: "Do images stay normal-colored when I use Replace Document Colors?",
    a: "Yes — only page background and text are recolored, so photos keep their original colors instead of turning into negatives.",
  },
  {
    q: "If I set this up on my laptop, will the PDF still look dark on my phone or on a coworker's computer?",
    a: "No. It's an Acrobat application preference, not saved inside the PDF — the same file opens with its original white background everywhere else.",
  },
  {
    q: "Is there a way to get a PDF that's actually dark everywhere, on any device, for anyone who opens it?",
    a: "Yes — convert the file itself. PDF Dark rewrites the colors saved inside the PDF, so the dark theme travels with the file to any app on any device.",
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
  // Plain-text mirror of the visible Option 1 steps — keep in sync
  // with the <ol> in the Option 1 section below.
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to darken PDF pages in Adobe Acrobat",
    totalTime: "PT2M",
    step: [
      "Open Preferences: Edit → Preferences (Ctrl+K) on Windows, or Acrobat → Preferences (⌘K) on Mac.",
      "Select the Accessibility category.",
      "Check Replace Document Colors.",
      "Choose Use Custom Color — set Page Background to a dark color and Document Text to a light one (or pick a built-in high-contrast combination).",
      "Click OK — every PDF you open now renders dark.",
    ].map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </>
  );
}

export default function AdobeAcrobatVariantPage() {
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
            PDF Dark Mode in Adobe Acrobat — Hidden in Accessibility
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You already found what looked like the answer: View → Display
            Theme → Dark Gray. You switched it on, the toolbar and panels
            went dark — and the document itself kept glowing white in the
            middle of the window. A second, slower pass through the View
            menu turns up nothing else that sounds right. The setting that
            darkens the actual page does exist; Adobe just filed it under
            Accessibility, where almost nobody thinks to look.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            Acrobat can darken the page natively: the setting is Preferences
            → Accessibility → Replace Document Colors, and Option 1 walks
            through it. It only changes how this copy of Acrobat displays
            PDFs — to make the file itself dark, on your phone or for anyone
            you send it to, run it through the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            once instead, which is Option 2.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: turn on Replace Document Colors
          </h2>
          <p className="mb-4">
            Dark Gray only recolors the application around the document. The
            setting that repaints the page itself lives here:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open Preferences:{" "}
              <strong className="text-neutral-100">Edit → Preferences</strong>{" "}
              (Ctrl+K) on Windows, or{" "}
              <strong className="text-neutral-100">
                Acrobat → Preferences
              </strong>{" "}
              (⌘K) on Mac.
            </li>
            <li>
              Select the{" "}
              <strong className="text-neutral-100">Accessibility</strong>{" "}
              category.
            </li>
            <li>
              Check{" "}
              <a
                href="https://helpx.adobe.com/reader/desktop/accessibility-features.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                Replace Document Colors
              </a>
              .
            </li>
            <li>
              Choose{" "}
              <strong className="text-neutral-100">Use Custom Color</strong> —
              set Page Background to a dark color and Document Text to a
              light one (or pick a built-in high-contrast combination).
            </li>
            <li>Click OK — every PDF you open now renders dark.</li>
          </ol>
          <p className="mb-5">
            One thing to know about its scope: this is an application
            preference, stored in your copy of Acrobat, and it never
            modifies the file — the same document opens white in any other
            app or on any other device. Images are handled well, though:
            only background and text are recolored, so photos keep their
            original colors.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 2: convert the file
          </h2>
          <p className="mb-4">
            To make the darkness part of the document rather than a viewer
            setting, rewrite the colors inside the file:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              and drop your PDF on it.
            </li>
            <li>Pick a theme and click Download.</li>
            <li>Open the downloaded copy in Acrobat — or anywhere else.</li>
          </ol>
          <p className="mb-5">
            The dark colors are written into the file itself, so it opens
            dark in Acrobat, Preview, on your phone, and for anyone you send
            it to — nothing to configure on their end. Photos are detected
            and left in their original colors automatically, and the
            conversion runs entirely in your browser; the PDF is never
            uploaded. Just want to read one document right now without
            saving a copy? Open it in the{" "}
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
                  alt="A PDF page as Adobe Acrobat normally shows it: black text on a bright white background with a color photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — Acrobat&apos;s default white page
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
            The photo keeps its original colors instead of flipping into a
            negative.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Skip the trip through Preferences. Drop your PDF in, pick a
              theme, and download a file that&apos;s already dark — in
              Acrobat, on your phone, and for anyone you send it to.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Convert a PDF to dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            Adobe Acrobat PDF dark mode FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-adobe-acrobat" />
      </main>

      <Footer />
    </div>
  );
}
