"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const LABELS = {
  en: { menu: "Menu", open: "Open navigation menu", close: "Close navigation menu", nav: "Main navigation" },
  es: { menu: "Menú", open: "Abrir menú de navegación", close: "Cerrar menú de navegación", nav: "Navegación principal" },
  pt: { menu: "Menu", open: "Abrir menu de navegação", close: "Fechar menu de navegação", nav: "Navegação principal" },
  de: { menu: "Menü", open: "Navigationsmenü öffnen", close: "Navigationsmenü schließen", nav: "Hauptnavigation" },
};

export function ResponsiveNavigation({ children, locale = "en", desktopGap = "normal" }: {
  children: ReactNode;
  locale?: keyof typeof LABELS;
  desktopGap?: "normal" | "wide";
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const labels = LABELS[locale];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    const breakpoint = window.matchMedia("(min-width: 768px)");
    const onResize = () => { if (breakpoint.matches) setOpen(false); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    breakpoint.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      breakpoint.removeEventListener("change", onResize);
    };
  }, [open]);

  return <div ref={container} className="relative shrink-0" onBlur={(event) => {
    if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={id} aria-label={open ? labels.close : labels.open} onClick={() => setOpen(!open)} className="flex min-h-11 items-center gap-2 rounded-lg border border-neutral-800 px-3 text-sm text-neutral-200 transition-colors hover:border-neutral-600 hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 md:hidden">
      <span>{labels.menu}</span>
      <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">{open ? <path d="m6 6 12 12M6 18 18 6" /> : <path d="M4 6h16M4 12h16M4 18h16" />}</svg>
    </button>
    <nav id={id} aria-label={labels.nav} onClick={(event) => { if ((event.target as Element).closest("a")) setOpen(false); }} className={`${open ? "flex" : "hidden"} absolute right-0 top-full z-40 mt-2 w-64 max-w-[calc(100vw-3rem)] flex-col gap-1 rounded-xl border border-neutral-800 bg-neutral-950 p-2 text-sm text-neutral-400 shadow-xl [&>a]:rounded-lg [&>a]:px-3 [&>a]:py-3 [&>a]:focus-visible:outline-amber-400 [&>a:hover]:bg-neutral-900 [&>details>summary]:flex [&>details>summary]:min-h-11 [&>details>summary]:px-3 [&>details>summary]:py-3 md:static md:mt-0 md:flex md:w-auto md:max-w-none md:flex-row md:flex-wrap md:items-center md:gap-y-3 md:rounded-none md:border-0 md:bg-transparent md:p-0 md:shadow-none md:[&>a]:p-0 md:[&>a:hover]:bg-transparent md:[&>details>summary]:min-h-0 md:[&>details>summary]:p-0 ${desktopGap === "wide" ? "md:gap-x-5" : "md:gap-x-4"}`}>
      {children}
    </nav>
  </div>;
}
