import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-ipad";
const TITLE =
  "PDF Dark Mode on iPad & iPhone — What iOS 26 Fixed, and What It Didn't";
const DESCRIPTION =
  "iOS and iPadOS 26 finally added a Dark Background toggle for PDFs in Files and Books. Here's exactly what it does, its four limits, and how to get a PDF that stays dark everywhere.";

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
    a: "As of iOS 26 and iPadOS 26 (released September 2025), yes — sort of. Open a PDF in the Files app or Books app, tap the overflow (•••) menu, and you'll find a “Dark Background” toggle. It's a genuinely smart implementation: text and backgrounds invert, but photos in the PDF keep their original colors instead of turning into film negatives.",
  },
  {
    q: "What's the catch with Apple's Dark Background toggle?",
    a: "It only darkens the current viewing session in that app — the PDF file on disk is completely unchanged. Close and reopen it, or open it in a different app, and it's back to white. AirDrop, email, or message that same file to someone else and it opens white on their end too, because nothing about the file itself was modified.",
  },
  {
    q: "I don't see a Dark Background option on my iPad — why not?",
    a: "Two likely reasons. First, it only exists on iOS 26 / iPadOS 26 or later — if you haven't installed the latest major update yet (plenty of people wait), the option simply isn't there. Second, it only lives inside Apple's own Files and Books apps. If you view PDFs in a third-party app like GoodReader, Adobe Acrobat, or a browser, that app needs to implement its own dark mode — Apple's toggle doesn't carry over.",
  },
  {
    q: "How did people read PDFs in dark mode on iPhone before iOS 26?",
    a: "The workaround was Settings → Accessibility → Display & Text Size → Smart Invert (or the harsher Classic Invert), sometimes scoped to just the Books app via the triple-click accessibility shortcut. It works, but it's a system-wide filter, not a PDF-aware one — it also inverts app icons and the status bar, and Classic Invert in particular makes photos and diagrams look wrong.",
  },
  {
    q: "Can I make a PDF that stays dark for everyone, on any device?",
    a: "That's what PDF Dark does differently: instead of a viewer-level toggle, it produces an actual new PDF file with the dark theme baked into the pages. Open it in Preview, Acrobat, a Kindle, Android, an old iPad on iOS 17 — it's dark everywhere, because the file itself changed, not just how one app happens to be looking at it that day.",
  },
  {
    q: "Does PDF Dark work in Safari on iPhone and iPad?",
    a: "Yes. It runs entirely in mobile Safari — no app to install, no account. Drop or pick a PDF, choose a theme, and download the result straight to the Files app, ready to share or reopen anywhere.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Dark Mode for iPad and iPhone",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "iOS and iPadOS (Safari)",
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
            <a href="#why" className="hover:text-neutral-100">
              What iOS 26 changed
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
            PDF Dark Mode on iPad &amp; iPhone
            <span className="block text-amber-400 mt-2">
              What iOS 26 Fixed, and What It Didn&apos;t
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Apple only just added a dark-mode toggle for PDFs, in{" "}
            <strong className="text-neutral-100">
              iOS 26 and iPadOS 26
            </strong>
            . It&apos;s a real fix — for one narrow case. Here&apos;s what it
            covers and what still needs a different tool.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 28, 2026</span>
            <span aria-hidden>·</span>
            <span>8 min read</span>
          </div>
        </section>

        {/* What iOS 26 changed */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              What Apple actually shipped in iOS 26
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              It&apos;s new, it&apos;s smartly built — and it solves less than
              it looks like at first glance.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Files and Books got a &ldquo;Dark Background&rdquo; toggle
                </h3>
                <p className="text-sm text-neutral-400">
                  Starting with iOS 26 / iPadOS 26 (released September 2025),
                  opening a PDF in the Files app or Books app and tapping the
                  overflow (
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    •••
                  </code>
                  ) menu reveals a Dark Background switch. Turn it on and the
                  page inverts to dark — and credit where it&apos;s due, it&apos;s
                  done well: text and white space invert, while photos inside
                  the PDF are left alone instead of turning into color
                  negatives.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Four things it doesn&apos;t cover
                </h3>
                <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-neutral-200">
                      It&apos;s a viewer setting, not a file change.
                    </strong>{" "}
                    The PDF on disk never changes. Close the app and reopen
                    the same file — it&apos;s white again until you flip the
                    toggle back on.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      It doesn&apos;t travel with the file.
                    </strong>{" "}
                    AirDrop, email, or message that PDF to someone else and it
                    opens white on their screen, because the bytes of the file
                    were never touched.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      It needs iOS 26 / iPadOS 26 or later.
                    </strong>{" "}
                    Plenty of people don&apos;t install a major OS update the
                    day it lands. On anything older, this option isn&apos;t in
                    the menu at all.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      It&apos;s Apple-app only.
                    </strong>{" "}
                    Open the same PDF in GoodReader, Adobe Acrobat, or another
                    third-party reader, and the toggle doesn&apos;t apply —
                    each app has to build its own.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Produces an actual new PDF file with the dark theme baked
                    into the pages — not a per-app viewing setting
                  </li>
                  <li>
                    Stays dark in any app, on any OS version, even a much
                    older iPad — because the file changed, not the viewer
                  </li>
                  <li>
                    Share it, AirDrop it, email it — it opens dark for whoever
                    receives it too
                  </li>
                  <li>
                    Photos keep their real colors automatically, with an
                    Images toggle if you want to force Original or Inverted
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Using PDF Dark on iPad and iPhone */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-6 text-center text-neutral-50">
            Using PDF Dark on iPad and iPhone
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Open the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>{" "}
            in Safari, tap to pick a PDF from Files, iCloud Drive, or a Mail
            attachment, choose a theme, and download. The dark version lands
            in the Files app, ready to AirDrop, attach to an email, or drop
            into iCloud Drive — no App Store install, no iOS version to
            check.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            None of that depends on iOS — the same engine runs whether
            you&apos;re on the newest iPhone or a five-year-old iPad still on
            iOS 17.{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              Curious how the recoloring actually works
            </Link>
            ? Or, if you just want to read something tonight without saving a
            new file, use the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode PDF reader
            </Link>{" "}
            instead.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            Works on any iPhone or iPad running a modern version of Safari —
            no iOS 26 required, unlike Apple&apos;s own Dark Background
            toggle.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Ready for a PDF that&apos;s dark everywhere, not just this app?
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            Works on any iOS version, in any PDF app, for anyone you send it to
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a PDF on the reader and it renders dark right in Safari — or
            convert it and keep a file that stays dark for good.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Read a PDF in dark mode →
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Want to keep the file?{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              Convert &amp; download it instead
            </Link>
            .
          </p>
        </section>

        <RelatedVariants currentSlug="pdf-dark-mode-ipad" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode on iPad &amp; iPhone FAQ
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
