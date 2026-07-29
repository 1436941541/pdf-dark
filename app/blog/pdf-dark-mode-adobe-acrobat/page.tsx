import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-adobe-acrobat";
const TITLE = "PDF Dark Mode in Adobe Acrobat — The Setting Is Hidden in Accessibility";
const DESCRIPTION =
  "Acrobat's 'Dark Gray' theme only skins the toolbar — your PDF pages stay white. The real page-darkening option lives in Preferences → Accessibility, and it's a software setting, not a file setting. Here's the difference, and a faster way.";

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
    a: "Because Dark Gray is an interface theme, not a page setting. It lives under View → Display Theme, and it only recolors the toolbar, side panels, and menus. The document canvas — the actual page you're reading — keeps rendering with whatever background color is baked into the PDF, almost always white.",
  },
  {
    q: "So how do you actually make the page content dark in Acrobat?",
    a: "Open Edit → Preferences on Windows (Acrobat → Preferences on Mac), pick the Accessibility category, and check 'Replace Document Colors.' Then choose 'Use Custom Color' and set Page Background to a dark color and Document Text to a light color (or pick one of Acrobat's built-in high-contrast presets from the same dropdown). This is the setting that actually repaints the page — Dark Gray never touches it.",
  },
  {
    q: "Why is this setting under Accessibility instead of somewhere more obvious?",
    a: "Because Adobe built it for low-vision and high-contrast reading needs, not as a 'dark mode' feature. It works for darkening PDFs too, but nothing in the main View or Theme menus points you there — most users never find it, and support threads are full of people who assumed Dark Gray was supposed to do this.",
  },
  {
    q: "Do images stay normal-colored when I use Replace Document Colors?",
    a: "Yes — Acrobat's color replacement only touches page background and text, so photos and images keep their original colors instead of getting inverted into film-negative colors. That part is done right. The trade-off is getting there: it's a multi-step trip through Preferences that most readers won't discover on their own.",
  },
  {
    q: "If I set this up on my laptop, will the PDF still look dark on my phone or on a coworker's computer?",
    a: "No. Replace Document Colors is an Acrobat application preference, not something saved inside the PDF file. It only affects how your copy of Acrobat displays PDFs. Open the same file in Acrobat Reader mobile, a different desktop, Preview, or send it to a colleague, and it opens back up in its original white-background colors — the darkness never travels with the file.",
  },
  {
    q: "Is there a way to get a PDF that's actually dark everywhere, on any device, for anyone who opens it?",
    a: "Yes — convert the file itself instead of changing a viewer setting. PDF Dark repaints the page pixels and saves a new PDF, so the dark theme is part of the file. Open it in Acrobat, Preview, a phone, anywhere, with no preferences to configure and nothing to explain to whoever you send it to.",
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
    author: { "@type": "Organization", name: "PDF Dark" },
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
            <a href="#why" className="hover:text-neutral-100">
              Why Acrobat&apos;s setting confuses people
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
            PDF Dark Mode in Adobe Acrobat
            <span className="block text-amber-400 mt-2">
              Hidden in Accessibility, Not Themes
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Acrobat&apos;s{" "}
            <strong className="text-neutral-100">Dark Gray</strong> theme only
            recolors the app around the page — the page itself stays white.
            The setting that actually darkens it lives somewhere most people
            never look.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 29, 2026</span>
            <span aria-hidden>·</span>
            <span>8 min read</span>
          </div>
        </section>

        {/* Quick answer */}
        <section className="max-w-3xl mx-auto px-6 pb-12">
          <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5 text-left">
            <h2 className="text-base font-semibold text-amber-400 m-0 mb-3">
              The quick answer: darken the page in Acrobat
            </h2>
            <ol className="text-sm text-neutral-300 list-decimal pl-5 space-y-1.5 m-0">
              <li>
                Open Preferences:{" "}
                <strong className="text-neutral-100">
                  Edit → Preferences
                </strong>{" "}
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
                <strong className="text-neutral-100">
                  Replace Document Colors
                </strong>
                .
              </li>
              <li>
                Choose{" "}
                <strong className="text-neutral-100">Use Custom Color</strong>{" "}
                — set Page Background to a dark color and Document Text to a
                light one (or pick a built-in high-contrast combination).
              </li>
              <li>Click OK — every PDF you open now renders dark.</li>
            </ol>
            <p className="text-sm text-neutral-400 mt-4 mb-0">
              This is a viewer preference on your machine — it never changes
              the file itself. The Dark Gray theme under View → Display Theme
              only recolors the toolbar, never the page.
            </p>
          </div>
        </section>

        {/* Why Acrobat's dark mode confuses people */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Two different settings, one confusing name
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Acrobat actually has two unrelated things people lump together
              as &ldquo;dark mode.&rdquo; Only one of them touches the page.
            </p>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-5">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-900/60 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      Setting
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      Where
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      What it changes
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      The catch
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-900">
                    <td className="px-4 py-4 align-top font-semibold text-neutral-100 whitespace-nowrap">
                      &ldquo;Dark Gray&rdquo; theme
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                        View → Display Theme
                      </code>
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      App chrome only — toolbar, side panels, menus
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-400">
                      The page itself, the part you&apos;re actually reading,
                      never changes color
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 align-top font-semibold text-neutral-100 whitespace-nowrap">
                      Replace Document Colors
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                        Edit → Preferences → Accessibility
                      </code>
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      Page background + text color, via Custom Color
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-400">
                      Filed under accessibility not display, manual to set
                      up, and it&apos;s an app preference — not saved into
                      the file, so it doesn&apos;t travel to another device
                      or a shared copy
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-neutral-400 text-sm mb-5">
              Images stay their original color under Replace Document
              Colors — Acrobat gets that part right. The trade-off is
              getting there: a multi-step trip through Preferences most
              readers never find on their own.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Darkens the actual file, so it&apos;s dark in Acrobat, on
                    your phone, and for whoever you send it to — no
                    per-device setup
                  </li>
                  <li>
                    One drop zone, no Preferences menu, no Accessibility tab
                    to dig through
                  </li>
                  <li>
                    Images keep their real colors automatically — no manual
                    color picking required
                  </li>
                  <li>
                    Runs entirely in your browser — your file never leaves
                    your device
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Using PDF Dark instead */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-6 text-center text-neutral-50">
            Using PDF Dark instead of Acrobat&apos;s menus
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            From the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>
            , drag in the same PDF you&apos;d normally open in Acrobat, pick
            a theme, and download. Photos and images are detected and kept
            in their original colors automatically — no Page Background /
            Document Text pickers to fuss with, no Preferences menu, no
            Accessibility tab.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            The image handling in particular runs itself, with no color
            pickers to configure — pages are read as vector data where
            possible, and each image is sampled for brightness before the
            tool decides whether to touch it.{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              Here&apos;s exactly how that works
            </Link>
            . The output is a new PDF file, dark in Acrobat, on any computer,
            on your phone, or for whoever you send it to, with nothing to
            configure on their end. Just want to read it once without saving
            a new file? You can also{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              read a PDF in dark mode
            </Link>{" "}
            right on this page instead.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            Works in any modern browser on Windows, Mac, Linux, or mobile — no
            Adobe Acrobat installation required to use it.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Skip Acrobat&apos;s Preferences menu entirely
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            A dark PDF that stays dark, on every device, for anyone you send it to
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop your PDF in, pick a theme, and download a file that&apos;s
            already dark — no Accessibility settings to find or reconfigure
            on your next machine.
          </p>
          <Link
            href="/converter"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Convert a PDF to dark mode →
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Just want to read one file right now?{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              Open it in the dark-mode reader instead
            </Link>
            .
          </p>
        </section>

        <RelatedVariants currentSlug="pdf-dark-mode-adobe-acrobat" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Adobe Acrobat PDF dark mode FAQ
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
