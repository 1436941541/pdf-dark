import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Downloader } from "@/components/downloader";
import { Footer } from "@/components/footer";
import { IconLock, IconPalette, IconDownload, IconSmartphone } from "@/components/icons";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/invert-pdf-colors";
const TITLE = "Invert PDF Colors — Free Online PDF Inverter, No Upload";
const DESCRIPTION =
  "Invert the colors of a PDF and download the inverted file. Photos can keep their own colors instead of turning into negatives. Free, browser-side, no upload.";

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
    q: "What exactly does inverting a PDF produce?",
    a: "A brand-new PDF file with the colors flipped inside the page content itself — background and text swapped, images handled per your Images setting. Open it in Acrobat, Preview, a browser, or an e-reader and it looks the same everywhere, because the change is in the file rather than in a viewer setting.",
  },
  {
    q: "Which setting gives a true, exact inversion?",
    a: "The OLED theme. With OLED the mapping is exactly out = 255 − in for grayscale content: pure white becomes pure black, pure black becomes pure white, and running the output back through returns the original. Midnight, Sepia and Solarized land white on a tinted background instead — easier to read for long sessions, but not a mathematically exact inversion.",
  },
  {
    q: "Can it turn a black background PDF back to white?",
    a: "Yes. Because the OLED mapping is symmetric, a dark document run through it comes out light: black backgrounds become white and light text becomes black. That is usually why people want it — a dark-themed handout is expensive to print, and inverting it first saves toner.",
  },
  {
    q: "Will photos turn into negatives?",
    a: "Only if you want them to. The default Auto mode keeps photos in their original colors, inverts white screenshots and diagrams so they blend with the page, and gently dims very bright images. Set Images to Invert for a literal flip of everything, or Original to leave every picture untouched.",
  },
  {
    q: "Can I invert the text and background but leave images alone?",
    a: "Yes — set Images to Original. Every embedded image stays pixel-identical to the source, including full-page scans, and only text and background are flipped. Round-cropped images such as resume headshots are restored through their circular frame, so no bright corners leak onto the dark page.",
  },
  {
    q: "Does the inverted PDF keep selectable text?",
    a: "Yes, wherever the source page allows it. Text-based pages are recolored as vector objects, so the output text stays selectable and searchable. Scanned pages are images to begin with, so they are inverted as images.",
  },
  {
    q: "Can I print the inverted version?",
    a: "Yes — that's one of the main reasons to invert the file instead of using a viewer theme. Print the downloaded file from any reader and the page comes out exactly as you see it.",
  },
  {
    q: "Is there a file size limit?",
    a: "No hard limit. The conversion runs entirely on your device, so the practical ceiling is your browser's memory — large documents just take longer.",
  },
  {
    q: "Is my PDF uploaded to a server?",
    a: "No. Rendering, inverting, and rebuilding the PDF all happen inside your browser tab. The downloaded file is assembled locally — there's no server that ever sees your document.",
  },
  {
    q: "Can I share the inverted file with someone else?",
    a: "Yes. Email it, AirDrop it, upload it to Google Drive or Dropbox — the recipient sees the inverted version automatically. No setup on their end.",
  },
];

/** Conversion steps — single source of truth for the visible "How it works"
 *  cards and the HowTo JSON-LD, so the two can never drift apart. */
const STEPS = [
  {
    t: "Pick your settings",
    d: "Choose how far the inversion goes — Images: Original, Auto, or full Invert — plus the background it lands on, darkness, and warmth.",
  },
  {
    t: "Drop your PDF",
    d: "Drag & drop or click to browse. Never leaves your browser.",
  },
  {
    t: "Get the inverted PDF",
    d: "Conversion starts immediately and the new file downloads itself — colors written into the document, ready to share, print, or read anywhere.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Color Inverter",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any (browser-based)",
    screenshot: `${site}/compare/pdf-dark.png`,
    description: DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to invert the colors of a PDF",
    totalTime: "PT1M",
    estimatedCost: { "@type": "MonetaryAmount", currency: "USD", value: 0 },
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.t,
      text: s.d,
    })),
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </>
  );
}

