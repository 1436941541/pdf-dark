import type { Metadata } from "next";
import Link from "next/link";
import { MonochromeWorkspace } from "@/components/monochrome-workspace";
import { Footer } from "@/components/footer";
import { ToolNavigation } from "@/components/tool-navigation";
import { IconLock, IconDownload } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const TITLE = "PDF to Black and White — Free Online Grayscale Converter";
const DESCRIPTION = "Convert a color PDF to black and white or grayscale. Preview the result, adjust the black-and-white threshold, and download a new PDF. Free, no upload.";
const SLUG = "/pdf-to-black-and-white";
const SOCIAL_IMAGE = { url: `${SLUG}/opengraph-image`, width: 1200, height: 630, alt: "PDF to Black and White — original, grayscale and pure black-and-white PDF comparison" };

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SLUG },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SLUG, type: "website", images: [SOCIAL_IMAGE] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [SOCIAL_IMAGE] },
};

const FAQ = [
  { q: "How do I convert a PDF to black and white?", a: "Choose Grayscale or Pure black & white, then select your PDF. Compare the original and converted previews, adjust the threshold if needed, and click Convert & download PDF. The result is a separate file." },
  { q: "What is the difference between grayscale and pure black and white?", a: "Grayscale replaces colors with shades of gray, preserving the tones in photos and charts. Pure black and white uses only two colors. It works well for text and line drawings, but can remove detail from photographs." },
  { q: "Can I convert a scanned PDF?", a: "Yes. Scanned pages are converted along with text-based pages. For faint text, try Pure black & white and increase the threshold while checking the preview. This does not add OCR or recover missing detail." },
  { q: "Will my PDF be uploaded?", a: "No. Your file is opened, previewed and converted in your browser. There is no document upload, account or server-side conversion." },
  { q: "Will text, links and forms be preserved?", a: "This version renders the page appearance into images and adds a searchable text layer where supported. Some text, including rotated text and characters outside the supported font, may not carry over. Original vector detail, interactive links, forms, bookmarks and digital signatures are not preserved. Keep your original file." },
  { q: "Does this make the PDF smaller or save ink?", a: "Not necessarily. Output size depends on the document, and rendered pages can make a file larger. Grayscale removes color but keeps gray backgrounds. For a dark background that needs to become white before printing, use the PDF color inverter instead." },
  { q: "Is there a file size limit?", a: "There is no fixed upload limit because your file stays on your device. Large files can take longer or exceed browser memory. Try a smaller document if conversion fails." },
];

export default function BlackAndWhitePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF to Black and White Converter",
    url: `${getSiteUrl()}${SLUG}`,
    description: DESCRIPTION,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any modern browser",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  return (
    <div className="flex min-h-screen flex-col items-center">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <header className="w-full border-b border-neutral-800">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80"><span className="text-2xl">🌙</span><span className="hidden text-lg font-semibold sm:inline">PDF Dark</span></Link>
          <ToolNavigation active="monochrome" />
        </div>
      </header>
      <main className="w-full flex-1">
        <section className="mx-auto max-w-5xl px-6 pb-8 pt-10 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-amber-400">For reports, scans &amp; everyday printing</p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">Convert PDF to<br className="sm:hidden" /> Black and White</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-neutral-300">Turn a color PDF into grayscale for photos and reports, or pure black and white for text and scans. Preview it first. Download the version that works for you.</p>
          <div className="mb-8 mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1"><IconLock className="text-neutral-500" /> No upload</span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-3 py-1"><IconDownload className="text-neutral-500" /> Download a new PDF</span>
            <span className="rounded-full border border-neutral-800 px-3 py-1">Free · No signup</span>
          </div>
        </section>
        <MonochromeWorkspace />
        <section className="mx-auto max-w-4xl border-t border-neutral-900 px-6 py-12">
          <h2 className="text-center text-2xl font-bold">Grayscale or pure black and white?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"><h3 className="font-semibold text-neutral-100">Keep the shades with grayscale</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">A blue heading becomes gray. A photo keeps its highlights and shadows. Choose this for reports, presentations, illustrations and documents with color images.</p><div aria-hidden="true" className="mt-5 flex h-8 overflow-hidden rounded">{["#222", "#555", "#888", "#bbb", "#eee"].map((color) => <span key={color} className="flex-1" style={{ backgroundColor: color }} />)}</div></div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6"><h3 className="font-semibold text-neutral-100">Keep it simple with two colors</h3><p className="mt-3 text-sm leading-relaxed text-neutral-400">Every pixel becomes black or white. Raise the threshold to bring more faint strokes into black; lower it to leave more of the page white. Check fine text and photos before downloading.</p><div aria-hidden="true" className="mt-5 flex h-8 overflow-hidden rounded border border-neutral-700"><span className="flex-1 bg-black" /><span className="flex-1 bg-white" /></div></div>
          </div>
        </section>
        <section className="mx-auto max-w-4xl px-6 pb-14">
          <h2 className="text-center text-2xl font-bold">A color PDF, converted in three steps</h2>
          <ol className="mt-8 grid gap-6 text-center sm:grid-cols-3">
            {[['Choose a mode', 'Use grayscale for tonal detail, or pure black and white for a two-color result.'], ['Preview your PDF', 'Pick a file and compare both versions. Browse pages and tune the threshold.'], ['Download your copy', 'Convert all pages locally and save the new PDF. Your original stays unchanged.']].map(([title, description], index) => <li key={title}><span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/5 text-sm text-amber-400">{index + 1}</span><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-neutral-400">{description}</p></li>)}
          </ol>
        </section>
        <section id="faq" className="mx-auto max-w-3xl px-6 pb-16">
          <h2 className="mb-8 text-center text-2xl font-bold">Frequently asked questions</h2>
          <div className="space-y-3">{FAQ.map(({ q, a }) => <details key={q} className="rounded-lg border border-neutral-800 bg-neutral-900/30 open:bg-neutral-900/60"><summary className="cursor-pointer p-4 font-medium text-neutral-100">{q}</summary><p className="px-4 pb-4 text-sm leading-relaxed text-neutral-400">{a}</p></details>)}</div>
          <p className="mt-8 text-center text-sm text-neutral-500">Want a dark reading background instead? <Link href="/" className="text-amber-400 hover:underline">Read a PDF in dark mode</Link> or <Link href="/invert-pdf-colors" className="text-amber-400 hover:underline">invert PDF colors</Link>.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
