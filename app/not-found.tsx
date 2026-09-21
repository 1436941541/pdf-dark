import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found | PDF Dark",
  description:
    "The page you requested does not exist. Return to PDF Dark to read or convert a PDF in dark mode.",
  alternates: { canonical: null },
  robots: { index: false, follow: true },
  openGraph: null,
  twitter: null,
};

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="max-w-lg text-center">
        <div className="text-6xl" aria-hidden>
          🌙
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-4 text-neutral-400">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-amber-400 px-5 py-2.5 font-medium text-neutral-950 hover:bg-amber-300"
          >
            Open PDF reader
          </Link>
          <Link
            href="/invert-pdf-colors"
            className="rounded-lg border border-neutral-700 px-5 py-2.5 font-medium text-neutral-200 hover:border-neutral-500"
          >
            Invert PDF colors
          </Link>
        </div>
      </div>
    </main>
  );
}
