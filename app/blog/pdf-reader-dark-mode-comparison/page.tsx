import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-reader-dark-mode-comparison";
const TITLE = "PDF Readers with Dark Mode: What Actually Works (2026 Comparison)";
const DESCRIPTION =
  "Acrobat, Foxit, Sumatra, Preview, Chrome, Edge, Firefox, mobile apps — a straight comparison of which PDF readers really have dark mode, and which fake it.";

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
    a: "Foxit PDF Reader has the most complete native implementation — a Dark Skin option, a View → Night mode toggle, and an Accessibility color-override setting. It's still off by default and desktop-only, but it's more built out than Acrobat's buried Replace Document Colors option.",
  },
  {
    q: "Why is almost every reader's dark mode 'temporary'?",
    a: "Because it's a software setting, not a property of the file. Toggle dark mode in Preview, Foxit, or a browser extension and the PDF itself hasn't changed at all — open the exact same file in a different app, on a different device, or send it to someone else, and it's back to a white page. Only a tool that rewrites the PDF's actual color data (like PDF Dark) produces a file that stays dark everywhere.",
  },
  {
    q: "Why do images get distorted in so many of these dark modes?",
    a: "Most dark-mode implementations work by inverting every pixel on the page — text and images alike. That flips a photo's colors into a negative (skies turn orange, skin turns blue). A proper implementation has to detect which regions are photographic content and leave those colors alone, which is what PDF Dark's Images toggle and Auto detection do.",
  },
  {
    q: "Does Adobe Acrobat have a real dark mode for PDFs?",
    a: "Sort of. It's hidden in Preferences → Accessibility → Replace Document Colors, and it recolors the page content. But it's an app-wide setting you have to configure per install — the file you view stays a normal white PDF everywhere else.",
  },
  {
    q: "Do phones and tablets support PDF dark mode?",
    a: "Only very recently, and only in specific apps. iOS/iPadOS 26 added a Dark Background toggle to Files and Books, and macOS Tahoe (26) added one to Preview. Older OS versions and most Android PDF viewers still have nothing — the page stays white regardless of system dark mode.",
  },
  {
    q: "If I just want a PDF that's dark everywhere, what should I use?",
    a: "Convert it once instead of hunting for a per-app toggle. PDF Dark runs entirely in your browser, detects and preserves photos automatically, and produces a real dark-themed PDF file you can reopen in Acrobat, Preview, your phone, or anywhere else — no per-app setting required.",
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
    author: { "@type": "Organization", name: "PDF Dark" },
    datePublished: "2026-07-29",
    dateModified: "2026-07-29",
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
            <a href="#table" className="hover:text-neutral-100">
              Comparison
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
            Blog · Comparison
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
            PDF Readers with Dark Mode
            <span className="block text-amber-400 mt-2">What Actually Works</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            &ldquo;Does my PDF app have dark mode&rdquo; has a different answer
            for every piece of software.{" "}
            <strong className="text-neutral-100">
              Here&apos;s every major reader, side by side
            </strong>{" "}
            — what it actually supports, and what it doesn&apos;t.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 29, 2026</span>
            <span aria-hidden>·</span>
            <span>10 min read</span>
          </div>
        </section>

        {/* Summary */}
        <section className="w-full py-16 border-y border-neutral-900 bg-[#0e0e0e]">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-neutral-300 leading-relaxed">
              Support is all over the map. Some readers — Foxit, Acrobat,
              Sumatra — have had a dark-mode option for years, just buried a
              few menus deep. Others — Chrome, Firefox, Android&apos;s stock
              viewers — have never shipped one, despite years of user
              requests. A few, like macOS Preview and iOS Files, only just
              added a toggle in their 2025/2026 releases.
            </p>
            <p className="text-neutral-300 leading-relaxed mt-4">
              But almost every option on this list shares the same limitation:
              it&apos;s a <strong className="text-neutral-100">software
              setting</strong>, not a property of the file. Turn on dark mode
              in Preview or Foxit and the PDF itself hasn&apos;t changed —
              open it in a different app, on a different device, or send it
              to a colleague, and it&apos;s a plain white document again. The
              table below spells out, reader by reader, whether what you get
              is a permanent dark file or just a temporary viewer effect —
              and what happens to the images along the way.
            </p>
          </div>
        </section>

        {/* Comparison table */}
        <section id="table" className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
            The comparison
          </h2>
          <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
            12 third-party readers and viewers — plus our own converter —
            checked for native dark-mode support, how permanent the effect is,
            and what happens to embedded images.
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
          <p className="text-xs text-neutral-500 text-center mt-4">
            Scroll sideways on small screens to see the full table.
          </p>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Skip the per-app hunt for a dark-mode toggle
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            Convert once, stays dark everywhere
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            PDF Dark produces an actual dark-themed PDF file — no login, no
            upload, photos kept in their real colors. Open it in any reader,
            on any device, and it&apos;s dark by default.
          </p>
          <Link
            href="/converter"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Convert a PDF to dark mode →
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Just want to read something now?{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              Open it in the dark-mode reader instead
            </Link>
            .
          </p>
        </section>

        <RelatedVariants currentSlug="pdf-reader-dark-mode-comparison" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode comparison FAQ
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
