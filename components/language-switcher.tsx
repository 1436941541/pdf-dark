import Link from "next/link";

// tr / id 自 2026-09-21 起 noindex 下线，从下拉里摘出，但页面本身仍可直达 ——
// 所以 current 还要接受它们，只是不作为可选目标。重新放开时把它们从
// RETIRED_LABELS 挪回 HREFS + LABELS 即可，其余逻辑自动跟上。
type Locale = "en" | "es" | "pt" | "de";
type RetiredLocale = "tr" | "id";
type PageKind = "home" | "invert";

// Add a new language by adding one entry here (and to LABELS below) — the
// dropdown and every page's <LanguageSwitcher> pick it up automatically.
const HREFS: Record<PageKind, Record<Locale, string>> = {
  home: { en: "/", es: "/es", pt: "/pt", de: "/de" },
  invert: {
    en: "/invert-pdf-colors",
    es: "/es/invert-pdf-colors",
    pt: "/pt/invert-pdf-colors",
    de: "/de/invert-pdf-colors",
  },
};

const LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  de: "Deutsch",
};

const RETIRED_LABELS: Record<RetiredLocale, string> = {
  tr: "Türkçe",
  id: "Bahasa Indonesia",
};

const LOCALES = Object.keys(HREFS.home) as Locale[];

export function LanguageSwitcher({
  page,
  current,
}: {
  page: PageKind;
  current: Locale | RetiredLocale;
}) {
  const currentLabel =
    current in LABELS
      ? LABELS[current as Locale]
      : RETIRED_LABELS[current as RetiredLocale];
  return (
    <details className="relative">
      <summary className="inline-flex items-baseline gap-1 cursor-pointer list-none text-neutral-400 hover:text-neutral-100 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="text-[0.85em]">🌐</span>
        <span className="hidden sm:inline">{currentLabel}</span>
        <span aria-hidden className="text-neutral-600 text-[0.7em]">⌄</span>
      </summary>
      <div className="absolute right-0 mt-2 min-w-40 rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg overflow-hidden z-20">
        {LOCALES.map((loc) => (
          <Link
            key={loc}
            href={HREFS[page][loc]}
            aria-current={loc === current ? "true" : undefined}
            className={`block px-3.5 py-2 text-sm whitespace-nowrap ${
              loc === current
                ? "text-amber-400 font-semibold bg-neutral-800/60"
                : "text-neutral-300 hover:bg-neutral-800/60"
            }`}
          >
            {LABELS[loc]}
          </Link>
        ))}
      </div>
    </details>
  );
}
