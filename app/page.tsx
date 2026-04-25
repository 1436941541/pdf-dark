import Link from "next/link";
import { Converter } from "@/components/converter";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";
import { VARIANTS } from "@/lib/variants";

const COMPARISON_ROWS: [string, string, string, string][] = [
  ["No install needed", "yes", "no", "yes"],
  ["Images keep original colors", "yes", "no", "no"],
  ["Save as new PDF file", "yes", "no", "no"],
  ["Works on iOS Safari", "yes", "no", "yes"],
  ["100% local (no upload)", "yes", "yes", "no"],
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Is my PDF uploaded to your server?",
    a: "No. PDF Dark runs 100% in your browser. We literally don't have a server that receives your file.",
  },
  {
    q: "How can I print a PDF in dark mode?",
    a: "Click download after conversion, then print the downloaded dark PDF from any reader.",
  },
  {
    q: "Does this work on iPhone or iPad?",
    a: "Yes. Safari on iOS can drop/upload PDFs directly to this page—no app install needed.",
  },
  {
    q: "How is this different from a browser dark-mode extension?",
    a: "Most dark-mode extensions invert everything including images. PDF Dark detects image regions and keeps them in their original colors, so photos and charts look right.",
  },
  {
    q: "Does it work for scanned PDFs?",
    a: "Yes. We render each page as an image and apply theme inversion. Handwriting and scanned text become light-on-dark automatically.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "PDF Dark",
    url: site,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    description:
      "Free, browser-side PDF dark mode converter. Keeps images in original color, runs 100% locally, downloads as a new PDF.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "100% browser-side conversion (no upload)",
      "Four themes: Midnight, Sepia, Solarized, OLED",
      "Preserves original image colors",
      "Download as new PDF",
      "Works on iOS Safari",
    ],
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

function Mark({ v }: { v: "yes" | "no" | string }) {
  if (v === "yes") return <span className="text-amber-400 font-semibold">✓</span>;
  if (v === "no") return <span className="text-neutral-600">✗</span>;
  return <span>{v}</span>;
}

export default function Home() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <StructuredData />
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold hidden sm:inline">PDF Dark</span>
          </div>
          <nav className="text-sm text-neutral-400 flex gap-5">
            <a href="#how" className="hover:text-neutral-100">How it works</a>
            <a href="#tools" className="hover:text-neutral-100">Tools</a>
            <a href="#faq" className="hover:text-neutral-100">FAQ</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Free PDF Dark Mode Converter
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Instantly convert any PDF to dark mode. 100% private—runs entirely in
            your browser. No upload, no signup. Download the dark version.
          </p>

          {/* Trust badges — outline pill + stroke icon */}
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% Browser-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 4 Themes
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Download Dark PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconSmartphone className="text-neutral-500" /> Works on Mobile
            </span>
          </div>

          {/* Converter — drop zone + full PDF viewer with themes & download */}
          <div className="mt-14">
            <Converter />
          </div>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { n: "1", t: "Drop your PDF", d: "Drag & drop or click to browse. Never leaves your browser.", offset: "sm:translate-y-0" },
              { n: "2", t: "Pick a theme", d: "Midnight, Sepia, Solarized, or OLED pure black.", offset: "sm:-translate-y-2" },
              { n: "3", t: "Download", d: "Save the dark-mode PDF to your device.", offset: "sm:translate-y-0" },
            ].map((s) => (
              <div
                key={s.n}
                className={`p-6 rounded-xl border border-neutral-800 bg-neutral-900/30 transition-transform ${s.offset}`}
              >
                <div className="text-2xl font-bold text-amber-400">{s.n}</div>
                <div className="mt-2 font-semibold text-neutral-50">{s.t}</div>
                <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Why us — separated by subtle background band */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center">
              How PDF Dark compares
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              There are a few ways to read PDFs in dark mode today. Here&apos;s
              how our approach stacks up.
            </p>

            {/* Desktop: full comparison table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-500">
                      Feature
                    </th>
                    <th className="py-3 px-4 font-medium text-amber-400">PDF Dark</th>
                    <th className="py-3 px-4 font-medium text-neutral-500">
                      Chrome Extensions
                    </th>
                    <th className="py-3 px-4 font-medium text-neutral-500">
                      Other online tools
                    </th>
                  </tr>
                </thead>
                <tbody className="text-center">
                  {COMPARISON_ROWS.map(([feat, a, b, c]) => (
                    <tr key={feat} className="border-b border-neutral-900">
                      <td className="py-3 px-4 text-left text-neutral-200">{feat}</td>
                      <td className="py-3 px-4"><Mark v={a} /></td>
                      <td className="py-3 px-4"><Mark v={b} /></td>
                      <td className="py-3 px-4"><Mark v={c} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: card stack per feature */}
            <div className="sm:hidden space-y-3">
              {COMPARISON_ROWS.map(([feat, a, b, c]) => (
                <div
                  key={feat}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/40"
                >
                  <div className="font-medium text-neutral-100 mb-3">{feat}</div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <span className="text-amber-400 text-base"><Mark v={a} /></span>
                      <span className="text-neutral-500 mt-1">PDF Dark</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base"><Mark v={b} /></span>
                      <span className="text-neutral-500 mt-1">Chrome Ext.</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-base"><Mark v={c} /></span>
                      <span className="text-neutral-500 mt-1">Other tools</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* More tools — cross-links to variant landing pages */}
        {VARIANTS.length > 0 && (
          <section
            id="tools"
            className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900"
          >
            <h2 className="text-2xl font-bold mb-3 text-center">
              More PDF tools
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Looking for something more specific? We have dedicated pages for
              common workflows.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {VARIANTS.map((v) => (
                <Link
                  key={v.slug}
                  href={`/${v.slug}`}
                  className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-amber-400/40 transition-colors"
                >
                  <div className="font-semibold text-neutral-50 group-hover:text-amber-400 transition-colors flex items-center justify-between">
                    <span>{v.title}</span>
                    <span
                      aria-hidden
                      className="text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
                    >
                      →
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-neutral-400">
                    {v.blurb}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20"
        >
          <h2 className="text-2xl font-bold mb-10 text-center">FAQ</h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f) => (
              <details
                key={f.q}
                className="group rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60 transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="cursor-pointer font-medium p-4 flex items-center justify-between list-none text-neutral-100">
                  <span>{f.q}</span>
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

      <footer className="w-full border-t border-neutral-900 mt-4">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} PDF Dark</span>
          <div className="flex gap-4">
            <a href="/about" className="hover:text-neutral-300">About</a>
            <a href="/privacy" className="hover:text-neutral-300">Privacy</a>
            <a href="/terms" className="hover:text-neutral-300">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
