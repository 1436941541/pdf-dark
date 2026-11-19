/**
 * Registry of variant landing pages. Add a line here to create a new variant
 * and sitemap, home page blog links, and cross-links pick it up automatically.
 */
export type Variant = {
  slug: string;
  title: string;
  blurb: string;
  /** Last real content change, YYYY-MM-DD, feeding sitemap lastModified. Bump
   *  when the post's content changes, keeping dates distinct across posts. */
  updatedAt: string;
};

export const VARIANTS: Variant[] = [
  {
    slug: "pdf-dark-mode-chrome",
    title: "PDF Dark Mode in Chrome (5 Ways Tested)",
    blurb:
      "Compare 5 Chrome methods side by side, fix local file:// extension blocks, or darken PDFs in a tab with photos intact.",
    updatedAt: "2026-11-19",
  },
  {
    slug: "how-to-put-a-pdf-in-dark-mode",
    title: "How to Put a PDF in Dark Mode",
    blurb:
      "Save a permanently darkened PDF in your browser, or find the exact built-in toggles in Acrobat, macOS 26+, and iOS 26+.",
    updatedAt: "2026-11-18",
  },
  {
    slug: "scanned-pdf-dark-mode",
    title: "Scanned PDF Dark Mode",
    blurb:
      "Darken aged, shadowed scans in your browser for night reading while keeping existing OCR search layers intact.",
    updatedAt: "2026-11-17",
  },
  {
    slug: "pdf-reader-dark-mode-comparison",
    title: "12 PDF Readers Tested for Dark Mode",
    blurb:
      "Side-by-side matrix across Acrobat, Foxit, Sumatra, PDFgear, Preview, Files, ReadEra, Zathura, Chrome, and Firefox.",
    updatedAt: "2026-11-16",
  },
  {
    slug: "how-pdf-dark-mode-conversion-works",
    title: "How PDF Dark Mode Conversion Works",
    blurb:
      "Content-stream recoloring, HSL hue preservation, operator-level photo boxes, invisible mode-3 text, and print recovery.",
    updatedAt: "2026-11-15",
  },
];
