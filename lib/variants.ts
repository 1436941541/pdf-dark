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
    slug: "invert-pdf-colors",
    title: "Invert PDF Colors",
    blurb:
      "Flip a PDF to a dark background while keeping photos and charts in original color.",
  },
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
];
