/**
 * Registry of variant landing pages. Add a line here to create a new variant
 * — sitemap, home page "More tools" section, and cross-links pick it up
 * automatically.
 */
export type Variant = {
  slug: string;
  title: string;
  blurb: string;
};

export const VARIANTS: Variant[] = [
  {
    slug: "pdf-dark-mode-chrome",
    title: "PDF Dark Mode in Chrome",
    blurb:
      "Chrome's built-in PDF viewer has no dark toggle. Skip the extensions — convert in the browser itself.",
  },
  {
    slug: "pdf-dark-mode-firefox",
    title: "PDF Dark Mode in Firefox",
    blurb:
      "Firefox's PDF.js viewer only darkens the toolbar, not the pages. Here's the real fix.",
  },
  {
    slug: "convert-pdf-to-dark-mode",
    title: "Convert PDF to Dark Mode",
    blurb:
      "Produce a permanent dark-themed PDF file you can email, sync, and reopen anywhere — not a one-off viewer trick.",
  },
  {
    slug: "how-to-darken-a-pdf",
    title: "How to Darken a PDF",
    blurb:
      "A three-step walkthrough: drop, pick a theme, download. No accounts, no extensions, no uploads.",
  },
  {
    slug: "darken-scanned-pdf-online",
    title: "Darken a Scanned PDF Online",
    blurb:
      "Free, browser-only tool for scanned PDFs that wash out your screen at night. Pick OLED for the deepest contrast.",
  },
];
