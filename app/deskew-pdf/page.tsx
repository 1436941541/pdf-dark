import type { Metadata } from "next";
import Link from "next/link";
import { DeskewGuide } from "@/components/deskew-guide";
import { DeskewWorkspace } from "@/components/deskew-workspace";
import { Footer } from "@/components/footer";
import { ToolNavigation } from "@/components/tool-navigation";
import { getSiteUrl } from "@/lib/site";

const TITLE = "Deskew PDF — Straighten Scanned PDF Pages Online Free";
const DESCRIPTION = "Deskew PDF pages online without uploading your file. Straighten tilted scans, fine-tune each page and preview the result before downloading. Free, no signup.";
export const metadata: Metadata = {
  title: TITLE, description: DESCRIPTION, alternates: { canonical: "/deskew-pdf" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/deskew-pdf", type: "website", images: [{ url: "/examples/deskew/social.png", width: 1200, height: 630, alt: "Tilted invoice scan before and after PDF deskew" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/examples/deskew/social.png"] },
};
const FAQ = [
  [
    "How can I straighten a crooked scanned PDF online for free?",
    "Use PDF Dark’s Deskew PDF tool to open your scan, review the suggested correction for each page, and download a straightened copy. It is free and does not require an account or a software installation. Try the sample invoice to see how the original and corrected previews compare before choosing your own file.",
  ],
  [
    "Can I straighten a PDF without uploading it to a website?",
    "Yes. Deskew PDF reads, analyses and converts your selected file in your browser; the document is not sent to a conversion server. Choose a PDF from your device, check the previews, and save the corrected copy locally.",
  ],
  [
    "Is there a PDF straightener that lets me set the angle manually?",
    "This tool has a separate correction slider for every page. You can adjust the angle from −10° to +10° in 0.1° steps. Negative values rotate the page counterclockwise; positive values rotate it clockwise. Use the preview to judge the text lines, or restore the suggested angle with “Use automatic result”.",
  ],
  [
    "Can I fix a PDF with pages tilted in different directions?",
    "Yes. Each page is analysed separately and keeps its own correction angle. Use “Previous” and “Next” to review the document, then adjust individual pages if necessary. A page leaning clockwise can receive a different correction from one leaning counterclockwise, while an already straight page can keep a 0° correction.",
  ],
  [
    "Can I straighten a scanned PDF on my phone without installing an app?",
    "Use a modern mobile browser and choose a PDF saved on your device. The browser-based workspace provides the same per-page angle controls and previews without a separate app. Processing depends on your browser and available memory; a large or detailed document may be easier to handle on a computer.",
  ],
  [
    "Why does automatic deskew leave a crooked page unchanged?",
    "The detector needs clear, consistent text lines. Photos, sparse text, mixed directions or a tilt near its detection limit can make the result uncertain, so no automatic rotation is applied. Check the preview and adjust the angle manually. A 0° correction can also mean the page already looks straight. The download still converts that page to an image.",
  ],
  [
    "Can I straighten a scan without cropping off the corners?",
    "The output page expands to fit the rotated scan, and the added margins are filled with white. This preserves the full visible page instead of cutting its corners to fit the old page dimensions. The downloaded pages can therefore be larger. Check the paper size and scaling options before printing.",
  ],
  [
    "Will the downloaded PDF still have searchable text and working links?",
    "No. This version exports an image of every page. It does not retain selectable or searchable text, interactive links, forms, bookmarks or digital signatures. Keep the original if those features matter. A separate OCR step can create a text layer from the resulting images, but it will not restore the original forms or links.",
  ],
  [
    "Can I correct only the crooked pages in a PDF?",
    "Deskew PDF lets you set each page’s angle independently. Choose “Leave page unchanged” to set a straight page to 0°. The download still includes all pages, and every page is rendered as an image, including those at 0°. It does not export a selected page range or copy unaffected pages with their original text and interactive features intact.",
  ],
  [
    "Can I deskew a PDF without reducing its quality?",
    "This export is not lossless. Pages are rendered as images at up to 144 DPI, with a lower resolution for very large pages. Small text and fine lines can soften, and the file can become larger. Inspect the downloaded copy at the zoom or print size you will use, and keep the original for editing or archival purposes.",
  ],
  [
    "Can this fix curved book scans or perspective distortion?",
    "No. Curved text needs page dewarping, while a document photographed at an angle may need perspective correction. This tool applies one small rotation to each page. It can correct a consistent tilt, but it cannot flatten a curved book page, straighten several conflicting text angles at once, or reconstruct missing parts of a scan.",
  ],
  [
    "Which tool should I use for a PDF page that is sideways or upside down?",
    "Use a page rotation tool with 90° or 180° controls. Deskew PDF is designed for smaller corrections, with manual angles from −10° to +10°; it does not include those orientation controls. If a page is sideways and also slightly tilted, correct its orientation first, then check whether a small angle adjustment is still needed.",
  ],
];
export default function DeskewPage() {
  const schema = { "@context": "https://schema.org", "@type": "WebApplication", name: "Deskew PDF", url: `${getSiteUrl()}/deskew-pdf`, description: DESCRIPTION, applicationCategory: "UtilityApplication", operatingSystem: "Any modern browser", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } };
  return <div className="flex min-h-screen flex-col items-center">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <header className="w-full border-b border-neutral-800"><div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4"><Link href="/" className="flex items-center gap-2"><span className="text-2xl">🌙</span><span className="text-lg font-semibold whitespace-nowrap">PDF Dark</span></Link><ToolNavigation active="deskew" /></div></header>
    <main className="w-full flex-1">
      <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-amber-400">Straighten scans, one page at a time</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Deskew PDF</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">Turn tilted scans into straight pages. Detect the angle automatically, fine-tune the result and download a corrected PDF.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">{["No upload", "Automatic + manual correction", "Free · No signup"].map(text => <span key={text} className="rounded-full border border-neutral-800 px-3 py-1">{text}</span>)}</div>
      </section>
      <DeskewWorkspace />
      <section className="mx-auto max-w-4xl px-6 py-14"><h2 className="text-center text-2xl font-bold">Straighten a PDF in three steps</h2><ol className="mt-8 grid gap-6 sm:grid-cols-3">{[["Choose your scan", "Open a PDF from your device. Automatic detection checks each page for tilted text."], ["Check the angle", "Compare both previews. Fine-tune pages manually when automatic detection is uncertain."], ["Save a straight copy", "Download the corrected pages with white margins. Keep your original file for editing and archival use."]].map(([title, text], i) => <li key={title} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"><span className="text-sm text-amber-400">0{i + 1}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">{text}</p></li>)}</ol></section>
      <nav aria-label="On this page" className="mx-auto flex max-w-4xl flex-wrap justify-center gap-x-5 gap-y-3 px-6 pb-10 text-sm text-neutral-400">
        {[
          ["when-to-deskew", "When to use it"],
          ["deskew-workflow", "Page-by-page workflow"],
          ["adjust-skew-angle", "Adjust the angle"],
          ["deskew-output", "Output changes"],
          ["deskew-vs-rotation-ocr", "Rotation and OCR"],
          ["check-deskew-result", "Review checklist"],
          ["deskew-troubleshooting", "Troubleshooting"],
          ["faq", "FAQ"],
        ].map(([id, text]) => <a key={id} href={`#${id}`} className="underline decoration-neutral-700 underline-offset-4 hover:text-amber-400">{text}</a>)}
      </nav>
      <DeskewGuide />
      <section id="faq" className="mx-auto max-w-3xl px-6 pb-16"><h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2><div className="space-y-3">{FAQ.map(([q, a]) => <details key={q} className="rounded-lg border border-neutral-800 bg-neutral-900/30"><summary className="cursor-pointer p-4 font-medium">{q}</summary><p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{a}</p></details>)}</div><p className="mt-8 text-center text-sm text-neutral-500">Need cleaner printing after straightening? <Link href="/pdf-to-black-and-white" className="text-amber-400 hover:underline">Convert your PDF to black and white</Link>. For comfortable reading, <Link href="/" className="text-amber-400 hover:underline">try PDF dark mode</Link>.</p></section>
    </main><Footer />
  </div>;
}
