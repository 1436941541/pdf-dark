import Link from "next/link";
import { ResponsiveNavigation } from "./responsive-navigation";
import { LanguageSwitcher } from "./language-switcher";

type Tool = "reader" | "invert" | "monochrome" | "deskew" | "background";

const TOOLS: { id: Tool; href: string; label: string }[] = [
  { id: "reader", href: "/", label: "Reader" },
  { id: "invert", href: "/invert-pdf-colors", label: "Invert colors" },
  { id: "deskew", href: "/deskew-pdf", label: "Deskew PDF" },
  { id: "background", href: "/pdf-background-remover", label: "Remove background" },
  { id: "monochrome", href: "/pdf-to-black-and-white", label: "Black & white" },
];

export function ToolNavigation({ active }: { active: Tool }) {
  return (
    <ResponsiveNavigation language={(active === "reader" || active === "invert") ? <LanguageSwitcher page={active === "reader" ? "home" : "invert"} current="en" /> : undefined}>
      {TOOLS.map(({ id, href, label }) => <Link key={id} href={href} aria-current={active === id ? "page" : undefined} className={`whitespace-nowrap transition-colors ${active === id ? "text-amber-400" : "hover:text-neutral-100"}`}>{label}</Link>)}
      <Link href="/blog" className="hover:text-neutral-100">Blog</Link>
    </ResponsiveNavigation>
  );
}
