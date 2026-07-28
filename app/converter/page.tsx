import type { Metadata } from "next";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/converter";
const TITLE = "Convert PDF to Dark Mode — Free Dark Mode PDF Converter";
const DESCRIPTION =
  "Convert any PDF to dark mode and download the darkened file. The theme is baked into a new PDF that stays dark in every viewer. Free, browser-side, no upload.";

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
    q: "What exactly does the converter produce?",
    a: "A brand-new PDF file with your chosen dark theme baked into the page content itself — recolored text and background, images handled per your Images setting. Open it in Acrobat, Preview, a browser, or an e-reader and it stays dark everywhere.",
  },
  {
    q: "Does the converted PDF keep selectable text?",
    a: "Yes, wherever the source page allows it. Text-based pages are recolored as vector objects, so the output text stays selectable and searchable. Scanned pages are images to begin with, so they are darkened as images.",
  },
  {
    q: "Will photos turn into negatives?",
    a: "No. The default Auto mode keeps photos in their original colors, inverts white screenshots and diagrams so they blend with the dark page, and gently dims very bright images. You can also force everything Original or everything Inverted before downloading.",
  },
  {
    q: "Can I print the dark version?",
    a: "Yes — that's one of the main reasons to convert instead of using a viewer theme. Print the downloaded file from any reader and the page comes out dark, exactly as you see it.",
  },
  {
    q: "Is there a file size limit?",
    a: "No hard limit. The conversion runs entirely on your device, so the practical ceiling is your browser's memory — large documents just take longer to build.",
  },
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. Rendering, recoloring, and rebuilding the PDF all happen inside your browser tab. The downloaded file is assembled locally — there's no server that ever sees your document.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Dark Converter",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(app) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

export default function ConverterPage() {
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
              Reader
            </Link>
            <a href="#how" className="hover:text-neutral-100">
              How it works
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-10 pb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Convert PDF to Dark Mode
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Pick a theme, drop your PDF, and a darkened copy downloads
            automatically. The theme is baked into the file itself, so it
            stays dark in every viewer — Acrobat, Preview, browsers,
            e-readers. Free, and your file never leaves the browser.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Download Dark PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% Browser-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 4 Themes
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Mobile
            </span>
          </div>

          {/* Downloader — settings first, then drop → convert → auto-download */}
          <div className="mt-8">
            <Downloader />
          </div>

          <p className="mt-6 text-sm text-neutral-500">
            Just here to read, not to convert?{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              Open the dark mode PDF reader
            </Link>
            .
          </p>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              How to convert a PDF to dark mode
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Text and background are rewritten into a low-light theme while
              images get smart per-image handling — photos keep their colors,
              white diagrams blend into the dark page.
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { n: "1", t: "Pick your settings", d: "Choose a theme — Midnight, Sepia, Solarized, or OLED pure black — plus image handling, darkness, and warmth." },
                { n: "2", t: "Drop your PDF", d: "Drag & drop or click to browse. Never leaves your browser." },
                { n: "3", t: "Get the dark PDF", d: "Conversion starts immediately and the new file downloads itself — theme baked in, ready to share, print, or read anywhere." },
              ].map((s) => (
                <div
                  key={s.n}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
                >
                  <div className="text-2xl font-bold text-amber-400">{s.n}</div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why convert instead of just reading dark */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Why download instead of just reading dark?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Viewer themes and browser extensions only change how a PDF looks
            while it&apos;s open in that one app — the file itself stays
            white. Converting produces a{" "}
            <strong className="text-neutral-100">
              permanent dark-mode PDF
            </strong>
            : send it to your phone or e-reader, share it with a classmate,
            print it, or archive it, and the dark theme travels with the file.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            If you only need to get through a document tonight, skip the
            download — the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode reader
            </Link>{" "}
            opens your PDF on a dark background instantly, with the same
            themes and privacy model.
          </p>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold mb-10 text-center">
            Frequently Asked Questions
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
                <p className="px-4 pb-4 -mt-1 text-sm text-neutral-400">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
