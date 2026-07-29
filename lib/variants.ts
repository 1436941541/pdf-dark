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
    updatedAt: "2026-07-19",
  },
  {
    slug: "pdf-dark-mode-firefox",
    title: "PDF Dark Mode in Firefox",
    blurb:
      "Firefox's PDF.js viewer only darkens the toolbar, not the pages. Here's the real fix.",
    updatedAt: "2026-07-20",
  },
  {
    slug: "convert-pdf-to-dark-mode",
    title: "Convert PDF to Dark Mode",
    blurb:
      "Produce a permanent dark-themed PDF file you can email, sync, and reopen anywhere — not a one-off viewer trick.",
    updatedAt: "2026-07-26",
  },
  {
    slug: "how-to-darken-a-pdf",
    title: "How to Darken a PDF",
    blurb:
      "A three-step walkthrough: drop, pick a theme, download. No accounts, no extensions, no uploads.",
    updatedAt: "2026-07-22",
  },
  {
    slug: "darken-scanned-pdf-online",
    title: "Darken a Scanned PDF Online",
    blurb:
      "Free, browser-only tool for scanned PDFs that wash out your screen at night. Pick OLED for the deepest contrast.",
    updatedAt: "2026-07-23",
  },
  {
    slug: "invert-pdf-colors-without-inverting-images",
    title: "Invert PDF Colors, Keep Your Images",
    blurb:
      "Basic inverters turn photos into negatives. Here photos keep their colors — automatically, or under your control.",
    updatedAt: "2026-07-24",
  },
  {
    slug: "how-pdf-dark-mode-conversion-works",
    title: "How the Conversion Works",
    blurb:
      "Vector recoloring, image detection, and a per-page fallback chain — the engineering under the hood.",
    updatedAt: "2026-07-27",
  },
  {
    slug: "pdf-dark-mode-ipad",
    title: "PDF Dark Mode on iPad & iPhone",
    blurb:
      "iOS 26 finally added a Dark Background toggle for PDFs in Files and Books. Here's what it fixes — and what it still doesn't.",
    updatedAt: "2026-07-30",
  },
  {
    slug: "pdf-dark-mode-android",
    title: "PDF Dark Mode on Android",
    blurb:
      "Android's default PDF viewers still don't have a real dark mode, and screen-invert flips everything negative. Convert once, read dark anywhere.",
    updatedAt: "2026-07-31",
  },
  {
    slug: "sumatra-pdf-dark-mode",
    title: "PDF Dark Mode in Sumatra PDF",
    blurb:
      "Sumatra already has two built-in tricks — the i key and a settings.txt edit. Here's why they fall short, and what stays dark everywhere instead.",
    updatedAt: "2026-08-01",
  },
  {
    slug: "pdf-dark-mode-mac",
    title: "PDF Dark Mode on Mac",
    blurb:
      "macOS Tahoe added a dark toggle to Preview. It's Preview-only and needs the latest macOS — here's what actually travels with the file.",
    updatedAt: "2026-08-02",
  },
  {
    slug: "pdf-dark-mode-extension",
    title: "Do You Need a PDF Dark Mode Extension?",
    blurb:
      "They invert your images, need file-access permission enabled by hand, and ask for broad browsing access. Probably not — here's why.",
    updatedAt: "2026-08-04",
  },
  {
    slug: "pdf-dark-mode-adobe-acrobat",
    title: "PDF Dark Mode in Adobe Acrobat",
    blurb:
      "The 'Dark Gray' theme only skins the toolbar. The real page-darkening setting is buried in Accessibility preferences — and it's per-install, not per-file.",
    updatedAt: "2026-08-05",
  },
  {
    slug: "pdf-dark-mode-edge",
    title: "PDF Dark Mode in Microsoft Edge",
    blurb:
      "Edge's dark theme skips your PDFs entirely. There's a flags-page hack that forces it — at the cost of every image in the document.",
    updatedAt: "2026-08-08",
  },
  {
    slug: "pdf-reader-dark-mode-comparison",
    title: "PDF Readers with Dark Mode, Compared",
    blurb:
      "Acrobat, Foxit, Sumatra, Preview, Chrome, Edge, Firefox, mobile apps, extensions — which ones really darken the page, side by side.",
    updatedAt: "2026-08-11",
  },
];
