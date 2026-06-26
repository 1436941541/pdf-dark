import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/darken-scanned-pdf-online";
const TITLE = "Darken a Scanned PDF Online — Free, In-Browser";
const DESCRIPTION =
  "Got a scanned PDF that's painfully bright at night? Darken every page online in seconds. Free, no upload, no install — works on phones and laptops.";

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
    q: "Will this make the original text darker, or invert the whole page?",
    a: "PDF Dark inverts. The bright background of your scan becomes a dark color (your theme), and the dark text becomes near-white. The result reads like a true dark-mode page — much easier on the eyes at night than the original bright scan, but it does change the visual style. If you specifically want to keep a white background and only deepen faded text, use an OCR + contrast tool instead.",
  },
  {
    q: "Which theme works best for scanned pages?",
    a: "OLED (pure black) gives the highest contrast and is best on OLED phones for battery. Midnight (deep blue-grey) is the most comfortable for long sessions. Avoid Sepia for scans that already have yellow paper tones — the warm theme can blend into faded scans.",
  },
  {
    q: "Does the scan need to be OCR'd first?",
    a: "No. PDF Dark treats every page as an image, which is exactly what a scan is. You get the same darkening whether the PDF has hidden text or not. (You also won't gain selectable text — keep your original file for that.)",
  },
  {
    q: "Is my scanned PDF uploaded anywhere?",
    a: "No. Conversion happens entirely in your browser via the File API and a Web Worker. Open DevTools → Network and you'll see no upload during conversion. The PDF never leaves your device.",
  },
  {
    q: "My scan is 300+ pages. Will this still work?",
    a: "On a laptop, yes — we render and darken pages in chunks. On a phone, very large scans can stall when memory runs out. If that happens, split the PDF first (any free PDF splitter works) and darken the halves separately.",
  },
  {
    q: "Will old yellowed paper still look yellowed after darkening?",
    a: "No. The brightness-mapping algorithm pulls every page toward your chosen theme color, so yellowed paper, off-white scans, and pure white pages all end up the same dark background. That uniformity is one of the biggest reading wins for old book scans.",
  },
  {
    q: "Is there a file size or page limit?",
    a: "No hard limit. Everything runs locally, so the only limit is your device's memory. Hundreds of pages are fine on modern hardware.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Darken Scanned PDF Online",
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

export default function DarkenScannedPdfPage() {
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
            <a href="#scans" className="hover:text-neutral-100">
              Why scans hurt
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            Darken a Scanned PDF
            <span className="block text-amber-400 mt-2">in your browser</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Scans are usually a photo of a bright white page, which is rough on
            the eyes after sunset. PDF Dark flips that — the background becomes
            a dark color you pick, the text becomes near-white, and you get a
            new PDF you can keep.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated June 26, 2026</span>
            <span aria-hidden>·</span>
            <span>5 min read</span>
          </div>
        </section>

        {/* Why scans hurt */}
        <section
          id="scans"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why scanned PDFs are harder to read at night
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Two things make scans different from regular PDFs, and most
              reader apps can&apos;t do much about either.
            </p>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                  Scans are pure raster
                </h3>
                <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                  <li>No text layer, no fonts, no styles to restyle</li>
                  <li>
                    PDF reader &quot;dark mode&quot; toggles do nothing — they
                    only retheme text PDFs
                  </li>
                  <li>
                    You&apos;re looking at a photo of a page, and the photo is
                    white
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                  And the background varies
                </h3>
                <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                  <li>Yellowed paper, off-white book scans, gray shadows</li>
                  <li>
                    OS-level invert turns yellow into purple — even uglier than
                    the original
                  </li>
                  <li>
                    A real color flip needs to normalize the background first,
                    then apply the theme
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-xs text-neutral-500 text-center mt-8">
              PDF Dark&apos;s brightness mapping pulls every shade of
              &ldquo;light&rdquo; to your single theme color — old yellow scans
              and crisp white scans end up the same calm dark.
            </p>
          </div>
        </section>

        {/* What to expect — honest preview */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            What &ldquo;darken&rdquo; means here
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
            Worth being upfront about this before you feed in a 400-page
            scan: the tool inverts the page rather than just dimming it.
          </p>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                ✅ Great fit
              </h3>
              <p className="text-sm text-neutral-300">
                You want a true dark-mode reading experience: dark page,
                light text, comfortable at night. You&apos;re fine with the
                visual style changing — you care about eye strain, not about
                printing the file later.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                ⚠️ Probably not what you want
              </h3>
              <p className="text-sm text-neutral-400">
                You want to keep a white background and only make faded text
                blacker (a contrast-only tweak). For that, look for tools that
                advertise &ldquo;PDF contrast enhancement&rdquo; or
                &ldquo;OCR-and-rethreshold&rdquo; — they preserve the page
                style and just deepen the strokes.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Pick the right theme for scans
              </h3>
              <ul className="text-sm text-neutral-400 space-y-2 mt-3 list-disc pl-5">
                <li>
                  <strong className="text-neutral-200">OLED</strong> — deepest
                  contrast, best on OLED phones for battery
                </li>
                <li>
                  <strong className="text-neutral-200">Midnight</strong> —
                  calm blue-grey, easiest on the eyes for long reads
                </li>
                <li>
                  <strong className="text-neutral-200">Solarized</strong> —
                  cool teal; nice on retina laptops
                </li>
                <li>
                  Skip <strong className="text-neutral-200">Sepia</strong> on
                  yellow-tinted old scans — too much warm-on-warm
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-3">
            Try it on one of your scans
          </h2>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop the file on the home page and switch between OLED, Midnight,
            and the others to see what looks right on your screen. The download
            is a regular PDF you can email or sync like any other.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Open PDF Dark →
          </Link>
        </section>

        <RelatedVariants currentSlug="darken-scanned-pdf-online" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            Darken scanned PDF — FAQ
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
