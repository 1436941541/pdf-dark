// Next.js resolves opengraph-image per route segment and does not inherit the
// parent's, so without this file /es/invert-pdf-colors shipped no og:image at
// all. Reuse the English converter card — a localized one can replace this later.
export { default, alt, size, contentType } from "../../invert-pdf-colors/opengraph-image";
