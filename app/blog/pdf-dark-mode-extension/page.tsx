import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-extension";
const TITLE = "PDF Dark Mode Extensions: What's Available, and What to Check First";
const DESCRIPTION =
  "An honest map of PDF dark mode extensions in the Chrome and Edge stores — how they darken pages, what breaks, and a checklist before you install one.";
const PUBLISHED = "2026-07-29";
const UPDATED = "2026-07-30";

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
    a: "It depends on the permissions. Most ask to read and change your data on every website you visit — a lot of trust for a color flip — so check the permissions screen, the developer name, and the reviews before installing.",
  },
  {
    q: "Why do images turn into negatives with these extensions?",
    a: "The CSS invert() filter they use flips every pixel and can't tell a photo from a paragraph — skies turn orange, skin turns blue-violet, charts lose their colors.",
  },
  {
    q: "Why won't the extension work on a local PDF file?",
    a: "Chrome and Edge block extensions from file:// URLs by default. You have to open the extension's Details in chrome://extensions (or edge://extensions) and switch on 'Allow access to file URLs' yourself.",
  },
  {
    q: "Do I need to install the extension on every device?",
    a: "Yes. Each browser on each device needs its own install, with the file-access toggle re-enabled separately — nothing about the PDF itself changes, so nothing carries over.",
  },
  {
    q: "If I install one, does the PDF file itself become dark?",
    a: "No. Only the display in that browser tab changes. Email the file or open it in Preview or Acrobat, and it's back to a plain white page.",
  },
  {
    q: "What's the alternative to installing an extension?",
    a: "Convert the file once. PDF Dark runs in the tab you already have open — drop a PDF in, pick a theme, read inline or download a dark copy — with no permissions screen, no per-device setup, and photos kept in their original colors.",
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
    author: { "@type": "Organization", name: "PDF Dark Team" },
    datePublished: PUBLISHED,
    dateModified: UPDATED,
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
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <article className="max-w-2xl mx-auto px-6 py-16 text-neutral-300 leading-relaxed">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-50 leading-tight mb-4">
            PDF Dark Mode Extensions: What&apos;s Available, and What to
            Check First
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            4 min read
          </p>

          <p className="text-lg mb-8">
            You typed &ldquo;PDF dark mode&rdquo; into the Chrome Web Store
            search box and got back a page of extensions, each promising the
            same thing under a slightly different icon. You opened a couple of
            listings, saw four-ish stars and a permissions prompt asking to
            read data on all websites, and paused. That pause is the right
            instinct: nearly all of these work the same way under the hood,
            and the technique carries the same trade-offs no matter whose
            name is on the listing. Here&apos;s the map — and when skipping
            the install is the better call.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The short version
          </h2>
          <p className="mb-5">
            Almost every &ldquo;PDF dark mode&rdquo; extension is the same
            CSS invert filter under a different name: text becomes readable,
            photos flip into negatives, and the install asks for broad
            permissions plus per-device setup. If all you want is to read a
            PDF dark, there&apos;s a no-install route — open the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              PDF dark mode reader
            </Link>{" "}
            in the tab you already have, or use the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              converter
            </Link>{" "}
            to keep a dark copy of the file itself.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            What the extensions actually are
          </h2>
          <p className="mb-5">
            The store extensions paint a color-inverting CSS filter over the
            built-in viewer. It takes ten seconds to install and genuinely
            makes text readable — but the filter flips every pixel, so photos
            and charts come out as color negatives, and the permission grant
            covers every website you visit. Three costs never appear on the
            listing: local files stay untouched until you enable a
            file-access toggle in the browser&apos;s extension settings,
            every device needs its own install, and the PDF itself never
            changes — open it anywhere else and it&apos;s white again. Side
            by side:
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
                    CSS invert filter over the built-in viewer
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
                    Restyles regular web pages; PDF support is limited — a
                    recurring theme on{" "}
                    <a
                      href="https://github.com/darkreader/darkreader/issues/12965"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline"
                    >
                      Dark Reader&apos;s own issue tracker
                    </a>
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Varies; PDFs often simply stay white
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    Same local-file restriction
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
                      Firefox&apos;s hidden viewer preference
                    </Link>{" "}
                    darkens only the toolbar;{" "}
                    <Link
                      href="/blog/pdf-dark-mode-edge"
                      className="text-amber-400 hover:underline"
                    >
                      the Chromium force-dark switch
                    </Link>{" "}
                    darkens everything indiscriminately
                  </td>
                  <td className="px-4 py-4 align-top text-neutral-400">
                    The force-dark switch inverts them; the Firefox preference
                    leaves the page white
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
          <p className="mb-5">
            Extensions do have one real advantage — they darken PDFs
            automatically as you browse. If that&apos;s worth it to you,
            spend two minutes on the listing first: what permissions it
            demands, whether it names a developer and a privacy policy, and
            when it was last updated — filter extensions tend to break
            quietly as browsers change their PDF viewers.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            The no-install route
          </h2>
          <p className="mb-4">
            For everyone else, the trade-offs above are avoidable entirely:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/" className="text-amber-400 hover:underline">
                PDF dark mode reader
              </Link>{" "}
              in the browser you already have — no store, no permissions
              screen.
            </li>
            <li>
              Drop your PDF in and pick a theme. It renders dark in that tab,
              with photos kept in their original colors instead of inverted.
            </li>
            <li>
              Want the file itself dark, on every device? Use the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              and download a dark copy — it stays dark in Acrobat, Preview,
              or your phone&apos;s reader, because the change is saved into
              the file.
            </li>
          </ol>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Have a PDF open right now? Drop it on the reader and it renders
              dark in this same tab — no install, no permissions screen, no
              per-device setup.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Read a PDF in dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode extension FAQ
          </h2>
          {FAQ.map((f) => (
            <div key={f.q} className="mb-7">
              <h3 className="text-lg font-semibold text-neutral-50 mb-2">
                {f.q}
              </h3>
              <p className="text-neutral-400">{f.a}</p>
            </div>
          ))}
        </article>

        <RelatedVariants currentSlug="pdf-dark-mode-extension" />
      </main>

      <Footer />
    </div>
  );
}
