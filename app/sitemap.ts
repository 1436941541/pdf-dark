import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { VARIANTS } from "@/lib/variants";

// Last real content change per static route, YYYY-MM-DD. Bump when that page's content actually changes.
const HOME_UPDATED_AT = "2026-07-09";
const ABOUT_UPDATED_AT = "2026-06-26";
const PRIVACY_UPDATED_AT = "2026-06-19";
const TERMS_UPDATED_AT = "2026-04-28";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    {
      url: `${base}/`,
      lastModified: HOME_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...VARIANTS.map((v) => ({
      url: `${base}/blog/${v.slug}`,
      lastModified: v.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: `${base}/about`,
      lastModified: ABOUT_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/privacy`,
      lastModified: PRIVACY_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${base}/terms`,
      lastModified: TERMS_UPDATED_AT,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
