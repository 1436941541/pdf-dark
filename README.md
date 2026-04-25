# 🌙 PDF Dark

> Convert any PDF to dark mode — entirely in your browser. No upload, no signup, free.

**Live:** [pdfdark.org](https://pdfdark.org)

PDF Dark turns any PDF into a dark-themed downloadable file. The entire conversion runs in your browser via PDF.js and a Web Worker — your file never touches a server. A saturation-based algorithm preserves photos and charts in their original colors while darkening the rest.

## Why this exists

Reading long PDFs at night meant either staring at a bright white page or uploading sensitive documents (research papers, contracts, medical records) to "PDF dark mode" services I didn't fully trust. The "invert colors" toggles in existing tools also wreck photos and charts — turning portraits into negatives and graphs into noise.

So PDF Dark was built around two non-negotiable defaults:

1. **Nothing leaves your browser.** Verify it yourself in DevTools → Network.
2. **Images keep their original colors.** Only text and UI elements get themed.

## Features

- **100% browser-side** — file processed via File API + Web Worker + OffscreenCanvas
- **Image preservation** — saturation classifier keeps photos and charts in original colors
- **Real PDF output** — image-based PDF, opens dark in any reader (Kindle, iPad, Acrobat, Preview)
- **4 dark themes** — pick your preferred contrast
- **No signup, no tracking** — Sentry runs only on errors, with full content masking
- **Mobile support** — works on iOS Safari and Android Chrome
- **Free** — and intends to stay that way

## How it works

```
Drop PDF
  → PDF.js parses each page to canvas
  → Web Worker classifies pixels by saturation
       ├─ saturated pixels (images, charts)  → preserved
       └─ low-saturation pixels (text, UI)   → inverted / themed
  → pdf-lib stitches a new PDF
  → User downloads
```

The saturation classifier runs on `OffscreenCanvas` inside a Web Worker, so the UI thread never blocks even on large PDFs.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [PDF.js](https://github.com/mozilla/pdf.js) — Mozilla's open-source PDF parser
- [pdf-lib](https://github.com/Hopding/pdf-lib) — for assembling the dark output
- [Tailwind CSS 4](https://tailwindcss.com)
- [Sentry](https://sentry.io) — errors only, with `maskAllText` / `maskAllInputs` / `blockAllMedia`
- Hosted on [Vercel](https://vercel.com)

## Privacy

Your PDF never leaves your browser. The conversion uses only:

- File API (local file read)
- Web Worker (off-main-thread processing)
- OffscreenCanvas (per-pixel manipulation)
- Blob + `URL.createObjectURL()` (download trigger)

Verify yourself: open DevTools → Network → drop a PDF. **No upload requests appear.**

Error monitoring via Sentry runs only when something breaks. Session replays mask all text, inputs, and media — so error reports show structure but never content.

See [Privacy](https://pdfdark.org/privacy) for the full policy.

## Local development

```bash
git clone https://github.com/1436941541/pdf-dark.git
cd pdf-dark
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To enable Sentry locally, copy `.env.local.example` to `.env.local` and add your DSN.

## Project structure

```
app/
  page.tsx                       Landing page
  invert-pdf-colors/             SEO variant: image preservation angle
  pdf-dark-mode-chrome/          SEO variant: Chrome users
  pdf-dark-mode-firefox/         SEO variant: Firefox users
  convert-pdf-to-dark-mode/      SEO variant: permanent file vs viewer
  about/, privacy/, terms/       Legal / about
  sitemap.ts, robots.ts          SEO infrastructure
components/
  drop-zone.tsx                  File input + drag-and-drop
  converter.tsx                  Main client orchestrator
  pdf-viewer.tsx                 Render + dark pass + download
lib/
  darkify.ts                     Saturation classifier (core algorithm)
  variants.ts                    SEO variant metadata
  site.ts                        Canonical URL helper
```

## Contributing

Issues and PRs welcome — especially:

- Edge cases that break the algorithm (weird embedded fonts, scanned PDFs)
- New theme presets
- Performance improvements for large PDFs (>50 MB)

For substantial features, please open an issue first to discuss the approach.

## License

[MIT](LICENSE)

## Contact

hello@pdfdark.org
