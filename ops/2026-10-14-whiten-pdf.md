# Whiten PDF positioning and URL migration

User authorized retargeting the scanned-paper tool to **whiten pdf** after supplying Google Ads volume ranges. Primary whiten pdf:1,000–10,000; related clean scanned pdf/pdf whitener/whiten pdf background/make pdf background white/remove yellow background from pdf:100–1,000. Geography was not confirmed; do not aggregate variants or assume low ad competition means easy organic ranking. Google SERP remained blocked by unusual-traffic verification; no dominant-intent claim.

New canonical URL **https://pdfdark.org/whiten-pdf**. H1/nav **Whiten PDF**, WebApplication/footer **PDF Whitener**. Supporting intent gray/yellow scan paper whitening and mild shading. Original `/pdf-background-remover` permanently redirects301 directly to new route, retaining query strings. It is removed from sitemap and internal tool links. No standalone background-removal page remains; do not reuse the permanently redirected URL without revisiting cached redirects.

User previously authorized local repo records because SecondBrain PAGES.md and project-console are inaccessible. **Pending user-side sync after pulling:** replace `/pdf-background-remover` ↔ pdf background remover with `/whiten-pdf` ↔ whiten pdf; note scan-paper whitening, English only, old URL301. This document supersedes earlier URL/keyword mappings in the background-remover implementation log.

Updated title/description, canonical, OG/Twitter, new social card, schema, H1, hero, FAQ, case headings/alt, navigation/footer/sitemap and output creator/file suffix. Static sample assets and internal algorithm filenames stay under their existing paths so saved assets remain valid. Actual processing and limitations unchanged: white image-based PDF, no transparency/native-object deletion/OCR. Homepage/invert content only uses updated shared navigation/footer, no body copy changes.

## Verification

Scoped ESLint and production build/TypeScript passed (46 routes, old route absent). Production browser checks passed for old URL301 + query retention, H1/title/meta/canonical/OG/schema, social asset200, mobile widths320/390/768/1280, sample processing and downloaded PDF creator/filename/page count, four incoming tool pages with no legacy links, and sitemap including only new URL. Existing dev route cache panicked on the moved route; verified against a freshly built standalone production copy instead of changing app behavior.
