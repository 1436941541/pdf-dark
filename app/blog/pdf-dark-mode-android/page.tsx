import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedVariants } from "@/components/related-variants";
import { getSiteUrl } from "@/lib/site";

const SLUG = "/blog/pdf-dark-mode-android";
const TITLE = "PDF Dark Mode on Android — No Root, No System Hack";
const DESCRIPTION =
  "Android's default PDF viewers still don't have a real dark mode, and Accessibility color inversion flips your whole screen negative. Convert the file once and every app opens it dark.";

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
    q: "Does Android have a built-in PDF dark mode?",
    a: "Not a real one, at least not today. The default viewer built into Files by Google (which also handles the PDF viewer Google Drive used to ship separately) still renders PDF pages on a white background regardless of your system theme. Users have been asking for it on Google's own Drive/Docs support forums for years without an official fix.",
  },
  {
    q: "What about the 'Dark theme' setting inside Files by Google or Drive?",
    a: "That toggle changes the app chrome — toolbars, menus, file lists — around the PDF. The page content itself, once you open a PDF to read it, still renders as black text on a white page.",
  },
  {
    q: "Can I use Android's Color Inversion accessibility setting instead?",
    a: "You can, but it's a blunt instrument. Settings → Accessibility → Color Inversion (sometimes labeled Negative Colors) flips your entire screen — every app, every icon, every photo — not just the PDF page. Photos and icons turn into negatives, and you have to remember to switch it back off when you're done reading.",
  },
  {
    q: "What about viewing PDFs saved in Samsung Notes?",
    a: "Samsung Notes has a known dark-mode quirk with imported PDFs: if the note's default color style is set to Transparent, dark mode doesn't apply properly to the PDF content. Switching the default color style to Black in Notes settings is the workaround people report fixing it.",
  },
  {
    q: "How is this different from a system-wide fix?",
    a: "PDF Dark doesn't touch your phone's display or any app settings. You convert the file once in your Android browser, and the output is an ordinary PDF with the dark theme baked into the pages — it opens dark in Files by Google, WPS, Adobe Acrobat, or any other viewer, and stays dark if you send it to someone else's phone too.",
  },
  {
    q: "Is my PDF uploaded anywhere when I use this on my phone?",
    a: "No. The conversion runs entirely in your Android browser tab using the File API and a Web Worker — nothing is sent to a server. There's no account, no install, and no permissions beyond picking a file.",
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

export default function AndroidVariantPage() {
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
              Why not built-in
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
            PDF Dark Mode on Android
            <span className="block text-amber-400 mt-2">
              No Root, No System Hack
            </span>
          </h1>
          <p className="mt-6 text-lg text-neutral-300 max-w-2xl mx-auto">
            The default PDF viewer still opens every page white, and the
            system-wide color inversion trick{" "}
            <strong className="text-neutral-100">
              flips your whole screen negative
            </strong>{" "}
            — icons, photos, everything. There&apos;s a cleaner middle ground.
          </p>
          <div className="mt-6 text-sm text-neutral-500 flex flex-wrap justify-center gap-x-3 gap-y-1">
            <span>By PDF Dark Team</span>
            <span aria-hidden>·</span>
            <span>Updated July 25, 2026</span>
            <span aria-hidden>·</span>
            <span>7 min read</span>
          </div>
        </section>

        {/* Why not built-in */}
        <section
          id="why"
          className="w-full py-20 border-y border-neutral-900 bg-[#0e0e0e]"
        >
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl font-bold mb-3 text-center text-neutral-50">
              Why reading a PDF in the dark on Android is still awkward
            </h2>
            <p className="text-neutral-400 text-center mb-10 max-w-xl mx-auto text-sm">
              None of the built-in options actually darken the page you&apos;re
              reading without side effects.
            </p>

            <div className="overflow-x-auto rounded-xl border border-neutral-800 mb-5">
              <table className="w-full min-w-[700px] border-collapse text-sm">
                <thead>
                  <tr className="bg-neutral-900/60 text-left">
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      Option
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      Where
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      What happens
                    </th>
                    <th className="px-4 py-3 font-semibold text-neutral-200 border-b border-neutral-800">
                      The catch
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-900">
                    <td className="px-4 py-4 align-top font-semibold text-neutral-100 whitespace-nowrap">
                      Files by Google / Drive dark theme
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      In-app setting
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      Darkens the app chrome — menus, file browser
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-400">
                      Page content still renders white; requested on
                      Google&apos;s own forums for years, unresolved
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-900">
                    <td className="px-4 py-4 align-top font-semibold text-neutral-100 whitespace-nowrap">
                      Color Inversion
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      <code className="text-amber-400 text-xs bg-neutral-950 px-1.5 py-0.5 rounded">
                        Settings → Accessibility
                      </code>
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      Inverts the entire screen
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-400">
                      Not scoped to the PDF — icons, other apps, and photos
                      invert too; manual toggle on and off
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 align-top font-semibold text-neutral-100 whitespace-nowrap">
                      Samsung Notes dark mode
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      Notes app color style setting
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-300">
                      Applies dark mode to imported PDFs
                    </td>
                    <td className="px-4 py-4 align-top text-neutral-400">
                      Only works if the default color style is Black — breaks
                      silently when it&apos;s set to Transparent
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-neutral-400 text-sm mb-5">
              None of these three darken just the PDF page without a side
              effect — a whole-screen invert, an app-chrome-only theme, or a
              setting most people never think to check.
            </p>

            <div className="space-y-5">
              <div className="p-6 rounded-xl border border-amber-400/30 bg-amber-400/5">
                <h3 className="font-semibold text-amber-400 mb-1 text-base m-0 mt-0">
                  What PDF Dark does differently
                </h3>
                <ul className="text-sm text-neutral-300 list-disc pl-5 space-y-1.5">
                  <li>
                    Darkens only the PDF, once — not your icons, your other
                    apps, or the rest of your screen
                  </li>
                  <li>
                    Photos keep their real colors while text and backgrounds
                    switch to your chosen theme
                  </li>
                  <li>
                    Saves a normal PDF file that opens dark in Files by
                    Google, WPS, Adobe Acrobat, or any reader — no toggle to
                    remember each time
                  </li>
                  <li>
                    Runs entirely in your phone&apos;s browser tab — the file
                    is never uploaded anywhere
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Using PDF Dark on Android */}
        <section className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl font-bold mb-6 text-center text-neutral-50">
            Using PDF Dark on Android
          </h2>
          <p className="text-neutral-300 leading-relaxed">
            Go to the{" "}
            <Link href="/converter" className="text-amber-400 hover:underline">
              PDF Dark converter
            </Link>{" "}
            in Chrome, Firefox, or any Android browser, pick a PDF from
            Downloads or Google Drive, choose a theme, and download. The file
            saves to your phone&apos;s Downloads and opens dark in Files by
            Google, WPS, or whatever app you normally use — no accessibility
            toggle to flip on and off.
          </p>
          <p className="text-neutral-300 leading-relaxed mt-4">
            None of this depends on your phone&apos;s manufacturer or Android
            version — the pixel work happens inside the browser tab, not the
            OS.{" "}
            <Link
              href="/blog/how-pdf-dark-mode-conversion-works"
              className="text-amber-400 hover:underline"
            >
              Here&apos;s the mechanics behind it
            </Link>
            . Just want to read it once tonight without saving a new file?
            Use the{" "}
            <Link href="/" className="text-amber-400 hover:underline">
              dark mode PDF reader
            </Link>{" "}
            instead.
          </p>

          <p className="mt-10 text-sm text-neutral-500">
            Works in any modern Android browser — Chrome, Firefox, or Samsung
            Internet. Already reading inside your browser instead of a native
            app? See the{" "}
            <Link
              href="/blog/pdf-dark-mode-chrome"
              className="text-amber-400 hover:underline"
            >
              Chrome
            </Link>{" "}
            and{" "}
            <Link
              href="/blog/pdf-dark-mode-firefox"
              className="text-amber-400 hover:underline"
            >
              Firefox
            </Link>{" "}
            posts for the mobile-browser specifics.
          </p>
        </section>

        {/* CTA — back to the tool */}
        <section className="max-w-3xl mx-auto px-6 py-16 border-t border-neutral-900 text-center">
          <h2 className="text-xl font-semibold text-neutral-50 mb-2">
            Ready to read a PDF in dark mode on your Android phone?
          </h2>
          <h3 className="text-sm font-medium text-amber-400 m-0 mb-4">
            No app install, no Accessibility settings to flip
          </h3>
          <p className="text-sm text-neutral-400 mb-6 max-w-xl mx-auto">
            Drop a PDF on the reader and it renders dark right in your phone
            browser — no file saved, nothing installed.
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

        <RelatedVariants currentSlug="pdf-dark-mode-android" />

        {/* FAQ */}
        <section
          id="faq"
          className="max-w-3xl mx-auto px-6 py-20 border-t border-neutral-900"
        >
          <h2 className="text-2xl font-bold mb-10 text-center text-neutral-50">
            PDF dark mode on Android FAQ
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
