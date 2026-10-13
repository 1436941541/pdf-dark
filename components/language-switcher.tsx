"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// tr / id retired 2026-09-21 — their pages 404 now; see next.config.ts.
type Locale = "en" | "es" | "pt" | "de";
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

const LOCALES = Object.keys(HREFS.home) as Locale[];

export function LanguageSwitcher({
  page,
  current,
}: {
  page: PageKind;
  current: Locale;
}) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (details.current?.open && !details.current.contains(event.target as Node)) details.current.open = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.current?.open) {
        details.current.open = false;
        details.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
  return (
    <details ref={details} className="relative" onClick={(event) => { if ((event.target as Element).closest("a") && details.current) details.current.open = false; }}>
      <summary aria-label={`Select language: ${LABELS[current]}`} className="flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-neutral-800 md:min-h-0 md:min-w-0 md:border-0 md:items-baseline cursor-pointer list-none text-neutral-400 hover:text-neutral-100 [&::-webkit-details-marker]:hidden">
        <span aria-hidden className="text-lg md:text-[0.85em]">🌐</span>
        <span className="hidden md:inline">{LABELS[current]}</span>
        <span aria-hidden className="hidden text-neutral-600 text-[0.7em] md:inline">⌄</span>
      </summary>
      <div className="absolute right-0 mt-2 min-w-40 rounded-lg border border-neutral-800 bg-neutral-900 shadow-lg overflow-hidden z-50">
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
