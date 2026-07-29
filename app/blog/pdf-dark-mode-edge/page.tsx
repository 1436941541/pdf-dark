import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-edge";
const TITLE = "PDF Dark Mode in Microsoft Edge — Beyond the Flags Page Hack";
const DESCRIPTION =
  "Turning on Edge's dark theme doesn't touch your PDFs — the page stays white. There's a flag that can force it dark, but it wrecks your images. Here's a cleaner fix.";

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
    q: "Does Microsoft Edge have a built-in PDF dark mode?",
    a: "Not really. Switching Edge itself to Dark (Settings → Appearance → Mode) darkens the toolbar, tabs, and menus, but the PDF page underneath still renders on a white background. Edge is built on Chromium, so its bundled PDF viewer behaves the same way Chrome's does here — the app theme and the document content are handled separately, and only the app theme got the dark treatment.",
  },
  {
    q: "What is the 'Force Dark Mode for Web Contents' flag in edge://flags?",
    a: "It's an experimental setting: type edge://flags into the address bar, search for \"Force Dark Mode for Web Contents\" (sometimes labeled Auto Dark Mode for Web Contents), and switch it from Default to Enabled, then relaunch. Once on, Edge force-darkens rendered page content, PDFs included. It's not something most people stumble into — flags are tucked away specifically because they're unfinished — and the name or behavior can change or disappear in a future Edge update, since that's the nature of a flags page.",
  },
  {
    q: "If I enable that flag, will my PDF actually look good?",
    a: "For a plain text document, it's passable. For anything with photos, a logo, or a colored chart, no — the flag applies one blanket filter to everything on the page. It doesn't know the difference between a paragraph of text and a product photo, so both get inverted the same way. Expect washed-out or color-flipped images sitting next to your now-dark text.",
  },
  {
    q: "What's the F12 Console trick people mention for Edge PDFs?",
    a: "Open DevTools (F12), go to the Console tab, and run document.embeds[0].style.filter = 'invert(0.95)' while viewing a PDF. It inverts the embedded PDF viewer on the spot. It works, but it's a manual, one-tab, one-session fix — reload the page or open a new PDF and you're typing it in again. It's really a trick for people comfortable poking at DevTools, not a real workflow.",
  },
  {
    q: "Are there Microsoft Edge Add-ons for PDF dark mode?",
    a: "Yes, the Edge Add-ons store carries a few extensions with names along those lines, built the same way as their Chrome Web Store counterparts — a CSS invert filter over the page. They carry the same trade-offs: images get inverted along with text, and you're granting a browser extension permission to read and modify the page.",
  },
  {
    q: "Is my PDF uploaded anywhere when I use PDF Dark?",
    a: "No. The conversion runs entirely inside your Edge tab through the File API and a Web Worker. Open DevTools → Network while you use the tool and you won't see a request carrying your file anywhere.",
  },
];

