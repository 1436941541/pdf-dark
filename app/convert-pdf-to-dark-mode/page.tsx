import type { Metadata } from "next";
import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/convert-pdf-to-dark-mode";
const TITLE = "Convert PDF to Dark Mode — Download as a Permanent File";
const DESCRIPTION =
  "Convert any PDF to dark mode and download a real, reusable PDF file. Unlike viewer toggles or extensions, the result is permanent — email it, sync it, open it anywhere.";

export const metadata: Metadata = {
  title: `${TITLE} | PDF Dark`,
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
    q: "What's the difference between 'viewing' a PDF in dark mode and 'converting' it?",
    a: "Viewing applies a theme only while the file is open in one specific app — close it or share it, and the dark mode is gone. Converting produces a new PDF with the dark theme baked into the file itself, so it stays dark in every reader, on every device, forever.",
  },
  {
    q: "What file format do I get back?",
    a: "A standard PDF — same format as your input, just with dark-themed pages. Works in Preview, Acrobat, Firefox, iPad, Kindle, anything that reads PDFs.",
  },
  {
    q: "Can I share the converted file with someone else?",
    a: "Yes. Email it, AirDrop it, upload it to Google Drive or Dropbox — the recipient sees the dark version automatically. No setup on their end.",
  },
  {
    q: "Does converting change the file size a lot?",
    a: "It re-encodes each page as a compressed JPEG, so the output is usually similar or slightly smaller for text-heavy PDFs. Image-heavy PDFs may grow a little because JPEGs compress less aggressively than the original source images.",
  },
  {
    q: "Can I still copy text from the converted PDF?",
    a: "The converted PDF is image-based (one JPEG per page), so text is not selectable. If you need selectable text, keep the original file and use this dark version only for reading. You can always run OCR later if needed.",
  },
  {
    q: "Is my PDF uploaded during conversion?",
    a: "No. The entire conversion happens in your browser via the File API and a Web Worker — the file never leaves your device. Check DevTools → Network to verify no upload request is made.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Convert PDF to Dark Mode",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser)",
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

export default function ConvertVariantPage() {
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
              Viewer vs converter
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Convert PDF to Dark Mode
            <span className="block text-amber-400 mt-2">
              Download a Real File
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Not a viewer toggle. Not an extension trick.{" "}
            <strong className="text-neutral-100">
              Drop a PDF, pick a theme, download a new PDF
            </strong>{" "}
            — dark in every reader, forever.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% Browser-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 4 dark themes
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Reusable PDF file
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Mobile
            </span>
          </div>

          <div className="mt-14">
            <Converter />
          </div>
        </section>

        {/* Viewer vs converter */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why &ldquo;convert&rdquo; beats &ldquo;view in dark mode&rdquo;
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Most dark-mode solutions are session tricks. A conversion gives
              you an artifact you can keep.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div className="text-sm font-semibold text-neutral-400 mb-3">
                  Viewer / extension / OS toggle
                </div>
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
                <div className="text-sm font-semibold text-amber-400 mb-3">
                  A converted PDF file
                </div>
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
                    Images stay in original color thanks to saturation-based
                    detection
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
          </div>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            When a converted dark PDF matters
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                Sending a paper to a collaborator at 11 PM
              </div>
              <p className="text-sm text-neutral-400">
                Your colleague is reading in bed. You can forward the original
                and ask them to enable Smart Invert — or you can send the dark
                version and save them the friction.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                Archiving documents you&apos;ll reread often
              </div>
              <p className="text-sm text-neutral-400">
                Research papers, meeting notes, eBooks — once converted, the
                dark copy lives in your library permanently. No per-device
                configuration to redo when you move to a new phone or laptop.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                E-readers and e-ink devices
              </div>
              <p className="text-sm text-neutral-400">
                Kindle, Kobo, Boox — most e-readers have no in-app dark toggle
                for sideloaded PDFs. A pre-converted dark PDF is the only way
                to get light-on-dark reading on those devices.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <div className="font-semibold text-neutral-50 mb-1">
                Sharing accessible reading material
              </div>
              <p className="text-sm text-neutral-400">
                Readers with photosensitivity, migraine issues, or low vision
                often prefer persistent high-contrast. Sharing a dark copy
                directly is kinder than asking them to tweak their OS.
              </p>
            </div>
          </div>
        </section>

        <RelatedVariants currentSlug="convert-pdf-to-dark-mode" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Convert PDF to dark mode FAQ
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
