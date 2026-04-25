import Link from "next/link";

const GITHUB_URL = "https://github.com/1436941541/pdf-dark";

export function Footer() {
  return (
    <footer className="w-full border-t border-neutral-900 mt-4">
      <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-neutral-500 flex items-center justify-between">
        <span>© {new Date().getFullYear()} PDF Dark</span>
        <div className="flex gap-4">
          <Link href="/" className="hover:text-neutral-300">Home</Link>
          <Link href="/about" className="hover:text-neutral-300">About</Link>
          <Link href="/privacy" className="hover:text-neutral-300">Privacy</Link>
          <Link href="/terms" className="hover:text-neutral-300">Terms</Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-neutral-300"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