export default function InvertPdfColorsPage() {
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
            <Link href="/blog" className="hover:text-neutral-100">
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
            Invert PDF Colors
          </h1>
          <p className="mt-5 text-lg text-neutral-300 max-w-2xl mx-auto">
            Pick your settings, drop your PDF, and the inverted copy downloads
            automatically. The colors are written into the file itself, so it
            stays that way in every viewer — Acrobat, Preview, browsers,
            e-readers. Free, and your file never leaves the browser.
          </p>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs text-neutral-400">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconDownload className="text-neutral-500" /> Download Inverted PDF
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconLock className="text-neutral-500" /> 100% Browser-side
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-800">
              <IconPalette className="text-neutral-500" /> 3 Image Modes
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
            Just here to read, not to save a file?{" "}
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
              How to invert the colors of a PDF
            </h2>
            <p className="text-sm text-neutral-400 text-center mb-10 max-w-xl mx-auto">
              Text and background are always flipped. What happens to the
              pictures is your call — that&apos;s what the Images control is
              for: leave them untouched, flip them with the page, or let each
              one be judged separately. Curious how that detection decides?{" "}
              <Link
                href="/blog/how-pdf-dark-mode-conversion-works"
                className="text-amber-400 hover:underline"
              >
                Here&apos;s how the conversion works
              </Link>
              .
            </p>
            <div className="grid sm:grid-cols-3 gap-6">
              {STEPS.map((s, i) => (
                <div
                  key={s.t}
                  className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
                >
                  <div className="text-2xl font-bold text-amber-400">{i + 1}</div>
                  <h3 className="mt-2 font-semibold text-neutral-50">{s.t}</h3>
                  <div className="mt-1 text-sm text-neutral-400">{s.d}</div>
                </div>
              ))}
            </div>

            {/* What the output looks like — same real assets as the home page */}
            <div className="mt-14">
              <h3 className="text-lg font-semibold text-neutral-50 text-center m-0">
                What the Images setting changes
              </h3>
              <p className="mt-2 mb-6 text-sm text-neutral-400 text-center max-w-xl mx-auto">
                Text and background flip either way. The photograph is where
                the difference shows up — and where flipping every pixel
                blindly falls down.
              </p>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/original.png"
                      alt="PDF page before inversion: black text on a white background with a full-color sunset photo"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Source PDF
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-neutral-800">
                    <Image
                      src="/compare/naive-invert.png"
                      alt="The same page after a raw pixel inversion — the sunset photo becomes a false-color negative"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-neutral-500">
                    Every pixel flipped
                  </figcaption>
                </figure>
                <figure className="m-0">
                  <div className="rounded-lg overflow-hidden border border-amber-400/40">
                    <Image
                      src="/compare/pdf-dark.png"
                      alt="The same page inverted here — flipped background and text, photo keeps its original colors"
                      width={720}
                      height={933}
                      sizes="33vw"
                    />
                  </div>
                  <figcaption className="mt-2 text-center text-xs text-amber-400">
                    Inverted here, Images: Auto
                  </figcaption>
                </figure>
              </div>
              <p className="mt-3 text-xs text-neutral-600 text-center">
                Real output, not a mockup: left is the source page, middle a
                plain RGB inversion of every pixel, right this tool on Auto
                (Midnight theme). Choosing Images: Invert flips photos along
                with the page too — which is what a scan or a whiteboard shot
                needs.
              </p>
            </div>
          </div>
        </section>

        {/* Why invert the file instead of the viewer */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-8 text-center">
            Why invert the file instead of flipping a viewer setting?
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Viewer themes, browser extensions, and the system-wide invert switch
            only change how a PDF looks while it&apos;s open in that one app —
            the file itself is unchanged. Inverting produces a{" "}
            <strong className="text-neutral-100">new PDF</strong>: send it to
            your phone or e-reader, share it with a classmate, print it, or
            archive it, and the colors travel with the file.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            There&apos;s one more difference that matters: a system-level invert
            has no idea what it&apos;s flipping, so every photo, chart, and
            screenshot comes out as a negative. Working on the file means each
            image can be judged separately — or left alone entirely. If you
            only need to get through a document tonight, skip the download and{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              read it dark in the browser
            </Link>{" "}
            instead.
          </p>

          <div className="grid sm:grid-cols-2 gap-5 mt-10">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
              <h3 className="text-sm font-semibold text-neutral-400 mb-3 m-0">
                Viewer / extension / OS invert
              </h3>
              <ul className="space-y-2 text-sm text-neutral-400 list-disc pl-5">
                <li>Inverted only while that app/extension is running</li>
                <li>Reopen in another reader → back to the original</li>
                <li>Can&apos;t share or print the inverted version</li>
                <li>
                  Flips photos, screenshots, and charts with no way to exempt
                  them
                </li>
                <li>Breaks when you update or switch device</li>
              </ul>
            </div>

            <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
              <h3 className="text-sm font-semibold text-amber-400 mb-3 m-0">
                An inverted PDF file
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300 list-disc pl-5">
                <li>
                  <strong className="text-neutral-100">Permanent</strong> — the
                  colors are in the file
                </li>
                <li>
                  Looks the same in <strong className="text-neutral-100">every</strong> PDF
                  reader, on every device
                </li>
                <li>
                  Shareable — email, AirDrop, Drive, anything; recipient sees
                  the inverted version with zero setup
                </li>
                <li>
                  Per-image control — photos keep their colors while the page
                  around them flips
                </li>
                <li>
                  Hue-preserving color mapping — a dark-blue heading becomes
                  light-blue, not gray
                </li>
              </ul>
            </div>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-8">
            Think of it this way: an extension is lipstick on the PDF. Inverting
            is a new PDF.
          </p>
        </section>

        {/* Use cases */}
        <section className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-10 text-center">
            When inverting a PDF is the right move
          </h2>

          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Scanned documents and handwritten notes
              </h3>
              <p className="text-sm text-neutral-400">
                On a scan there is no text layer — the writing <em>is</em> the
                image. Set Images to Invert and the whole page flips, so
                handwriting becomes light on dark.{" "}
                <Link
                  href="/blog/scanned-pdf-dark-mode"
                  className="text-amber-400 hover:underline"
                >
                  More on scanned PDFs
                </Link>
                .
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                A dark PDF you need to print
              </h3>
              <p className="text-sm text-neutral-400">
                Dark-themed handouts and slide exports are brutal on a printer.
                Run one through on OLED and it comes back to black text on
                white, ready to print without redesigning anything — the
                inversion works in both directions.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Papers and slide decks full of figures
              </h3>
              <p className="text-sm text-neutral-400">
                Line charts, circuit diagrams, sheet music, technical drawings —
                black-on-white artwork inverts cleanly and stays legible. Auto
                handles the mixed case, where a paper has both diagrams and
                photographs on the same page.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30">
              <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                Reading at night without wrecking the pictures
              </h3>
              <p className="text-sm text-neutral-400">
                The usual reason to invert a PDF is a bright page in a dim room.
                The usual reason people give up on it is that the pictures come
                out as negatives — which is exactly the case Auto exists for.
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
