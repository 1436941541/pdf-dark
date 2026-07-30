import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { formatPostDate, getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-reader-dark-mode-comparison";
const TITLE = "PDF Readers with Dark Mode: What Actually Works (2026 Comparison)";
const DESCRIPTION =
  "Acrobat, Foxit, Sumatra, Preview, Chrome, Edge, Firefox, mobile apps — a straight comparison of which PDF readers really have dark mode, and which fake it.";
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

type Row = {
  name: string;
  hasDarkMode: string;
  permanence: string;
  images: string;
  note: string;
  link?: { href: string; label: string };
  highlight?: boolean;
};

const ROWS: Row[] = [
  {
    name: "Adobe Acrobat Reader",
    hasDarkMode: "Yes, buried in settings",
    permanence: "Software setting",
    images: "Unaffected",
    note: "Preferences → Accessibility → Replace Document Colors. The Dark Gray UI theme only recolors the toolbar, not the page.",
    link: { href: "/blog/pdf-dark-mode-adobe-acrobat", label: "Full Acrobat guide →" },
  },
  {
    name: "Sumatra PDF (Windows)",
    hasDarkMode: "Yes",
    permanence: "Temporary (key press) or permanent (config file, this PC only)",
    images: "Transparent images can distort",
    note: "Press i to invert on the fly, or hand-edit settings.txt for a fixed custom color scheme. Windows-only.",
    link: { href: "/blog/sumatra-pdf-dark-mode", label: "Full Sumatra guide →" },
  },
  {
    name: "Foxit PDF Reader",
    hasDarkMode: "Yes — the most complete of the bunch",
    permanence: "Software setting",
    images: "Unaffected",
    note: "Dark Skin under File, Night mode under View, plus Replace Document Colors in Accessibility preferences. Off by default, but genuinely built out.",
  },
  {
    name: "PDF-XChange Editor",
    hasDarkMode: "Limited",
    permanence: "Software setting",
    images: "Varies by configuration",
    note: "No dedicated dark mode — relies on the Accessibility color-override option as a workaround, with results that depend on how it's configured.",
  },
  {
    name: "Nitro PDF",
    hasDarkMode: "Limited support",
    permanence: "Software setting",
    images: "Unclear",
    note: "Dark/theme support is limited and not fully documented publicly — check the current release notes for your version.",
  },
  {
    name: "macOS Preview",
    hasDarkMode: "Yes, since macOS Tahoe (26)",
    permanence: "Viewer effect only, no file produced",
    images: "Left untouched",
    note: "“Use Dark Appearance for PDF” in the View menu inverts text but not images — only works inside Preview, and only on macOS 26+.",
    link: { href: "/blog/pdf-dark-mode-mac", label: "Full macOS Preview guide →" },
  },
  {
    name: "iOS / iPadOS Files & Books",
    hasDarkMode: "Yes, since iOS/iPadOS 26",
    permanence: "Viewer effect only, no file produced",
    images: "Unaffected",
    note: "A “Dark Background” toggle appeared in iOS/iPadOS 26. Nothing for older versions.",
    link: { href: "/blog/pdf-dark-mode-ipad", label: "Full iPad guide →" },
  },
  {
    name: "Chrome built-in viewer",
    hasDarkMode: "No",
    permanence: "—",
    images: "—",
    note: "Toolbar follows the OS theme; the page itself always renders on white. No setting exists.",
    link: { href: "/blog/pdf-dark-mode-chrome", label: "Full Chrome guide →" },
  },
  {
    name: "Firefox (PDF.js)",
    hasDarkMode: "Partially",
    permanence: "—",
    images: "—",
    note: "The PDF.js viewer's toolbar can go dark, but the page itself always renders on white.",
    link: { href: "/blog/pdf-dark-mode-firefox", label: "Full Firefox guide →" },
  },
  {
    name: "Microsoft Edge",
    hasDarkMode: "No native toggle",
    permanence: "Experimental flag, browser-wide",
    images: "Distorted by the flag",
    note: "An edge://flags experiment can force dark rendering, but it mangles images and isn't a real per-document setting.",
    link: { href: "/blog/pdf-dark-mode-edge", label: "Full Edge guide →" },
  },
  {
    name: "Android (Files by Google / Drive viewer)",
    hasDarkMode: "No",
    permanence: "—",
    images: "—",
    note: "No native dark mode for PDFs. Users have been requesting this in official forums for years without a fix.",
    link: { href: "/blog/pdf-dark-mode-android", label: "Full Android guide →" },
  },
  {
    name: "Browser extensions (Dark Reader for PDF, etc.)",
    hasDarkMode: "Yes, via CSS inversion",
    permanence: "Viewer effect only, no file produced",
    images: "Become negatives",
    note: "Works, but photos invert into negatives, you must manually allow local-file access, and the permission scope is broad.",
    link: { href: "/blog/pdf-dark-mode-extension", label: "Full extension guide →" },
  },
  {
    name: "PDF Dark (this site)",
    hasDarkMode: "Yes — built for exactly this",
    permanence: "Produces a real, permanent dark PDF file",
    images: "Auto-detected and kept in original color",
    note: "Free, no install, no login. Read online at pdfdark.org or convert & download — the result opens dark in any app, on any device, forever.",
    highlight: true,
  },
];

const FAQ = [
  {
    q: "Which PDF reader has the best built-in dark mode?",
    a: "Foxit PDF Reader — a Dark Skin option, a View → Night mode toggle, and an Accessibility color override. Still off by default and desktop-only.",
  },
  {
    q: "Why is almost every reader's dark mode 'temporary'?",
    a: "Because it's a software setting, not a property of the file — open the same PDF in another app, on another device, or send it to someone, and it's white again. Only rewriting the file's color data makes the darkness travel with it.",
  },
  {
    q: "Why do images get distorted in so many of these dark modes?",
    a: "Most implementations invert every pixel on the page, photos included, which flips them into negatives. Doing it right means detecting photographic regions and leaving their colors alone — which is what PDF Dark's Auto detection does.",
  },
  {
    q: "Does Adobe Acrobat have a real dark mode for PDFs?",
    a: "Sort of — Preferences → Accessibility → Replace Document Colors recolors the page, but it's a per-install app setting; the file stays a normal white PDF everywhere else.",
  },
  {
    q: "Do phones and tablets support PDF dark mode?",
    a: "Only very recently: iOS/iPadOS 26 added a Dark Background toggle to Files and Books, and macOS Tahoe (26) added one to Preview. Older versions and most Android viewers still have nothing.",
  },
  {
    q: "If I just want a PDF that's dark everywhere, what should I use?",
    a: "Convert it once instead of hunting for a per-app toggle. PDF Dark runs in your browser, keeps photos in their original colors, and produces a dark PDF file that opens dark in any reader.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const article = {
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
    </>
  );
}

export default function ComparisonPage() {
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
            PDF Readers with Dark Mode: What Actually Works (2026 Comparison)
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            By PDF Dark Team ·{" "}
            <time dateTime={UPDATED}>Updated {formatPostDate(UPDATED)}</time> ·
            5 min read
          </p>

          <p className="text-lg mb-8">
            Your editor, browser, and terminal are all dark — then a PDF
            opens and floods the screen white. So you start checking: does
            Preview have a toggle now? Foxit? That extension a coworker
            mentioned? Every app gives a different answer, and half the
            advice online describes a version from three years ago.
            Here&apos;s the current state of dark mode in every major PDF
            reader, checked and in one table.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mb-4">
            The short version
          </h2>
          <p className="mb-5">
            Almost no PDF reader has a true dark mode — one that changes the
            document rather than the software displaying it. The few that
            offer anything do it as a viewer setting: dark in that one app,
            on that one machine, white everywhere else. The table below goes
            reader by reader.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            The comparison
          </h2>
          <p className="mb-6">
            12 third-party readers and viewers — plus our own converter —
            checked for native dark-mode support, how permanent the effect
            is, and what happens to embedded images:
          </p>

          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full min-w-[860px] border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-900/60 text-left">
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Reader
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Dark mode?
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Permanent file or viewer effect?
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Images
                  </th>
                  <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.name}
                    className={
                      r.highlight
                        ? "bg-amber-400/5 border-b border-amber-400/20"
                        : "border-b border-neutral-900 last:border-b-0"
                    }
                  >
                    <td
                      className={
                        "px-4 py-4 align-top font-semibold whitespace-nowrap " +
                        (r.highlight ? "text-amber-400" : "text-neutral-100")
                      }
                    >
                      {r.name}
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      {r.hasDarkMode}
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      {r.permanence}
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      {r.images}
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-400 min-w-[220px]">
                      {r.note}
                      {r.link && (
                        <>
                          {" "}
                          <Link
                            href={r.link.href}
                            className="text-amber-400 hover:underline whitespace-nowrap"
                          >
                            {r.link.label}
                          </Link>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-neutral-600 mt-4 mb-10">
            Scroll sideways on small screens to see the full table.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            The pattern behind the table
          </h2>
          <p className="mb-5">
            Support is drifting in slowly: Foxit, Acrobat, and Sumatra have
            had an option for years, buried a few menus deep; macOS Preview
            and iOS Files only just{" "}
            <a
              href="https://blog.sangeeth.dev/notes/preview-app-adds-dark-mode-toggle-for-pdfs-on-macos-tahoe-ios-and-ipados-26/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              added a toggle
            </a>{" "}
            in their 26 releases; Chrome and Android&apos;s stock viewers
            still have nothing despite{" "}
            <a
              href="https://support.google.com/drive/thread/406087422"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:underline"
            >
              years of user requests
            </a>
            . More important, every &ldquo;yes&rdquo; in the table except
            the last row is a software setting, not a property of the file.
            Toggle dark mode in Preview or Foxit and the PDF itself
            hasn&apos;t changed — open it in another app, on another device,
            or send it to a colleague, and it&apos;s a white page again.
          </p>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-4">
            Making the file itself dark
          </h2>
          <p className="mb-4">
            To get a document that stays dark everywhere, rewrite its color
            data once instead of hunting for a toggle in every app:
          </p>
          <ol className="list-decimal pl-6 space-y-3 mb-5">
            <li>
              Open the{" "}
              <Link href="/converter" className="text-amber-400 hover:underline">
                converter
              </Link>{" "}
              and drop the PDF on it.
            </li>
            <li>
              Pick a theme — photos are detected and kept in their original
              colors.
            </li>
            <li>
              Download. The copy opens dark in every reader in the table.
            </li>
          </ol>
          <p className="mb-5">
            Everything runs in your browser; the file is never uploaded. To
            read one file right now without saving a copy, the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode reader
            </Link>{" "}
            does the same thing on screen.
          </p>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 text-center mb-4">
            <p className="text-neutral-300 mb-4">
              Skip the per-app hunt for a toggle. Convert the file once — no
              login, no upload, photos kept in their real colors — and it
              opens dark in every reader on this list.
            </p>
            <Link
              href="/converter"
              className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
            >
              Convert a PDF to dark mode →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-neutral-50 mt-12 mb-6">
            PDF dark mode comparison FAQ
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

        <RelatedVariants currentSlug="pdf-reader-dark-mode-comparison" />
      </main>

      <Footer />
    </div>
  );
}
