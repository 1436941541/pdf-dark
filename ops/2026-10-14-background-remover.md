# PDF Background Remover — first implementation

URL `/pdf-background-remover`, English only. Primary keyword **pdf background remover**. Supporting intent: remove background from PDF, remove gray background from PDF, clean scanned PDF. Positioning: light scanned-paper gray/yellow tint and mild shading cleanup; not transparent output, watermark/subject removal or native PDF object deletion. Homepage/invert page copy unchanged; shared English navigation/footer gain one link and sitemap adds the route.

User previously authorized recording URL/keyword changes inside this checkout because local SecondBrain PAGES.md and project-console are unavailable. **Pending user-side sync after pulling:** add https://pdfdark.org/pdf-background-remover ↔ pdf background remover, independent scanned-paper cleanup tool, English. Do not merge existing B&W or deskew pages.

## Implementation

Independent pixel algorithm, not competitor code: brightest-pixel reference grid (max edge400), separable maximum filter removes dark strokes from the paper estimate, smooth/bilinear reference reconstruction, per-channel background normalization with continuous tones and foreground protection. Color guard compares relative channel differences against local/global paper reference, allowing yellow paper correction while keeping distinct blue/yellow marks in tested examples. Strength0 leaves appearance unchanged; dark-paper guard avoids treating dark-mode pages as light scans. Strength65 is conservative by default;100 is stronger. Color protection is not semantic segmentation and cannot guarantee every photo/highlight/handwriting survives. Estimated background errors and severe lighting need preview/manual exclusion.

PDF.js renders local pages; background processing runs in a cancellable module worker. Canvas export uses pdf-lib PNG pages, preserving displayed page dimensions and visual rotation. Sharper up to144DPI / Compact up to72DPI, bounded by16M canvas pixels/8192 edge. Output is flattened and can grow: selectable text/forms/links/bookmarks/signatures are not retained, including pages excluded from cleaning; no OCR. Loading/rendering/worker/export can be cancelled, old previews cannot replace newer settings/source, and sample loading uses generation guards. Sample actions reset strength/color/quality to match showcased default results. While a new sample is fetching, old downloads are locked; sample fetches can be cancelled, and a new sample aborts active exports immediately. Preview image frames have fixed heights to avoid jumping while images load or page aspect ratios change. No runtime dependency added.

## Validation

-24 Node tests passed:7 background tests plus existing monochrome/deskew17. Scoped ESLint and final production build/TypeScript passed.
- Three generated real PDF cases previewed and exported: gray+faint text, yellow+blue stamp+yellow highlight, mild gray gradient. After assets come from actual previews; comparisons render actual downloaded PDFs.
- At65%, sampled paper RGB: gray220/220/220→243/243/243; yellow236/225/188→248/245/232; shadow175/175/175→224/224/224. Blue stamp36/77/173 and highlight244/216/73 stayed unchanged in these samples.
- Five-page document checked mixed sizes, rotated photo page, blank page, individual page skip, cancellation/retry, compact output, invalid file, zero document POST and zero browser JS errors. Sizes600×780 (three pages),400×300,600×450 maintained.
- Production smoke: sample/reset behavior, delayed sample-fetch lock/cancel, mobile menu, widths320/390/768/1280, images/alt/dimensions/lazy, sitemap and incoming links from four English tools passed.
- SEO-page checklist applied with bundled HTML parser: English main content1065 words (skill1093 tokens); title55 chars, description158; primary in title/H1/description, self-canonical, no hreflang, no noindex, valid WebApplication, six dimensioned/lazy WebP case images, complete OG/Twitter metadata. No fabricated rating or FAQ/HowTo rich-result promises. Google ranks/GSC/field CWV not measured. Local production evidence does not mean live deployment.

## Artifacts

Research `/workspace/seo-research/background-remover/research.md`; cases/screenshots/exports `/workspace/pdf-dark-browser-tests/background/`; SEO evidence `/workspace/seo-tools/reports/pdf-background-remover/`. User-facing sample PDFs/images/social card retained under public/examples/background-remover.

Existing ignored dev type/route cache was corrupt; retained it as `.next/dev-stale-background-*` and generated fresh dev cache. No tracked Next configuration changed. First version is ready for review, **not pushed or deployed**.
