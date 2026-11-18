import type { Metadata } from "next";
import Link from "next/link";
import { DeskewWorkspace } from "@/components/deskew-workspace";
import { Footer } from "@/components/footer";
import { IconLock } from "@/components/icons";
import { ToolNavigation } from "@/components/tool-navigation";
import { getSiteUrl } from "@/lib/site";

const TITLE = "Deskew PDF Online Free (Auto & 0.1° Manual Preview)";
const DESCRIPTION =
  "Deskew PDF scans to straighten crooked pages in your browser with no upload or task cap. Auto-detect tilt or dial in ±10° in 0.1° steps with live preview.";
const SLUG = "/deskew-pdf";
const SOCIAL = {
  url: "/examples/deskew/social.png",
  width: 1200,
  height: 630,
  alt: "Tilted invoice scan before and after PDF deskew",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SLUG },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SLUG,
    type: "website",
    images: [SOCIAL],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SOCIAL] },
};

const STEPS = [
  ["Open your scanned PDF", "Choose a PDF or load a test sample above to run automatic tilt detection on each page."],
  ["Check or dial in ±10.0°", "Compare Original vs Straightened and drag the 0.1° slider on sparse or steep pages left at 0.0°."],
  ["Save your -deskewed.pdf", "Download all pages at up to 144 DPI with white corner margins intact."],
] as const;

const SPEC_ROWS = [
  {
    item: "Automatic text-line detector",
    behavior:
      "Scales each page down to at most 700 px, then uses a local Web Worker to filter out photos, table borders, and scanner speckles and search ±7° (0.25° coarse, 0.05° fine steps) before rounding to 0.1°.",
    boundary: "Applies automatic corrections from ±0.2° to ±6.8° when clear horizontal print is found.",
  },
  {
    item: "Per-page manual slider",
    behavior:
      "Saves an independent −10.0° to +10.0° angle in 0.1° steps for every page with a live side-by-side preview and buttons to restore the automatic angle or reset to 0.0°.",
    boundary: "Negative angles rotate counterclockwise; positive angles rotate clockwise.",
  },
  {
    item: "Corner-safe white margin expansion",
    behavior:
      "Expands each rotated page's width and height to fit the tilted corners and fills the outer triangular wedges with white instead of cropping back to the old frame.",
    boundary: "Rotated sheets become slightly wider and taller than the original page; check print scaling if exact paper size matters.",
  },
  {
    item: "Image-based PDF export (up to 144 DPI)",
    behavior: "Renders rotated pages in your browser tab at up to 2x scale (144 DPI) and assembles a new -deskewed.pdf file.",
    boundary: "Capped at 8,192 px on the longest edge and 16 MP per page to stay within browser canvas memory limits.",
  },
];

const FAQ = [
  [
    "Why did automatic deskew leave a crooked page at 0.0° in my multi-page scan?",
    "Each sheet from a document feeder is scored independently so clockwise and counterclockwise pages get their own angles, while ambiguous pages stay at 0.0° instead of risking a wrong turn. Automatic detection holds at 0.0° whenever a page has fewer than 3 clear text lines, heavy photos or dark shading (over 35% dark pixels), competing text angles, or a tilt of 6.85° or steeper; drag that page's slider to align it visually.",
  ],
  [
    "Will the downloaded PDF keep searchable text, links, or original vector pages?",
    "No. Every page in the -deskewed.pdf download, including straight pages left at 0.0°, is rebuilt as a flat PNG image without built-in OCR. Selectable text layers, clickable links, bookmarks, and form fields are not preserved.",
  ],
  [
    "Can this flatten curved book-spine scans or flip pages scanned sideways at 90°?",
    "No. Deskew PDF applies one flat 2D rotation within ±10.0° per page. Sideways or upside-down scans lack horizontal rows of print and need a 90° or 180° page rotator first, while warped text along a thick book binding requires dedicated page-dewarping software.",
  ],
];

export default function DeskewPage() {
  const siteUrl = getSiteUrl();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Deskew PDF",
    url: `${siteUrl}${SLUG}`,
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
          <ToolNavigation active="deskew" />
        </div>
      </header>
      <main className="w-full flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">Deskew PDF</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">
            Deskew PDF documents to straighten crooked scanned pages one by one. Auto-detect tilted text lines or adjust any sheet from −10.0° to +10.0° in 0.1° steps with a live Original vs Straightened preview.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="rounded-full border border-neutral-800 px-3 py-1">
              Corner-safe white margins
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1">
              <IconLock className="text-neutral-500" /> Processed in your browser (no upload)
            </span>
            <span className="rounded-full border border-neutral-800 px-3 py-1">Free, no 3-task hourly cap</span>
          </div>
        </section>
        <DeskewWorkspace />
        <section id="how-to" className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">How to deskew PDF pages</h2>
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
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Automatic detection and manual controls</h2>
          <div
            role="region"
            aria-label="PDF deskew capabilities and limits table"
            tabIndex={0}
            className="mt-8 overflow-x-auto rounded-xl border border-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
          >
            <table className="w-full min-w-[640px] text-left text-sm leading-6">
              <thead className="bg-neutral-900 text-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">Capability</th>
                  <th scope="col" className="px-4 py-3 font-medium">How this tool works</th>
                  <th scope="col" className="px-4 py-3 font-medium">Practical note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-neutral-400">
                {SPEC_ROWS.map(({ item, behavior, boundary }) => (
                  <tr key={item}>
                    <th scope="row" className="px-4 py-3.5 align-top font-medium text-neutral-200">{item}</th>
                    <td className="px-4 py-3.5 align-top">{behavior}</td>
                    <td className="px-4 py-3.5 align-top">{boundary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section id="faq" className="mx-auto max-w-3xl border-t border-neutral-900 px-6 py-12 pb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQ.map(([q, a]) => (
              <details key={q} className="rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60">
                <summary className="cursor-pointer p-4 font-medium text-neutral-100">{q}</summary>
                <p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{a}</p>
              </details>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-neutral-500">
            After straightening a scan, you can lift gray or yellow paper shading in{" "}
            <Link href="/whiten-pdf-background" className="text-amber-400 hover:underline">
              Whiten PDF Background
            </Link>
            . If you are printing text scans and want crisp two-color contrast, use{" "}
            <Link href="/pdf-to-black-and-white" className="text-amber-400 hover:underline">
              Convert PDF to Black and White
            </Link>
            .
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