function StructuredData() {
  const site = getSiteUrl();
  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "PDF Dark Mode for Microsoft Edge",
    url: `${site}${SLUG}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any Chromium-based Edge browser",
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

export default function EdgeVariantPage() {
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
            <a href="#why" className="hover:text-neutral-100">
              Why the flag falls short
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
            PDF Dark Mode in Microsoft Edge
            <span className="block text-amber-400 mt-2">
              Beyond the Flags Page Hack
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            Turning on Edge&apos;s dark theme doesn&apos;t touch your PDFs —
            the page itself stays{" "}
            <em className="text-neutral-200">white</em>. There&apos;s a flag
            that can force it dark, but it wrecks your images along the way.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated August 8, 2026</span>
            <span aria-hidden>·</span>
            <span>7 min read</span>
          </div>
        </section>

        {/* Why the flag falls short */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why Edge&apos;s PDF dark mode is stuck behind a flag
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              Edge and Chrome share the same Chromium core, so it&apos;s no
              surprise they share the same gap — Edge just also hides an
              unfinished workaround in its settings.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  Edge&apos;s Dark appearance setting
                </h3>
                <p className="text-sm text-neutral-400">
                  Flip Edge to Dark under{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                    edge://settings/appearance
                  </code>{" "}
                  and the toolbar, tabs, and menus go dark right away. Open a
                  PDF and the page itself is exactly as bright as before —
                  Edge&apos;s built-in viewer treats the document canvas as
                  separate from the app chrome, same as Chrome&apos;s does,
                  because underneath they&apos;re the same Chromium
                  component.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  The <code className="text-amber-400 text-sm bg-neutral-950 px-1.5 py-0.5 rounded">edge://flags</code> workaround
                </h3>
                <p className="text-sm text-neutral-400 mb-3">
                  Edge does have an experimental switch —{" "}
                  <strong className="text-neutral-200">
                    Force Dark Mode for Web Contents
                  </strong>{" "}
                  — that most Chrome users don&apos;t get. Turn it on and Edge
                  will force-darken page content, PDFs included. It comes
                  with real caveats:
                </p>
                <ul className="text-sm text-neutral-400 list-disc pl-5 space-y-1.5">
                  <li>
                    <strong className="text-neutral-200">
                      It&apos;s a blanket filter.
                    </strong>{" "}
                    It doesn&apos;t distinguish text from images, so photos,
                    logos, and charts get inverted right along with the
                    paragraphs.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      It&apos;s buried on purpose.
                    </strong>{" "}
                    You have to know the exact flag name to find it — it
                    isn&apos;t surfaced anywhere in Edge&apos;s normal
                    settings.
                  </li>
                  <li>
                    <strong className="text-neutral-200">
                      It&apos;s experimental, full stop.
                    </strong>{" "}
                    Flags are Microsoft&apos;s staging ground for unfinished
                    features. The name, the default, or the flag itself can
                    change or vanish in a later Edge release without notice.
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <h3 className="font-semibold text-neutral-50 mb-1 text-base m-0 mt-0">
                  DevTools console tricks and Edge Add-ons
                </h3>
                <p className="text-sm text-neutral-400">
                  If you&apos;d rather not touch flags, there&apos;s a
                  console one-liner some people run instead —{" "}
                  <code className="text-amber-400 text-xs bg-neutral-950 px-1 py-0.5 rounded">
                    document.embeds[0].style.filter = &apos;invert(0.95)&apos;
                  </code>{" "}
                  in DevTools (F12) — but it only lasts for that tab and
                  resets the moment you reload. The Edge Add-ons store also
                  carries a handful of &ldquo;PDF Dark Mode&rdquo;-style
                  extensions built the same way as their Chrome equivalents,
                  with the same image-inverting downsides.
                </p>
              </div>

              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    No flags to hunt down, no relaunching Edge, no extension
                    permissions
                  </li>
                  <li>
                    Text and background are recolored into your theme while
                    photos keep their real colors — nothing gets swept into
                    one blanket filter
                  </li>
                  <li>
                    Produces a downloadable dark PDF that stays dark in any
                    viewer, not just in a tab with a flag switched on
                  </li>
                  <li>
                    Your file never leaves your browser — check DevTools →
                    Network to confirm
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Using PDF Dark in Edge */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-6 text-center text-neutral-50">
            Using PDF Dark in Microsoft Edge
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            From the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>
            , drag a PDF in from your desktop or File Explorer, pick a theme,
            and download. Edge saves the dark version to your usual
            Downloads folder — open it later in Acrobat, Preview, or your
            phone and it&apos;s still dark, with no flag to re-enable and no
            extension to reinstall.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            The recoloring runs the same way in every browser — vector text
            and background swaps, photo detection so images keep their real
            colors, no whole-page invert filter involved.{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              See how the conversion works
            </Link>{" "}
            for the technical breakdown. Only reading it once? Skip the
            download and use the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode PDF reader
            </Link>{" "}
            instead.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            Works on Edge for Windows, Mac, and Linux — and on Edge for
            Android and iOS through the mobile browser. No flags to flip, no
            relaunch required.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Ready to read a PDF in dark mode on Edge?
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            3 steps, no edge://flags, no extensions
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a PDF on the reader and it renders dark right in your Edge
            tab — no file saved, no experimental flag required.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-amber-400 text-neutral-950 rounded-full font-semibold hover:bg-amber-300 transition-colors"
          >
            Read a PDF in dark mode →
          </Link>
          <p className="mt-4 text-sm text-neutral-500">
            Want to keep the file?{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              Convert &amp; download it instead
            </Link>
            .
          </p>
        </section>

        <RelatedVariants currentSlug="pdf-dark-mode-edge" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode in Microsoft Edge FAQ
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
