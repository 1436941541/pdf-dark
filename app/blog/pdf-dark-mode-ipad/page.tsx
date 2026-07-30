import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-ipad";
const TITLE =
  "PDF Dark Mode on iPad & iPhone — the iOS 26 Toggle & Beyond";
const DESCRIPTION =
  "iOS 26 added a Dark Background toggle for PDFs in Files and Books. Here's what it does, its four limits, and how to get a PDF that stays dark everywhere.";
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
    q: "Does iPhone or iPad have a built-in PDF dark mode?",
    a: "As of iOS 26 and iPadOS 26, yes: open a PDF in Files or Books, tap the ••• menu, and switch on Dark Background. Photos in the PDF keep their original colors.",
  },
  {
    q: "What's the catch with Apple's Dark Background toggle?",
    a: "It only changes how that app displays the file — the PDF itself is untouched, so it reopens white in other apps and arrives white when you share it.",
  },
  {
    q: "I don't see a Dark Background option on my iPad — why not?",
    a: "It requires iOS 26 / iPadOS 26 and lives only in Apple's own Files and Books apps. Third-party viewers like GoodReader or Acrobat need their own dark mode.",
  },
  {
    q: "How did people read PDFs in dark mode on iPhone before iOS 26?",
    a: "Settings → Accessibility → Display & Text Size → Smart Invert (or Classic Invert) — a system-wide filter that also flips app icons and makes photos look wrong.",
  },
  {
    q: "Can I make a PDF that stays dark for everyone, on any device?",
    a: "Yes — convert it. PDF Dark writes a new PDF with the dark theme baked into the pages, so it opens dark in any viewer on any device, however old.",
  },
  {
    q: "Does PDF Dark work in Safari on iPhone and iPad?",
    a: "Yes. It runs entirely in mobile Safari — no app, no account — and the converted file downloads straight to the Files app.",
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

export default function IpadVariantPage() {
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
            PDF Dark Mode on iPad &amp; iPhone — the iOS 26 Toggle &amp;
            Beyond
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You&apos;re in bed reading a PDF in the Files app, brightness
            already at the bottom, and the page is still a bright white slab —
            even though the iPad itself has been in dark mode all along. You
            tap through the buttons at the top — markup, search, share — and
            none of them mention dark. The switch does exist, but it hides
            behind the ••• menu, and only shows up at all on iPadOS 26.
            Here&apos;s where it is, what it covers, and what to use when
            it&apos;s not there.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            On iOS 26 / iPadOS 26 or later, open the PDF in Files or Books,
            tap the ••• menu, and switch on Dark Background. On older
            versions — or when you want a copy that stays dark in any app —
            open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in Safari, or make a dark copy with the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>
            . Both run on your device; the file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: turn on Dark Background in Files or Books
          </h2>
          <p className="mb-4">
            If your iPhone or iPad runs iOS 26 / iPadOS 26 or later, the
            switch is built into Apple&apos;s own apps:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the PDF in the{" "}
              <strong className="text-neutral-100">Files</strong> app or{" "}
              <strong className="text-neutral-100">Books</strong> app.
            </li>
            <li>
              Tap the <strong className="text-neutral-100">•••</strong>{" "}
              overflow menu at the top.
            </li>
            <li>
              Switch on{" "}
              <strong className="text-neutral-100">Dark Background</strong>.
            </li>
          </ol>
          <p className="mb-5">
            The page inverts while photos keep their original colors —
            exactly how a PDF dark mode should treat images.{" "}
            <a
              href="https://blog.sangeeth.dev/notes/preview-app-adds-dark-mode-toggle-for-pdfs-on-macos-tahoe-ios-and-ipados-26/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              The toggle shipped with iOS 26 and iPadOS 26
            </a>
            , lives only in Files and Books, and is a display setting: the
            file itself stays white, so it reopens white in other apps and
            arrives white if you AirDrop or email it.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as the Files app normally shows it on an iPad: black text on a bright white background with a color photo"
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
            Option 2: convert the file for every other app
          </h2>
          <p className="mb-4">
            When you need the darkness in the file itself — on an older iOS,
            in a third-party PDF app, or in a copy you&apos;re sending to
            someone — convert it once:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in Safari and pick the PDF — from Files, iCloud Drive, or a
              Mail attachment.
            </li>
            <li>
              Choose a theme and tap Download. The dark copy lands in the
              Files app.
            </li>
            <li>
              Open it in any PDF app — Acrobat, GoodReader, Books, an older
              iPad still on iOS 17 — and it&apos;s dark there too.
            </li>
          </ol>
          <p className="mb-5">
            The processing happens in the Safari tab on your device — nothing
            is uploaded. Because the colors are rewritten inside the file,
            the dark copy survives reopening, stays dark in every viewer,
            and shows up dark on the phone of whoever you send it to.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Reading a PDF right now in an app without the toggle? Open it
              in the reader and it renders dark in Safari — no install, no
              iOS version to check.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode on iPad &amp; iPhone FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-ipad" />
      </main>

      <Footer />
    </div>
  );
}
