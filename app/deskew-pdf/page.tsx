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
  ["What does deskew PDF mean?", "Deskewing corrects a small tilt in a scanned page so its text lines appear horizontal. It is different from turning a sideways page by 90 degrees. This tool corrects small angles, with manual adjustments from −10° to +10°."],
  ["How do I straighten a scanned PDF?", "Choose your PDF. The tool checks each page for tilted text. Compare the original and corrected previews, adjust individual pages if needed, and download a new PDF."],
  ["Can every scan be corrected automatically?", "No. Automatic detection works best with several clear lines of text. Photos, sparse text, unusual layouts and badly damaged scans can be uncertain. Those pages stay unchanged until you adjust the angle manually. Always check the preview."],
  ["Are my files uploaded?", "No. PDF reading, angle detection and conversion happen in your browser. Your document is not sent to a conversion server."],
  ["Will rotation cut off my text?", "The corrected page expands to fit the rotated content and fills the added margins with white. This avoids cutting off the original page, but changes the output page dimensions."],
  ["Does deskewing preserve selectable text and forms?", "This version exports page images, at up to 144 DPI depending on page size. It does not add OCR or preserve selectable text, interactive links, forms, bookmarks or digital signatures. Fine details can soften and the file can become larger. Keep the original PDF."],
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
      <DeskewGuide />
      <section id="faq" className="mx-auto max-w-3xl px-6 pb-16"><h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2><div className="space-y-3">{FAQ.map(([q, a]) => <details key={q} className="rounded-lg border border-neutral-800 bg-neutral-900/30"><summary className="cursor-pointer p-4 font-medium">{q}</summary><p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{a}</p></details>)}</div><p className="mt-8 text-center text-sm text-neutral-500">Need cleaner printing after straightening? <Link href="/pdf-to-black-and-white" className="text-amber-400 hover:underline">Convert your PDF to black and white</Link>. For comfortable reading, <Link href="/" className="text-amber-400 hover:underline">try PDF dark mode</Link>.</p></section>
    </main><Footer />
  </div>;
}
