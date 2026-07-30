import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-edge";
const TITLE = "PDF Dark Mode in Microsoft Edge — Beyond the Flags Page Hack";
const DESCRIPTION =
  "Turning on Edge's dark theme doesn't touch your PDFs — the page stays white. There's a flag that can force it dark, but it wrecks your images. Here's a cleaner fix.";
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
    q: "Does Microsoft Edge have a built-in PDF dark mode?",
    a: "No. Edge's dark theme darkens the toolbar, tabs, and menus, but the PDF page itself always renders on a white background — same as Chrome, since both use the same viewer.",
  },
  {
    q: "What is the 'Force Dark Mode for Web Contents' flag in edge://flags?",
    a: "An experimental switch that force-darkens all rendered page content. It was built for websites, inverts images along the way, and can change or disappear in any Edge update.",
  },
  {
    q: "If I enable that flag, will my PDF actually look good?",
    a: "Plain text documents look passable. Anything with photos, a logo, or a colored chart gets the same blanket filter as the text — expect color-flipped images next to your dark pages.",
  },
  {
    q: "What's the F12 Console trick people mention for Edge PDFs?",
    a: "A DevTools command that inverts the embedded viewer for the current tab only. It works, but you retype it every time you reload or open a new PDF — a tinkerer's trick, not a workflow.",
  },
  {
    q: "Are there Microsoft Edge Add-ons for PDF dark mode?",
    a: "Yes, built like their Chrome counterparts: a CSS invert filter over the page. Images get inverted along with text, and the extension gets permission to read and modify pages.",
  },
  {
    q: "Is my PDF uploaded anywhere when I use PDF Dark?",
    a: "No. The conversion runs entirely inside your Edge tab — open DevTools → Network while converting and you'll see no request carrying your file.",
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

export default function EdgeVariantPage() {
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
            PDF Dark Mode in Microsoft Edge — Beyond the Flags Page Hack
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            5 min read
          </p>

          <p className="text-lg mb-8">
            You set Edge to Dark in its appearance settings and watched the
            tabs and menus dim, then opened tonight&apos;s reading — a PDF —
            and the document is exactly as bright as before. You check the
            PDF toolbar: draw, highlight, read aloud, but nothing about a
            dark background. In Edge, the app theme and the document&apos;s
            own colors are two separate things, and only one of them has a
            switch. Here&apos;s how to darken the document itself.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            To just read, open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in an Edge tab and drop your file on it. To keep a dark copy —
            or to annotate it with Edge&apos;s own tools — use the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            first, then open the downloaded file in Edge. Both run entirely
            in your browser; the file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: read with a dark theme in Edge
          </h2>
          <p className="mb-4">
            The fastest route — nothing installed, nothing saved:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open a new Edge tab and go to the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                PDF dark mode reader
              </Link>
              .
            </li>
            <li>
              Drag your PDF onto the page, or click to pick it from your
              Downloads folder.
            </li>
            <li>
              Pick a theme — Midnight, Sepia, Solarized, or pure-black OLED —
              and read. Pages render dark right in the tab.
            </li>
          </ol>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Before / after
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
            <figure className="m-0">
              <div className="rounded-lg overflow-hidden border border-neutral-800">
                <Image
                  src="/compare/original.png"
                  alt="A PDF page as Edge normally shows it: black text on a bright white background with a color photo"
                  width={720}
                  height={933}
                  sizes="50vw"
                />
              </div>
              <figcaption className="mt-2 text-center text-xs text-neutral-500">
                Before — Edge&apos;s default white page
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
            Option 2: convert the file, then annotate it in Edge
          </h2>
          <p className="mb-4">
            Edge&apos;s built-in PDF viewer has solid annotation tools. They
            can&apos;t darken the page — but they work fine on a page that
            comes to them already dark:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              in Edge and drop your PDF on it. The file is parsed right in
              the tab by{" "}
              <a
                href="https://github.com/mozilla/pdf.js"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline"
              >
                PDF.js
              </a>
              , Mozilla&apos;s open-source PDF engine — nothing is uploaded.
            </li>
            <li>Pick a theme and click Download.</li>
            <li>
              Open the downloaded file in Edge — drag it into a new tab, or
              press <strong className="text-neutral-100">Ctrl+O</strong> and
              pick it from Downloads.
            </li>
            <li>
              Annotate as usual with Draw, Highlight, or Add text. On a dark
              page, lighter ink colors — white, yellow — stay readable.
            </li>
          </ol>
          <p className="mb-5">
            When you save, your annotations and the dark background are both
            part of the file. Send it to a colleague or open it on your
            phone, and it shows up dark with your notes intact.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            What Edge&apos;s PDF viewer brings to the table
          </h2>
          <p className="mb-4">
            Edge&apos;s viewer is better equipped than Chrome&apos;s, which is
            worth knowing if you read a lot of PDFs in the browser:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-5">
            <li>
              <strong className="text-neutral-100">Draw</strong> — freehand
              ink with adjustable color and thickness
            </li>
            <li>
              <strong className="text-neutral-100">Highlight</strong> and{" "}
              <strong className="text-neutral-100">Add text</strong> — for
              marking up contracts and papers
            </li>
            <li>
              <strong className="text-neutral-100">Read aloud</strong> — Edge
              reads the document to you
            </li>
            <li>
              <strong className="text-neutral-100">Ask Copilot</strong> — on
              recent versions, summarize or question the document
            </li>
          </ul>
          <p className="mb-5">
            None of these change the page background — and all of them work
            normally on a converted dark PDF. That combination is the point
            of Option 2: Edge supplies the tools, the converted file supplies
            the dark page.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Have a PDF open in Edge right now? Drop it on the reader and
              keep reading it dark — nothing installed, nothing saved.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode in Microsoft Edge FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-edge" />
      </main>

      <Footer />
    </div>
  );
}
