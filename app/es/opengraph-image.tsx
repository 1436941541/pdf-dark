// Next.js resolves opengraph-image per route segment and does not inherit the
// parent's, so without this file /es shipped no og:image at all. Reuse the
// English card for now — a localized one can replace this later.
export { default, alt, size, contentType } from "../opengraph-image";
