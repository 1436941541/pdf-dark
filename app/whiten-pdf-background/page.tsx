import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BackgroundWorkspace } from "@/components/background-workspace";
import { Footer } from "@/components/footer";
import { IconLock } from "@/components/icons";
import { ToolNavigation } from "@/components/tool-navigation";
import { getSiteUrl } from "@/lib/site";

const TITLE = "Whiten PDF Background Online (Gray & Yellow Scans)";
const DESCRIPTION =
  "Whiten PDF background shading on gray or yellow scans for printing. Preview 0-100% strength in your browser, protect colored stamps, and upload nothing.";
const SLUG = "/whiten-pdf-background";
const SOCIAL = {
  url: "/examples/background-remover/whiten-social.png",
  width: 1200,
  height: 630,
  alt: "Gray scan paper before and after PDF background whitening",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SLUG },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SLUG, type: "website", images: [SOCIAL] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SOCIAL] },
};

const inlineLink = "text-amber-400 underline decoration-amber-400/30 underline-offset-4 hover:decoration-amber-400";

const STEPS = [
  ["Open a scanned PDF", "Drop a scan into the workspace or load a test sample above."],
  [
    "Tune strength & stamp protection",
    "Adjust the 0–100% slider (65% default), keep color protection on for stamps, or skip photo pages (e.g. 1, 8-10).",
  ],
  [
    "Download at 144 or 72 DPI",
    "Select Sharper or Compact output and save your -whitened.pdf file.",
  ],
] as const;

const SPEC_ROWS: { item: string; behavior: ReactNode; note: ReactNode }[] = [
  {
    item: "Cleaning strength (0–100% in 5% steps, default 65%)",
    behavior:
      "Maps local paper brightness across a smoothed grid and pulls gray or yellow backgrounds toward white; dark-themed pages (paper brightness below 90/255) are skipped automatically.",
    note: "Raise toward 85–100% for heavy photocopy haze; lower below 50% if faint pencil notes or thin serif strokes start fading.",
  },
  {
    item: "Protect colored text & marks (on by default)",
    behavior:
      "Compares each pixel against the surrounding paper tone and leaves ink, blue or red stamps, and highlighter bands untouched whenever color saturation exceeds 18% above the paper tint.",
    note: "Uncheck if colored watermarks, tea stains, or tinted slips scanned inside a bright white border stay uncleaned.",
  },
  {
    item: "Skip pages & Clean page N",
    behavior:
      "Skips background whitening on listed page ranges (such as 1, 5, 80-89) and syncs with each page's Clean page checkbox so covers or photo sheets keep their original tones.",
    note: "Type page ranges directly or enter any page number to jump straight to that sheet in long scans.",
  },
  {
    item: "Download quality (Sharper 144 DPI / Compact 72 DPI)",
    behavior:
      "Builds a new -whitened.pdf at 2x scale (up to 144 DPI) or 1x scale (72 DPI), capped at 8,192 px on the longest edge and ~16 MP per page.",
    note: "Pick Sharper for small contract footnotes and Compact when emailing multi-page scans.",
  },
  {
    item: "Dark lecture slides or strict two-color printing",
    behavior: "Paper whitening preserves smooth gray anti-aliasing on text and skips dark-background slides (below 90/255) instead of inverting them.",
    note: (
      <>
        Switch to{" "}
        <Link href="/invert-pdf-colors" className={inlineLink}>
          Invert PDF Colors
        </Link>{" "}
        and pick Dark → Light (Print) to turn black coaching or lecture slides into a white -light.pdf, or use{" "}
        <Link href="/pdf-to-black-and-white" className={inlineLink}>
          Convert PDF to Black and White
        </Link>{" "}
        (1–254 cutoff) for strict two-color output.
      </>
    ),
  },
];

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Are confidential contracts or ID scans uploaded to a server during cleanup?",
    a: "Never. Page rendering and PDF assembly happen inside your browser tab while pixel whitening runs in a local Web Worker, so contracts, tax forms, and ID scans stay on your device with no signup or 4 MB file-size cap.",
  },
  {
    q: "Does this make a PDF background transparent or act as a whitener to cover words?",
    a: "Neither. Exported pages always have a solid opaque white background rather than an alpha-transparent cutout, and there is no white-out (whitener) brush or redaction box for masking individual words or numbers.",
  },
  {
    q: "Will the -whitened.pdf keep selectable text, links, or vector pages?",
    a: "No. Every page in the download, including pages where Clean page is unchecked, is rebuilt as a flat PNG image without built-in OCR. Selectable text layers, clickable links, form fields, and digital signatures are not carried over, and born-digital PDFs can grow in file size.",
  },
];

export default function WhitenPdfBackgroundPage() {
  const siteUrl = getSiteUrl();
  const url = `${siteUrl}${SLUG}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Whiten PDF Background",
    url,
    description: DESCRIPTION,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any modern browser",
    screenshot: `${siteUrl}${SOCIAL.url}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <div className="flex min-h-screen flex-col items-center">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
      />
      <header className="w-full border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="text-2xl">🌙</span>
            <span className="whitespace-nowrap text-lg font-semibold">PDF Dark</span>
          </Link>
          <ToolNavigation active="background" />
        </div>
      </header>
      <main className="w-full flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Whiten PDF Background
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            Whiten PDF background shading on gray photocopies, yellowed book pages, and shadowy scans for cleaner printing. Preview 0% to 100% cleaning strength side by side while keeping blue stamps and colored highlights intact.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              144 or 72 DPI output
            </span>
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              Per-page photo skip
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconLock className="text-neutral-500" /> Processed in your browser (no upload)
            </span>
          </div>
        </section>
        <BackgroundWorkspace />
        <section id="how-to" className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How to whiten PDF background</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-3">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-5">
                <span className="font-mono text-sm text-amber-400">0{i + 1}</span>
                <h3 className="mt-2 font-semibold text-neutral-100">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">{text}</p>
              </li>
            ))}
          </ol>
        </section>
        <section id="controls" className="mx-auto max-w-5xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Controls and output specs</h2>
          <div
            role="region"
            aria-label="PDF background whitening controls and output table"
            tabIndex={0}
            className="mt-8 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            <table className="w-full min-w-[640px] text-left text-sm leading-6">
              <thead className="bg-neutral-900 text-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Setting or case</th>
                  <th scope="col" className="px-4 py-3 font-medium">How this tool handles it</th>
                  <th scope="col" className="px-4 py-3 font-medium">When to adjust or switch tools</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                {SPEC_ROWS.map(({ item, behavior, note }) => (
                  <tr key={item}>
                    <th scope="row" className="px-4 py-3.5 align-top font-medium text-neutral-200">{item}</th>
                    <td className="px-4 py-3.5 align-top">{behavior}</td>
                    <td className="px-4 py-3.5 align-top">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id="faq" className="mx-auto max-w-3xl border-t border-neutral-900 px-6 py-12 pb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60">
                <summary className="cursor-pointer p-4 font-medium text-neutral-100">{q}</summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            If your scan pages are also crooked, straighten tilted text lines in{" "}
            <Link href="/deskew-pdf" className="text-amber-400 hover:underline">
              Deskew PDF
            </Link>{" "}
            before or after whitening. For night screen reading without changing the file, open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
