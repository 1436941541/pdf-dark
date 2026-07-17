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
    updatedAt: "2026-07-08",
  },
  {
    slug: "pdf-dark-mode-firefox",
    title: "PDF Dark Mode in Firefox",
    blurb:
      "Firefox's PDF.js viewer only darkens the toolbar, not the pages. Here's the real fix.",
    updatedAt: "2026-07-10",
  },
  {
    slug: "convert-pdf-to-dark-mode",
    title: "Convert PDF to Dark Mode",
    blurb:
      "Produce a permanent dark-themed PDF file you can email, sync, and reopen anywhere — not a one-off viewer trick.",
    updatedAt: "2026-07-16",
  },
  {
    slug: "how-to-darken-a-pdf",
    title: "How to Darken a PDF",
    blurb:
      "A three-step walkthrough: drop, pick a theme, download. No accounts, no extensions, no uploads.",
    updatedAt: "2026-07-12",
  },
  {
    slug: "darken-scanned-pdf-online",
    title: "Darken a Scanned PDF Online",
    blurb:
      "Free, browser-only tool for scanned PDFs that wash out your screen at night. Pick OLED for the deepest contrast.",
    updatedAt: "2026-07-14",
  },
  {
    slug: "invert-pdf-colors-without-inverting-images",
    title: "Invert PDF Colors, Keep Your Images",
    blurb:
      "Basic inverters turn photos into negatives. Here photos keep their colors — automatically, or under your control.",
    updatedAt: "2026-07-15",
  },
  {
    slug: "how-pdf-dark-mode-conversion-works",
    title: "How the Conversion Works",
    blurb:
      "Vector recoloring, image detection, and a per-page fallback chain — the engineering under the hood.",
    updatedAt: "2026-07-17",
  },
];
