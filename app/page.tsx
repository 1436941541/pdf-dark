import Link from "next/link";
import { Converter } from "@/components/converter";
import { Footer } from "@/components/footer";
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

type FaqItem = {
  q: string;
  a: string;
  link?: { href: string; text: string };
};

const FAQ_ITEMS: FaqItem[] = [
  {
    q: "Is my PDF uploaded to your server?",
    a: "No. PDF Dark runs 100% in your browser. We literally don't have a server that receives your file.",
  },
  {
    q: "How can I print a PDF in dark mode?",
    a: "Click download after conversion, then print the downloaded dark PDF from any reader. Because the dark theme is baked into the file itself, the print output is dark too — not just the on-screen view.",
    link: { href: "/convert-pdf-to-dark-mode", text: "Convert PDF to Dark Mode" },
  },
  {
    q: "Does this work on iPhone or iPad?",
    a: "Yes. Safari on iOS can drop/upload PDFs directly to this page—no app install needed.",
  },
  {
    q: "How is this different from a browser dark-mode extension?",
    a: "Most dark-mode extensions invert everything including images. PDF Dark detects image regions and keeps them in their original colors, so photos and charts look right.",
    link: { href: "/pdf-dark-mode-chrome", text: "PDF Dark Mode in Chrome" },
  },
  {
    q: "Does it work for scanned PDFs?",
    a: "Yes. We render each page as an image and apply theme inversion. Handwriting and scanned text become light-on-dark automatically. Because images get color-aware inversion, scanned signatures stay legible instead of turning into negatives.",
    link: { href: "/invert-pdf-colors", text: "Invert PDF Colors" },
  },
  {
    q: "How do I read a PDF at night without eye strain?",
    a: "Convert the PDF to dark mode here and pick OLED or Midnight—both turn the white background into pure or near-pure black so your eyes don't have to fight a bright page in a dim room. The text inverts to light, images stay normal.",
  },
  {
    q: "Can I change a PDF background to black?",
    a: "Yes. The OLED theme renders the background as pure black (#000) and text as light gray, which is the most aggressive dark mode for PDFs. Saving downloads the PDF with that black background baked in.",
  },
  {
    q: "Is this a dark mode for Adobe Acrobat?",
    a: "Not exactly. Acrobat has its own in-app dark mode, but it only affects how you see the PDF inside Acrobat—the file itself stays light. PDF Dark produces a real dark-mode PDF file you can open in any reader (Acrobat, Preview, browser) and it stays dark.",
    link: { href: "/convert-pdf-to-dark-mode", text: "Convert PDF to Dark Mode" },
  },
  {
    q: "Does PDF dark mode work in Firefox?",
    a: "Yes. Firefox's built-in PDF.js viewer only darkens the toolbar, not the page content. PDF Dark converts the actual page content so the file looks dark in every viewer, including Firefox.",
    link: { href: "/pdf-dark-mode-firefox", text: "PDF Dark Mode in Firefox" },
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
      "Free, browser-side PDF dark mode and night mode converter. A dark PDF reader that keeps images in their original color, runs 100% locally, and downloads as a new PDF—built for reading PDFs at night.",
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
            <a href="#tools" className="hover:text-neutral-100">Guides</a>
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
            Convert any PDF to dark mode or night mode in your browser. A free,
            online dark PDF reader that keeps images in their original colors—no
            upload, no signup, no install. Download the themed PDF and read at
            night without eye strain.
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

        {/* What & why — semantic primer for keyword variants */}
        <section
          id="what"
          className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-5 text-center">
            What is PDF dark mode?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            PDF dark mode is a way to read PDFs with a dark background and
            light text instead of the default white page. You may also see it
            called PDF night mode, a dark PDF reader, or an inverted PDF —
            different names for the same thing: a low-light theme baked into
            the file so it stays dark in every viewer, not just the one you
            opened it in.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            People use a dark mode PDF to read at night without eye strain, to
            extend battery life on OLED phones, to study late-night research
            papers, and to make code- or text-heavy documents less harsh
            under bright office lights. Browser extensions can fake a dark
            theme inside the viewer, but the underlying PDF file stays light.
            PDF Dark produces an actual dark-themed PDF you can save, share,
            and reopen anywhere — a real dark PDF, not a viewer trick.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            A good dark mode reader for PDFs does more than paint the screen
            dark — it rewrites the file with inverted colors so the PDF stays
            in dark mode wherever you open it. With PDF Dark you can read PDFs
            in dark mode on Chrome, Firefox, Safari, or Edge, and then carry
            that dark mode PDF to your phone or e-reader. Files never leave
            your device: the entire conversion runs in your browser via a Web
            Worker, so you can read PDFs at night without ever uploading the
            document. That&apos;s how to read PDFs in dark mode without
            handing your file to anyone.
          </p>
        </section>

        {/* How it works */}
        <section
          id="how"
          className="max-w-4xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-3 text-center">
            How to convert a PDF to dark mode
          </h2>
          <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
            PDF dark mode means re-rendering each page so text and background
            are inverted into a low-light theme, while photos and charts keep
            their original colors. Three steps:
          </p>
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
                <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
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
              PDF dark mode: PDF Dark vs Chrome extensions vs online tools
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              There are a few ways to read PDFs in dark mode or night mode
              today—browser extensions, other online converters, native readers.
              Here&apos;s how each compares for everyday use.
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
              PDF dark mode guides
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Deeper write-ups for specific scenarios — inverting PDF colors,
              browser quirks, and producing a permanent dark-themed file.
              Each guide has the converter inline, so you can read or just
              drop a PDF in and go.
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
          <h2 className="text-2xl font-bold mb-10 text-center">
            PDF dark mode FAQ
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f) => (
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
                  {f.link && (
                    <>
                      {" "}
                      <Link
                        href={f.link.href}
                        className="text-amber-400 hover:underline"
                      >
                        {f.link.text}
                      </Link>
                      .
                    </>
                  )}
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
