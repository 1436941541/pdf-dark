import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-android";
const TITLE = "PDF Dark Mode on Android — No Root, No System Hack";
const DESCRIPTION =
  "Android's default PDF viewers have no real dark mode, and system color inversion flips your screen negative. Convert the file once — it opens dark in every app.";
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
    q: "Does Android have a built-in PDF dark mode?",
    a: "Not a real one, at least not today. The default viewer in Files by Google still renders PDF pages on a white background regardless of your system theme.",
  },
  {
    q: "What about the 'Dark theme' setting inside Files by Google or Drive?",
    a: "That toggle darkens the app chrome — toolbars, menus, file lists. The PDF page itself still renders as black text on white.",
  },
  {
    q: "Can I use Android's Color Inversion accessibility setting instead?",
    a: "You can, but it flips your entire screen — every app, icon, and photo, not just the PDF — and you have to remember to switch it back off.",
  },
  {
    q: "What about viewing PDFs saved in Samsung Notes?",
    a: "Samsung Notes has a known quirk: dark mode doesn't apply to imported PDFs when the note's default color style is Transparent. Switching it to Black in Notes settings is the reported fix.",
  },
  {
    q: "How is this different from a system-wide fix?",
    a: "PDF Dark changes nothing on your phone. You convert the file once, and the output is an ordinary PDF with the dark theme baked in — it opens dark in any viewer, on any phone.",
  },
  {
    q: "Is my PDF uploaded anywhere when I use this on my phone?",
    a: "No. The conversion runs entirely in your Android browser tab — nothing is sent to a server, and there's no account or install.",
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

export default function AndroidVariantPage() {
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
            PDF Dark Mode on Android — No Root, No System Hack
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You tap a PDF attachment on your phone and the viewer fills the
            screen with white — even though the phone has been on the dark
            theme for years. You check the viewer&apos;s menu: print, share,
            open with, nothing about dark. So you dig into Settings, find
            Color Inversion under Accessibility, and now your home screen
            icons and photos look like X-ray film. That dead end isn&apos;t
            your phone — Android has no real PDF dark mode, and users have
            been asking for one on Google&apos;s own{" "}
            <a
              href="https://support.google.com/drive/thread/406087422"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Drive
            </a>{" "}
            and{" "}
            <a
              href="https://support.google.com/docs/thread/301868736"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              Docs
            </a>{" "}
            forums for years. Here&apos;s the way around it.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            To just read, open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in any Android browser and pick your PDF — it renders dark
            immediately. To keep a dark copy that opens dark in Files by
            Google, WPS, or any other viewer, run it through the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            once. Both run on your phone; the file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: read with a dark theme in your browser
          </h2>
          <p className="mb-4">
            Android&apos;s built-in viewers have no dark switch for the page,
            and the system-level Color Inversion isn&apos;t scoped to the
            document — so the fastest route skips both:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                PDF dark mode reader
              </Link>{" "}
              in Chrome, Firefox, or any Android browser.
            </li>
            <li>
              Pick the PDF from your Downloads folder or file manager.
            </li>
            <li>
              Choose a theme — Midnight, Sepia, Solarized, or pure-black
              OLED — and read. Pages render dark right in the tab.
            </li>
          </ol>
          <p className="mb-5">
            Nothing installs and nothing changes on your phone — no
            Accessibility toggle to remember to switch off afterward. It
            works the same on a Pixel, a Samsung, or any other phone, in
            whatever browser you already use.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as an Android viewer normally shows it: black text on a bright white background with a color photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — the default white page
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
            into a negative, the way Color Inversion would leave it.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 2: convert the file, then open it in any app
          </h2>
          <p className="mb-4">
            When you want the PDF to stay dark — in your usual viewer app,
            after reopening, or on someone else&apos;s phone — convert it
            once:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in your browser and pick the PDF.
            </li>
            <li>
              Choose a theme and tap Download. The dark copy saves to your
              Downloads folder like any other file.
            </li>
            <li>
              Open it in Files by Google, WPS, Acrobat, or whatever viewer
              you normally use — it opens dark in all of them.
            </li>
          </ol>
          <p className="mb-5">
            The conversion runs in the browser tab on your phone, whatever
            the manufacturer or Android version — nothing is uploaded.
            Because the colors are rewritten inside the file, the copy stays
            dark when you send it to someone else&apos;s phone too.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Have a PDF open on your phone right now? Drop it on the reader
              and it renders dark in your browser — no app install, no
              Accessibility settings to flip.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode on Android FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-android" />
      </main>

      <Footer />
    </div>
  );
}
