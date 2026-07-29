import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-mac";
const TITLE = "PDF Dark Mode on Mac — Beyond Preview's New Toggle";
const DESCRIPTION =
  "macOS Tahoe finally added a dark mode switch for PDFs in Preview. Here's exactly what it does, where it falls short, and how to get a PDF that's dark everywhere — not just in Preview.";

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
    a: "No. System-wide Dark Mode changes app chrome — toolbars, menus, sidebars — but it's not designed to touch the content inside a document. Open a PDF with a white background and it stays white, because the content and the app's UI are treated as separate things by design.",
  },
  {
    q: "What is \"Use Dark Appearance for PDF\" in Preview?",
    a: "It's a View-menu option macOS added in macOS Tahoe (macOS 26, released September 2025) that darkens the actual page background inside Preview. Text and vector graphics get inverted so they read against dark, while photos are left alone rather than turned into negatives — a genuinely thoughtful implementation.",
  },
  {
    q: "Which macOS version do I need for the Preview dark mode toggle?",
    a: "macOS Tahoe (macOS 26) or later. It's a new feature, so if you're on Sequoia or an earlier version, you won't see it in Preview's View menu — you'd need to update macOS first, which not everyone does right away on a major-version release.",
  },
  {
    q: "Is there a keyboard shortcut for it?",
    a: "Not by default. You can add one yourself in System Settings → Keyboard → Keyboard Shortcuts → App Shortcuts by adding a shortcut for \"Use Dark Appearance for PDF\" scoped to Preview.",
  },
  {
    q: "Does the toggle stay on the file, or is it just how Preview displays it?",
    a: "It's a viewer setting, not a file change. The PDF itself is untouched — open the same file in Chrome, Acrobat, or any other app and it opens with its original white background, because the dark appearance is something Preview applies at display time, not something saved into the document.",
  },
  {
    q: "If I email or print the PDF, will it be dark?",
    a: "No. Since the toggle doesn't alter the underlying file, anyone else who opens it — or a printed copy — sees the original colors. It's a personal, in-app reading convenience, not a way to produce a dark file to share.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Dark Mode for Mac",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "macOS (any version, any browser)",
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
            <a href="#why" className="hover:text-neutral-100">
              What Preview does
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
            PDF Dark Mode on Mac
            <span className="block text-amber-400 mt-2">
              Beyond Preview&apos;s New Toggle
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            macOS Tahoe finally gave Preview a real dark-page switch for PDFs.{" "}
            <strong className="text-neutral-100">
              It&apos;s well made — and it only works in one app, on one OS
              version, for as long as the window stays open.
            </strong>
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 18, 2026</span>
            <span aria-hidden>·</span>
            <span>7 min read</span>
          </div>
        </section>

        {/* What Preview does */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              What macOS actually darkens — and what it doesn&apos;t
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              There are two separate things called &ldquo;dark mode&rdquo; on
              a Mac, and mixing them up is the source of most of the
              confusion.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  System-wide Dark Mode
                </h3>
                <p className="text-sm text-neutral-400">
                  The Appearance setting in System Settings switches app
                  chrome — toolbars, sidebars, menus, dialog boxes — to dark.
                  It was never meant to reach inside a document&apos;s
                  content. Open a white PDF with system Dark Mode on and the
                  page is still white, by design: content and UI are two
                  different layers.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Preview&apos;s &ldquo;Use Dark Appearance for PDF&rdquo;
                </h3>
                <p className="text-sm text-neutral-400 mb-3">
                  macOS Tahoe (macOS 26, released September 2025) added a
                  View-menu option that finally darkens the page itself
                  inside Preview. It&apos;s a genuinely smart implementation:
                  text and vector graphics are inverted for readability, but
                  photos are detected and left in their original colors
                  instead of turning into negatives. That said, it comes with
                  real limits:
                </p>
                <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-neutral-200">
                      Preview-only.
                    </strong>{" "}
                    Open the same file in Chrome, Acrobat, or any other
                    viewer on the same Mac, and it&apos;s back to a white
                    background — the setting lives in the app, not the file.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      macOS 26+ only.
                    </strong>{" "}
                    It doesn&apos;t exist on Sequoia or earlier, and plenty of
                    Macs won&apos;t be on the newest major version right
                    away.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      No default shortcut.
                    </strong>{" "}
                    You have to add one yourself in Keyboard Shortcuts if you
                    want a quick key to toggle it.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      Nothing is saved.
                    </strong>{" "}
                    It&apos;s a display-time effect, not a file change — email
                    the PDF, upload it, or print it, and the recipient sees
                    the original white version. You may also find yourself
                    switching it back on each time you reopen a file.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Works on any macOS version, in any browser — no Tahoe
                    required
                  </li>
                  <li>
                    Produces an actual dark-themed PDF file, not a
                    per-session viewer effect
                  </li>
                  <li>
                    That file opens dark in Preview, Chrome, Acrobat, on
                    another person&apos;s Mac, or on a phone — no per-app
                    toggle needed anywhere
                  </li>
                  <li>
                    Photos keep their real colors automatically, the same
                    idea Apple used, with an Images switch if you want to
                    force Original or Inverted
                  </li>
                  <li>
                    Your file never leaves your Mac — it&apos;s processed
                    locally in the browser tab
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Using PDF Dark on Mac */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-6 text-center text-neutral-50">
            Using PDF Dark on Mac
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Open the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>{" "}
            in Safari, Chrome, or any browser, drag a PDF in from Finder or
            Downloads, pick a theme, and download. The dark version lands in
            your Downloads folder like any other file — open it in Preview,
            Chrome, Acrobat, on an older Mac still on Sequoia, or send it to
            a friend on Windows, and it stays dark, because the color change
            is baked into the file itself, not into a viewer setting.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            It&apos;s the same pdf.js-plus-Web-Worker pipeline whether you&apos;re
            on the newest Apple Silicon Mac or a 2016 Intel model still on
            an older macOS —{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              the technical writeup
            </Link>{" "}
            covers exactly how it recolors a page. Just want to read
            something tonight without saving a new file? Use the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode PDF reader
            </Link>{" "}
            instead.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            Works on any Mac running a modern browser — Intel or Apple
            Silicon, any macOS version. Nothing to update, nothing to
            configure in System Settings.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Ready for a PDF that&apos;s dark in every app on your Mac?
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            3 steps, no macOS Tahoe required, no toggling per file
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a PDF on the reader to try it instantly in your browser, or
            convert it to a real dark-themed file you can keep and share.
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

        <RelatedVariants currentSlug="pdf-dark-mode-mac" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode on Mac FAQ
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
