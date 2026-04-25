/**
 * Single source of truth for the site's public URL. Order of preference:
 *   1. NEXT_PUBLIC_SITE_URL — user-set, wins everywhere
 *   2. VERCEL_PROJECT_PRODUCTION_URL — auto-set by Vercel on production branch
 *   3. VERCEL_URL — auto-set by Vercel on preview branches
 *   4. localhost fallback for dev
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);

  const prod = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (prod) return `https://${prod}`;

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3001";
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export const SITE_NAME = "PDF Dark";
export const SITE_TAGLINE = "Convert Any PDF to Dark Mode in Your Browser";
