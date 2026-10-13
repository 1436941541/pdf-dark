import Link from "next/link";
import { LanguageSwitcher } from "./language-switcher";

type Tool = "reader" | "invert" | "monochrome" | "deskew";

const TOOLS: { id: Tool; href: string; label: string }[] = [
  { id: "reader", href: "/", label: "Reader" },
  { id: "invert", href: "/invert-pdf-colors", label: "Invert colors" },
  { id: "deskew", href: "/deskew-pdf", label: "Deskew PDF" },
  { id: "monochrome", href: "/pdf-to-black-and-white", label: "Black & white" },
];

export function ToolNavigation({ active }: { active: Tool }) {
  return (
    <nav aria-label="Main navigation" className="flex w-full flex-wrap items-center gap-x-4 gap-y-3 text-sm text-neutral-400 sm:w-auto">
      {TOOLS.map(({ id, href, label }) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={`whitespace-nowrap transition-colors ${active === id ? "text-amber-400" : "hover:text-neutral-100"}`}>{label}</Link>)}
      <Link href="/blog" className="hover:text-neutral-100">Blog</Link>
      <a href="#faq" className="hover:text-neutral-100">FAQ</a>
      {(active === "reader" || active === "invert") && <LanguageSwitcher page={active === "reader" ? "home" : "invert"} current="en" />}
    </nav>
  );
}
