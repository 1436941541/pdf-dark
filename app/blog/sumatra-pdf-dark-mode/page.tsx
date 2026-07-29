import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/sumatra-pdf-dark-mode";
const TITLE = "PDF Dark Mode in Sumatra PDF — the i Key vs. Editing settings.txt";
const DESCRIPTION =
  "Sumatra PDF already has two built-in ways to darken a page — the i shortcut and a settings.txt edit. Here's exactly how both work, why they fall short, and a fix that stays dark everywhere.";

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
    a: "Sort of — and it's better equipped than most PDF viewers here. Sumatra ships with a keyboard shortcut that inverts page colors on the spot, plus a settings file you can edit for a permanent custom color scheme. Neither is a one-click \"dark mode\" toggle in the settings menu, but both are real, built-in options.",
  },
  {
    q: "How do I invert colors in Sumatra PDF?",
    a: "Open a PDF, then press the i key on your keyboard. Sumatra immediately inverts the current document — background goes black, text goes white. It's the fastest way to get a dark page, but it only applies to that viewing session: close the file and reopen it, and you'll need to press i again.",
  },
  {
    q: "How do I make Sumatra's dark colors stick permanently?",
    a: "Go to Settings → Advanced Options. This opens a text file called SumatraPDF-settings.txt. Inside it, find the FixedPageUI and EbookUI sections and change the TextColor and BackgroundColor values to hex colors — for example TextColor eeeeee (light gray) and BackgroundColor 1a1a1a (near-black). Save the file and every PDF you open afterward uses that color scheme automatically, no more pressing i.",
  },
  {
    q: "Why do images look strange after pressing i or editing settings.txt?",
    a: "Both methods are a straight color inversion applied to the whole rendered page, images included. Photos and especially images with transparent backgrounds can come out looking wrong — this is a known complaint on Sumatra's own forum. There's no way to tell Sumatra \"invert the text but leave photos alone.\"",
  },
  {
    q: "Will this work on my phone or on a Mac?",
    a: "No. Sumatra PDF is Windows-only, so the i shortcut and the settings.txt edit only affect PDFs opened in Sumatra on that specific Windows machine. Open the same file on your phone, on a Mac, or in a browser, and you're back to a white page — you'd have to solve dark mode separately on every device.",
  },
  {
    q: "Is my PDF uploaded anywhere when I use PDF Dark?",
    a: "No. The conversion runs entirely in your browser tab via the File API and a Web Worker — nothing is sent to a server. You can confirm this yourself by opening DevTools → Network while converting a file.",
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
            <a href="#why" className="hover:text-neutral-100">
              What Sumatra offers
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
            PDF Dark Mode in Sumatra PDF
            <span className="block text-amber-400 mt-2">
              The i Key, the Settings.txt Fix — and What Both Miss
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Unlike Chrome or Adobe, Sumatra actually{" "}
            <strong className="text-neutral-100">
              ships with two ways to darken a page
            </strong>
            . Here&apos;s exactly how they work, and where they fall short.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 21, 2026</span>
            <span aria-hidden>·</span>
            <span>8 min read</span>
          </div>
        </section>

        {/* What Sumatra offers, and where it falls short */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Sumatra&apos;s two built-in dark mode tricks
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Credit where it&apos;s due: Sumatra PDF gives you more than most
              readers do out of the box. Both options are real — and both have
              a catch. (Recent builds, 3.5.2 and later, also add built-in Dark
              and Darker app themes — with a known quirk: while one of those
              themes is active, custom colors from settings.txt can be
              ignored.)
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  The{" "}
                  <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">
                    i
                  </code>{" "}
                  key — instant, but it doesn&apos;t stick
                </h3>
                <p className="text-sm text-neutral-400">
                  With a PDF open in Sumatra, press{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    i
                  </code>{" "}
                  on your keyboard and the whole document inverts on the spot
                  — background black, text white. It&apos;s the quickest dark
                  mode of any PDF viewer we&apos;ve covered. The catch: Sumatra
                  doesn&apos;t remember the setting per file. Close the
                  document and open it again — or open a different PDF — and
                  it&apos;s back to white until you press{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    i
                  </code>{" "}
                  again.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Editing SumatraPDF-settings.txt — permanent, but technical
                </h3>
                <p className="text-sm text-neutral-400">
                  For a fix that survives closing the app, go to{" "}
                  <strong className="text-neutral-200">Settings</strong> →{" "}
                  <strong className="text-neutral-200">
                    Advanced Options
                  </strong>
                  . This opens a plain text file,{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    SumatraPDF-settings.txt
                  </code>
                  . Inside, look for the{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    FixedPageUI
                  </code>{" "}
                  and{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    EbookUI
                  </code>{" "}
                  sections and change{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    TextColor
                  </code>{" "}
                  and{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    BackgroundColor
                  </code>{" "}
                  to hex values — for example{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    eeeeee
                  </code>{" "}
                  for text and{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    1a1a1a
                  </code>{" "}
                  for the background. Save it, and every PDF opens with that
                  color scheme from then on — no more repeated key presses.
                  The catch: it&apos;s a manual text-file edit with hex color
                  codes, which is comfortable territory for a lot of Sumatra
                  users but a real barrier for anyone who doesn&apos;t want to
                  hand-edit a config file.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Both methods share the same two blind spots
                </h3>
                <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-neutral-200">
                      Images can come out wrong.
                    </strong>{" "}
                    Both the{" "}
                    <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                      i
                    </code>{" "}
                    shortcut and the settings.txt colors invert the whole
                    rendered page, and photos or images with transparent
                    backgrounds often end up looking off — a complaint that
                    comes up on Sumatra&apos;s own forum.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      It&apos;s tied to this one Windows PC.
                    </strong>{" "}
                    Sumatra PDF is Windows-only. Neither the shortcut nor the
                    settings file follows the document to your phone, a Mac,
                    or a browser — open the same PDF anywhere else and
                    you&apos;re looking at a white page again.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Convert once and the file itself is dark — no shortcut to
                    repeat, no settings file to edit
                  </li>
                  <li>
                    Photos and images are detected and kept in their original
                    colors, so nothing turns into a negative
                  </li>
                  <li>
                    The resulting PDF stays dark in Sumatra, on your phone, on
                    a Mac, or in any browser — not just this one PC
                  </li>
                  <li>
                    Runs entirely in your browser tab — your file never
                    leaves your device
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Using PDF Dark for Sumatra users */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-6 text-center text-neutral-50">
            Using PDF Dark instead of the i key or settings.txt
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Open the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>{" "}
            in any browser, drag in the file, pick a theme, and download. No{" "}
            <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
              i
            </code>{" "}
            key to remember, no settings.txt to edit — and unlike Sumatra&apos;s
            inversion, images are detected and kept in their original colors
            automatically.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            It&apos;s a more deliberate process than a blanket invert — text
            gets recolored as vector data, and each image is evaluated on
            its own before the tool decides whether to touch it.{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              The full technical writeup is here
            </Link>
            . The file it produces opens dark in Sumatra, on your phone, a
            Mac, or a different Windows machine, because the color change is
            baked into the file itself. Just want to read something once
            without saving a copy? Use the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode PDF reader
            </Link>{" "}
            instead.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            Works in any modern browser on Windows, macOS, Linux, or a phone —
            you don&apos;t need Sumatra PDF installed to use it, and the file
            it produces still opens correctly in Sumatra afterward.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Ready for a PDF that&apos;s dark without pressing i every time?
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            3 steps, no settings.txt, no repeating a shortcut per file
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Convert once and the dark theme is part of the file — open it in
            Sumatra, on your phone, or anywhere else and it stays dark.
          </p>
          <Link
            href="/converter"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Convert a PDF to dark mode →
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Just want to read one now?{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              Open the dark mode reader instead
            </Link>
            .
          </p>
        </section>

        <RelatedVariants currentSlug="sumatra-pdf-dark-mode" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Sumatra PDF dark mode FAQ
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
