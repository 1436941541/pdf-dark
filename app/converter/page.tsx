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
  {
    q: "Can I share the converted file with someone else?",
    a: "Yes. Email it, AirDrop it, upload it to Google Drive or Dropbox — the recipient sees the dark version automatically. No setup on their end.",
  },
  {
    q: "Does converting change the file size a lot?",
    a: "Usually not. On most digital PDFs the conversion rewrites colors inside the original file, so the size stays close to the source. Pages that fall back to image rendering are re-encoded as compressed JPEGs and may grow a little.",
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
            <Link href="/#tools" className="hover:text-neutral-100">
              Blog
            </Link>
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

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Viewer / extension / OS toggle
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Dark only while that app/extension is running</li>
                <li>Reopen in another reader → white again</li>
                <li>Can&apos;t share the dark version with anyone</li>
                <li>
                  OS-level invert often discolors photos, screenshots, and
                  charts
                </li>
                <li>Breaks when you update or switch device</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                A converted PDF file
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Permanent</strong> —
                  dark is baked into the file
                </li>
                <li>
                  Opens dark in <strong className="text-neutral-100">every</strong> PDF
                  reader, on every device
                </li>
                <li>
                  Shareable — email, AirDrop, Drive, anything; recipient
                  sees the dark version with zero setup
                </li>
                <li>
                  Hue-preserving color mapping — a dark-blue heading becomes
                  light-blue, not gray; photos keep their original colors
                </li>
                <li>
                  Works offline after download — no internet needed to read
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            Think of it this way: an inverter is lipstick on the PDF.
            Conversion is a new PDF.
          </p>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            When a converted dark PDF matters
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Sending a paper to a collaborator at 11 PM
              </h3>
              <p className="text-sm text-neutral-400">
                Your colleague is reading in bed. You can forward the original
                and ask them to enable Smart Invert — or you can send the dark
                version and save them the friction.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Archiving documents you&apos;ll reread often
              </h3>
              <p className="text-sm text-neutral-400">
                Research papers, meeting notes, eBooks — once converted, the
                dark copy lives in your library permanently. No per-device
                configuration to redo when you move to a new phone or laptop.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Tablets and e-readers without a dark toggle
              </h3>
              <p className="text-sm text-neutral-400">
                Many reading apps and e-reader devices have no dark mode for
                sideloaded PDFs. A pre-converted dark file is the way to get
                light-on-dark reading there — best on backlit screens; on
                e-ink, the classic white page usually still wins.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Sharing accessible reading material
              </h3>
              <p className="text-sm text-neutral-400">
                Readers with photosensitivity, migraine issues, or low vision
                often prefer persistent high-contrast. Sharing a dark copy
                directly is kinder than asking them to tweak their OS.
              </p>
            </div>
          </div>
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
