import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-windows";
const TITLE = "PDF Dark Mode on Windows 11 & 10 — No App Required";
const DESCRIPTION =
  "Windows dark mode darkens the taskbar and apps but never your PDFs. Read or convert any PDF to dark mode in your browser — free, works with every viewer.";
const PUBLISHED = "2026-07-30";
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
    q: "Does Windows dark mode change how PDFs look?",
    a: "No. The Dark setting under Settings → Personalization → Colors themes the taskbar, File Explorer, and apps that support it — a PDF carries its own colors inside the file, and viewers render them as saved.",
  },
  {
    q: "Does Edge on Windows have a PDF dark mode?",
    a: "No. Edge is the default PDF viewer on Windows 11, and its dark theme only recolors the toolbar — the page stays white. The same goes for Chrome and Firefox.",
  },
  {
    q: "Can Adobe Acrobat on Windows darken the page?",
    a: "Sort of — Preferences → Accessibility → Replace Document Colors recolors pages inside Acrobat. It's an app-level display setting: the file itself stays white everywhere else.",
  },
  {
    q: "Will the converted dark PDF open in any Windows app?",
    a: "Yes. The dark colors are written into the file, so it opens dark in Edge, Acrobat, Sumatra, or any other viewer — and File Explorer's preview pane shows it dark too.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. Both the reader and the converter run in your browser on any Windows version with a modern browser — nothing is installed and there are no permissions to grant.",
  },
  {
    q: "Is my PDF uploaded anywhere?",
    a: "No. The conversion runs entirely in your browser tab — open DevTools → Network while converting and you'll see no request carrying your file.",
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

export default function WindowsVariantPage() {
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
            PDF Dark Mode on Windows 11 &amp; 10 — No App Required
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            3 min read
          </p>

          <p className="text-lg mb-8">
            You switched Windows to dark mode months ago — taskbar, File
            Explorer, Settings, everything. Then you double-click a PDF, it
            opens in Edge, and a full-screen white page undoes all of it. You
            look through the viewer&apos;s toolbar, then through
            Windows&apos; own settings, and find nothing that darkens the
            document itself. That&apos;s because nothing there does: Windows
            themes the apps, and a PDF brings its own colors. Here&apos;s how
            to darken the document.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The quick answer
          </h2>
          <p className="mb-5">
            To just read, open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in any browser and drop your file on it. To get a copy that opens
            dark in every Windows app — Edge, Acrobat, Sumatra, even the File
            Explorer preview — run it through the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            once and download the result. Both run locally in your browser;
            the file is never uploaded.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Option 1: read with a dark theme, right now
          </h2>
          <p className="mb-4">
            The fastest route — nothing installed, nothing saved:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                PDF dark mode reader
              </Link>{" "}
              in Edge, Chrome, or Firefox.
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
                  alt="A PDF page as Windows normally shows it: black text on a bright white background with a color photo"
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
            Option 2: convert the file — it opens dark in every Windows app
          </h2>
          <p className="mb-4">
            When the darkness should stick — for a document you keep coming
            back to, or one you want dark in Acrobat and Edge alike:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              and drop your PDF on it. The file is parsed right in the tab by{" "}
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
              Open the file from your Downloads folder. Double-click and it
              opens dark in your default viewer; it looks the same in Edge,
              Acrobat, or Sumatra, because the colors now live in the file.
            </li>
          </ol>
          <p className="mb-5">
            Two small Windows touches worth knowing. With File Explorer&apos;s
            preview pane on (View → Show → Preview pane), selecting the
            converted file shows the dark pages before you even open it. And
            if you&apos;d rather these files open in a specific app, Settings
            → Apps → Default apps lets you point <code className="text-amber-400 text-[0.85em] bg-neutral-900 px-1.5 py-0.5 rounded">.pdf</code>{" "}
            at Acrobat, Sumatra, or any reader you prefer — the dark
            background follows the file, not the app.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Have a PDF open right now? Drop it on the reader and keep
              reading it dark — nothing installed, nothing saved.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode on Windows FAQ
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

        <RelatedVariants currentSlug="pdf-dark-mode-windows" />
      </main>

      <Footer />
    </div>
  );
}
