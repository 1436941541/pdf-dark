import Link from "next/link";
import { Footer } from "@/components/footer";

/**
 * Shared chrome for legal pages (Privacy / Terms).
 * Keeps the home page's full-featured header simple and doesn't import Converter/etc.
 */
export function LegalFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col flex-1 w-full">
      <header className="w-full border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-2xl">🌙</span>
            <span className="text-lg font-semibold hidden sm:inline">PDF Dark</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full">{children}</main>

      <Footer />
    </div>
  );
}
