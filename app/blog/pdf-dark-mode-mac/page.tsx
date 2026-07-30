import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-mac";
const TITLE = "PDF Dark Mode on Mac — Beyond Preview's New Toggle";
const DESCRIPTION =
  "macOS Tahoe added a dark mode switch for PDFs in Preview. Here's what it does, where it falls short, and how to get a PDF that's dark everywhere.";
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
    q: "Does turning on Dark Mode in macOS System Settings darken PDFs?",
    a: "No. System-wide Dark Mode changes app chrome — toolbars, menus, sidebars — while the page inside a PDF keeps its original colors.",
  },
  {
    q: "What is \"Use Dark Appearance for PDF\" in Preview?",
    a: "A View-menu option added in macOS Tahoe (macOS 26) that darkens the page inside Preview. Text inverts to read against dark while photos keep their original colors.",
  },
  {
    q: "Which macOS version do I need for the Preview dark mode toggle?",
    a: "macOS Tahoe (macOS 26) or later. On Sequoia or earlier the option isn't in Preview's View menu at all.",
  },
  {
    q: "Is there a keyboard shortcut for it?",
    a: "Not by default. You can add one in System Settings → Keyboard → Keyboard Shortcuts → App Shortcuts, scoped to Preview.",
  },
  {
    q: "Does the toggle stay on the file, or is it just how Preview displays it?",
    a: "It's a display setting — the PDF itself is untouched. Open the same file in Chrome or Acrobat and it's back to its original white background.",
  },
  {
    q: "If I email or print the PDF, will it be dark?",
    a: "No. The toggle never alters the file, so recipients and printed copies get the original colors. To share a dark version, convert the file first.",
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

export default function MacVariantPage() {
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
            PDF Dark Mode on Mac — Beyond Preview&apos;s New Toggle
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            Your Mac has been in dark mode for years — menu bar, Finder, every
            app. Then you double-click a PDF, Preview opens, and a bright
            white page cuts a rectangle out of your dark desktop. You scan
            Preview&apos;s toolbar for a dark switch and find nothing — because
            it&apos;s not on the toolbar. It&apos;s up in the menu bar, and
            only if your Mac is on the newest macOS. Here&apos;s where it
            lives, what it covers, and what to do when it&apos;s not there.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            On macOS Tahoe (macOS 26), the switch is built in: open the PDF
            in Preview and click View → Use Dark Appearance for PDF. On
            earlier macOS versions — or when you want the file itself to be
            dark, in any app — open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in your browser, or make a dark copy with the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>
            . Both run entirely on your Mac; the file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: turn on dark appearance in Preview
          </h2>
          <p className="mb-4">
            If your Mac runs macOS Tahoe (macOS 26) or later, Preview can
            darken the page itself:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>Open your PDF in Preview.</li>
            <li>
              Click <strong className="text-neutral-100">View</strong> in the
              menu bar.
            </li>
            <li>
              Choose{" "}
              <strong className="text-neutral-100">
                Use Dark Appearance for PDF
              </strong>
              .
            </li>
          </ol>
          <p className="mb-5">
            The page background turns dark and photos keep their original
            colors instead of flipping into negatives — Apple handled the
            hard part of PDF dark mode carefully.{" "}
            <a
              href="https://blog.sangeeth.dev/notes/preview-app-adds-dark-mode-toggle-for-pdfs-on-macos-tahoe-ios-and-ipados-26/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              The option arrived with Tahoe
            </a>
            , exists only in Preview, and changes how Preview displays the
            file, not the file itself — the same PDF still opens white in
            Chrome, Acrobat, or anyone else&apos;s inbox. If you read mostly
            in Preview on a Mac that&apos;s already on Tahoe, the toggle may
            be all you need.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as Preview normally shows it on a Mac: black text on a bright white background with a color photo"
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
            into a negative.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 2: convert the file, then open it anywhere
          </h2>
          <p className="mb-4">
            When the darkness needs to be part of the file — on Sequoia or
            older, in an app other than Preview, or in a PDF you&apos;re
            sending to someone — convert it once:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in Safari, Chrome, or any browser and drop your PDF on it.
            </li>
            <li>
              Pick a theme — Midnight, Sepia, Solarized, or pure-black
              OLED — and click Download.
            </li>
            <li>
              Open the downloaded copy from your Downloads folder — in
              Preview, Chrome, Acrobat, whichever app you like. It opens
              dark in all of them, on any macOS version.
            </li>
          </ol>
          <p className="mb-5">
            The processing happens entirely in the browser tab on your Mac —
            the file is never uploaded. Your original stays untouched on
            disk — the converter produces a separate dark copy alongside
            it — and because the colors are rewritten inside that copy, it
            stays dark when you email or AirDrop it.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Reading tonight on a Mac that doesn&apos;t have the toggle?
              Drop the PDF on the reader and it renders dark in your
              browser — nothing installed, nothing saved.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode on Mac FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-mac" />
      </main>

      <Footer />
    </div>
  );
}
