import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { VARIANTS } from "@/lib/variants";

const TITLE = "PDF Dark Blog — Dark Mode Guides for Every PDF Reader";
const DESCRIPTION =
  "Guides on converting, inverting, and darkening PDFs — platform-specific fixes for Chrome, Firefox, Edge, Acrobat, Sumatra, Mac, iPad, and Android.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function BlogIndexPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
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
            <Link href="/converter" className="hover:text-neutral-100">
              Converter
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full">
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-20">
          <h1 className="text-4xl font-bold tracking-tight text-center">
            The PDF Dark Blog
          </h1>
          <p className="mt-4 text-neutral-400 text-center max-w-xl mx-auto">
            Guides on converting, inverting, and darkening PDFs —
            browser-specific tips, platform walkthroughs, and how the
            conversion works under the hood. Every post has the converter one
            click away.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-12">
            {VARIANTS.map((v) => (
              <Link
                key={v.slug}
                href={`/blog/${v.slug}`}
                className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 hover:border-amber-400/40 transition-colors"
              >
                <div className="text-neutral-50 group-hover:text-amber-400 transition-colors flex items-center justify-between">
                  <h2 className="text-base font-semibold m-0">{v.title}</h2>
                  <span
                    aria-hidden
                    className="text-neutral-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all"
                  >
                    →
                  </span>
                </div>
                <div className="mt-1 text-sm text-neutral-400">{v.blurb}</div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
