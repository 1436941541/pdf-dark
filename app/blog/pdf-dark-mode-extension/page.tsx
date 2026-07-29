import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-extension";
const TITLE = "PDF Dark Mode Extensions: What's Available, and What to Check First";
const DESCRIPTION =
  "An honest map of the PDF dark mode extensions in the Chrome and Edge stores — how they darken the page, what happens to your images and local files, a 4-point checklist before installing one, and a no-install alternative.";

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
    q: "Are PDF dark mode extensions safe to install?",
    a: "It depends on the permissions they ask for. Most of these extensions request access to \"read and change all your data on the websites you visit\" — a broad, all-site permission — because their CSS filter has to run on every page, not just PDFs. That's a lot of trust to hand over for a color flip. Check the permissions screen before you install, and be wary of extensions with few reviews or no listed developer.",
  },
  {
    q: "Why do images turn into negatives with these extensions?",
    a: "The common technique is a CSS filter: invert() applied over the whole rendered page. That filter doesn't know the difference between a paragraph of text and a photo — it flips every pixel's brightness and hue. Text becomes readable light-on-dark, but skies turn orange, skin turns blue-violet, and charts lose their original colors.",
  },
  {
    q: "Why won't the extension work on a local PDF file?",
    a: "Chrome and Edge block extensions from accessing file:// URLs by default, as a security measure. The fix: go to chrome://extensions (or edge://extensions), open the extension's Details, and switch on \"Allow access to file URLs.\" Until you do, the extension silently does nothing on downloaded PDFs.",
  },
  {
    q: "Do I need to install the extension on every device?",
    a: "Yes. A browser extension lives inside one browser on one device. Your phone, your work laptop, and your home computer each need it installed and the file-access permission re-enabled separately. Nothing about the PDF itself changes, so there's nothing to carry between devices.",
  },
  {
    q: "If I install one, does the PDF file itself become dark?",
    a: "No. The extension only changes how the page looks while you're viewing it in that browser tab. The PDF on disk is untouched — email it, upload it to a shared drive, or open it in Preview or Acrobat, and it's back to a plain white page.",
  },
  {
    q: "What's the alternative to installing an extension?",
    a: "Convert the file once. PDF Dark runs entirely in the browser tab you already have open — drop a PDF in, pick a theme, and either read it inline or download an actual dark-themed PDF. No extension, no permissions screen, no per-device setup, and images are detected and kept in their original colors instead of inverted.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: TITLE,
    url: `${site}${SLUG}`,
    description: DESCRIPTION,
    author: { "@type": "Organization", name: "PDF Dark" },
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

export default function ExtensionVariantPage() {
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
            <a href="#options" className="hover:text-neutral-100">
              Your options
            </a>
            <a href="#the-catch" className="hover:text-neutral-100">
              The catch
            </a>
            <a href="#faq" className="hover:text-neutral-100">
              FAQ
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        {/* Article hero */}
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <p className="text-xs uppercase tracking-widest text-amber-400 mb-4">
            Blog
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            PDF Dark Mode Extensions
            <span className="block text-amber-400 mt-2">
              What Works, What Breaks
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            The Chrome Web Store and Edge Add-ons both carry a handful of
            these.{" "}
            <strong className="text-neutral-100">
              Here&apos;s an honest map of your options
            </strong>{" "}
            — including the problems no listing page mentions.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 29, 2026</span>
            <span aria-hidden>·</span>
            <span>7 min read</span>
          </div>
        </section>

        {/* Your options at a glance */}
        <section id="options" className="max-w-3xl mx-auto px-6 pb-16">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            Your options at a glance
          </h2>
          <p className="text-neutral-400 text-center mb-8 max-w-xl mx-auto text-sm">
            Searching the stores turns up two kinds of extensions — plus two
            routes that skip the store entirely.
          </p>
          <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-6">
            <table className="w-full min-w-[760px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Option
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    How it darkens
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Images
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Local files
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-neutral-900">
                  <td className="px-4 py-4 align-top font-semibold text-neutral-100">
                    Dedicated &ldquo;PDF dark mode&rdquo; extensions
                    <div className="font-normal text-neutral-500 text-xs mt-1">
                      Chrome Web Store / Edge Add-ons
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-300">
                    CSS{" "}
                    <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                      invert()
                    </code>{" "}
                    filter over the built-in viewer
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Inverted — photos come out as negatives
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Blocked until you enable &ldquo;Allow access to file
                    URLs&rdquo;
                  </td>
                </tr>
                <tr className="border-b border-neutral-900">
                  <td className="px-4 py-4 align-top font-semibold text-neutral-100">
                    General dark-mode extensions
                    <div className="font-normal text-neutral-500 text-xs mt-1">
                      Dark Reader and similar
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-300">
                    Restyles regular web pages; PDF support is limited —
                    Dark Reader&apos;s own docs say so
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Varies; PDFs often simply stay white
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Same file:// restriction
                  </td>
                </tr>
                <tr className="border-b border-neutral-900">
                  <td className="px-4 py-4 align-top font-semibold text-neutral-100">
                    Browser-native tweaks
                    <div className="font-normal text-neutral-500 text-xs mt-1">
                      No extension at all
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-300">
                    <Link
                      href="/blog/pdf-dark-mode-firefox"
                      className="text-amber-400 hover:underline"
                    >
                      Firefox&apos;s about:config
                    </Link>{" "}
                    darkens only the viewer chrome;{" "}
                    <Link
                      href="/blog/pdf-dark-mode-edge"
                      className="text-amber-400 hover:underline"
                    >
                      the Chromium force-dark flag
                    </Link>{" "}
                    darkens everything
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Flag inverts them; about:config leaves the page white
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Works
                  </td>
                </tr>
                <tr className="bg-amber-400/5">
                  <td className="px-4 py-4 align-top font-semibold text-amber-400">
                    PDF Dark
                    <div className="font-normal text-neutral-500 text-xs mt-1">
                      No install — runs in the tab
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-300">
                    Rewrites the file&apos;s colors once — read inline or
                    download the dark copy
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-300">
                    Photos keep their original colors
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-300">
                    Works — the file opens locally, never uploaded
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-neutral-300 leading-relaxed">
            The store extensions all work on the same idea: once the PDF is
            open in the browser&apos;s built-in viewer, the extension paints a
            CSS{" "}
            <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
              filter: invert()
            </code>{" "}
            over the rendered page. It takes ten seconds to install and it
            genuinely makes text readable in the dark. But a PDF isn&apos;t a
            web page, and treating it like one has side effects worth knowing
            about before you commit.
          </p>
        </section>

        {/* The catch — 5 problems */}
        <section
          id="the-catch"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              5 things extensions don&apos;t tell you upfront
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              These all follow from the CSS-invert technique itself, which is
              why they show up across the whole category.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  1. Your images get inverted too
                </h3>
                <p className="text-sm text-neutral-400">
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    filter: invert()
                  </code>{" "}
                  doesn&apos;t distinguish text from pictures — it flips
                  every pixel on the page. Screenshots, photos, and charts
                  all come out as color negatives: skies turn orange, faces
                  turn blue-violet, brand colors in a chart become whatever
                  their opposite is. Unless an extension does extra work to
                  detect and undo this on images specifically — and most
                  don&apos;t, or don&apos;t do it well — you trade a bright
                  screen for a document full of negatives.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  2. Local files are blocked until you dig into settings
                </h3>
                <p className="text-sm text-neutral-400">
                  Chrome and Edge don&apos;t let extensions touch{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    file://
                  </code>{" "}
                  URLs by default — a security measure, not a bug. To darken
                  a PDF sitting on your own hard drive, you have to open{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    chrome://extensions
                  </code>{" "}
                  (or{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    edge://extensions
                  </code>
                  ), find the extension, and manually flip on &ldquo;Allow
                  access to file URLs.&rdquo; Nothing in the install flow
                  tells you this — it&apos;s the most common reason people
                  install one of these and conclude it &ldquo;just
                  doesn&apos;t work.&rdquo;
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  3. The permissions are bigger than the job
                </h3>
                <p className="text-sm text-neutral-400">
                  To apply that filter on any PDF you happen to open, the
                  extension has to inject CSS into every page you visit —
                  which is why the install prompt often asks for
                  &ldquo;read and change all your data on the websites you
                  visit.&rdquo; That&apos;s a broad, standing permission for
                  a feature you only need while looking at a PDF. Worth
                  weighing against how often you actually need it.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  4. You install it again on every browser and device
                </h3>
                <p className="text-sm text-neutral-400">
                  Phone browser, work laptop, home desktop — each is a
                  separate install, and each needs the file-access toggle
                  re-enabled separately. There&apos;s no single setup that
                  travels with you; the extension lives in the browser, not
                  with the document.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  5. The PDF itself never changes
                </h3>
                <p className="text-sm text-neutral-300">
                  An extension only changes how the page looks while
                  you&apos;re viewing it in that tab. The file on disk is
                  untouched. Email it, drop it in a shared drive, or open it
                  on a device without the extension, and it&apos;s back to a
                  plain white page — because nothing about the document
                  actually changed, only the display.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist */}
        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            If you do install one: a 4-point checklist
          </h2>
          <p className="text-neutral-400 text-center mb-8 max-w-xl mx-auto text-sm">
            Two minutes on the store listing tells you most of what you need
            to know.
          </p>
          <ol className="space-y-4 text-sm text-neutral-300 list-decimal pl-5 max-w-2xl mx-auto">
            <li>
              <strong className="text-neutral-100">Permissions.</strong>{" "}
              Prefer extensions that run on demand (&ldquo;when you click the
              extension&rdquo;) over ones demanding &ldquo;read and change all
              your data on the websites you visit&rdquo; as a standing grant.
            </li>
            <li>
              <strong className="text-neutral-100">
                Developer and privacy policy.
              </strong>{" "}
              The listing should name an actual developer and link a privacy
              policy. Be wary of anonymous listings with few reviews.
            </li>
            <li>
              <strong className="text-neutral-100">Last updated.</strong>{" "}
              A filter extension that hasn&apos;t shipped an update in years
              tends to break quietly as the browser&apos;s PDF viewer changes.
            </li>
            <li>
              <strong className="text-neutral-100">Local-file support.</strong>{" "}
              Whatever you pick, downloaded PDFs won&apos;t darken until you
              open <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">chrome://extensions</code>{" "}
              and switch on &ldquo;Allow access to file URLs&rdquo; yourself —
              no extension can do this step for you.
            </li>
          </ol>
        </section>

        {/* Alternative */}
        <section className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            The alternative: skip the install entirely
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
            PDF Dark runs the exact same idea — darken the page — but as a
            one-time conversion in a webpage you already have open, not a
            standing browser extension.
          </p>
          <p className="text-neutral-300 leading-relaxed">
            Go to the{" "}
            <Link
              href="/converter"
              className="text-amber-400 hover:underline"
            >
              PDF Dark converter
            </Link>
            , drag a file in, pick a theme, and download. No extension
            permission dialog, nothing installed on any device, nothing to
            grant access to — and instead of a blanket color flip, photos and
            scans are detected and kept in their original colors.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            No CSS filter, no whole-page invert —{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              here&apos;s what it does instead
            </Link>
            . Or skip the file entirely and{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              read the PDF in dark mode right on this page
            </Link>{" "}
            — nothing saved, nothing installed.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            No browser extension store, no permissions screen, no file-access
            toggle to remember. Works the same on any modern desktop or
            mobile browser.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Skip the extension. Convert the PDF instead.
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            No install, no permissions, no per-device setup
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a PDF on the converter and download a dark-themed file that
            stays dark everywhere you open it.
          </p>
          <Link
            href="/converter"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Convert a PDF to dark mode →
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Just want to read it once?{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              Open it in the reader instead
            </Link>
            .
          </p>
        </section>

        <RelatedVariants currentSlug="pdf-dark-mode-extension" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode extension FAQ
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
