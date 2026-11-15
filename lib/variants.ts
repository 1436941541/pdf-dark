/**
 * Registry of variant landing pages. Add a line here to create a new variant
 * — sitemap, home page "More tools" section, and cross-links pick it up
 * automatically.
 */
export type Variant = {
  slug: string;
  title: string;
  blurb: string;
  /** Last real content change, YYYY-MM-DD — feeds sitemap lastModified. Bump
   *  when the post's content actually changes — and keep the dates DISTINCT
   *  across posts (a wall of identical dates reads as batch-generated). */
  updatedAt: string;
};

export const VARIANTS: Variant[] = [
  {
    slug: "pdf-dark-mode-chrome",
    title: "PDF Dark Mode in Chrome",
    blurb:
      "Chrome's built-in PDF viewer has no dark toggle. Skip the extensions — convert in the browser itself.",
    updatedAt: "2026-07-30",
  },
  {
    slug: "how-to-put-a-pdf-in-dark-mode",
    title: "How to Put a PDF in Dark Mode",
    blurb:
      "A three-step walkthrough: drop, pick a theme, download. No accounts, no extensions, no uploads.",
    updatedAt: "2026-07-30",
  },
  {
    slug: "scanned-pdf-dark-mode",
    title: "Scanned PDF Dark Mode",
    blurb:
      "Free, browser-only tool for scanned PDFs that wash out your screen at night. Pick OLED for the deepest contrast.",
    updatedAt: "2026-07-30",
  },
  {
    slug: "how-pdf-dark-mode-conversion-works",
    title: "How the Conversion Works",
    blurb:
      "Vector recoloring, image detection, and a per-page fallback chain — the engineering under the hood.",
    updatedAt: "2026-07-30",
  },
  {
    slug: "pdf-reader-dark-mode-comparison",
    title: "PDF Readers with Dark Mode, Compared",
    blurb:
      "Acrobat, Foxit, Sumatra, Preview, Chrome, Edge, Firefox, mobile apps, extensions — which ones really darken the page, side by side.",
    updatedAt: "2026-07-30",
  },
];
