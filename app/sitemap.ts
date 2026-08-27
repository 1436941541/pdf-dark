import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { VARIANTS } from "@/lib/variants";
import { CHANGELOG_UPDATED_AT } from "@/lib/changelog";

// Last real content change per static route, YYYY-MM-DD. Bump when that page's content actually changes.
const HOME_UPDATED_AT = "2026-07-29";
const INVERT_UPDATED_AT = "2026-08-10";
const ABOUT_UPDATED_AT = "2026-06-26";
const PRIVACY_UPDATED_AT = "2026-07-25";
const TERMS_UPDATED_AT = "2026-07-21";
const ES_HOME_UPDATED_AT = "2026-08-27";
const ES_INVERT_UPDATED_AT = "2026-08-27";
const PT_HOME_UPDATED_AT = "2026-08-27";
const PT_INVERT_UPDATED_AT = "2026-08-27";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  return [
    {
      url: `${base}/`,
      lastModified: HOME_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/invert-pdf-colors`,
      lastModified: INVERT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${base}/es`,
      lastModified: ES_HOME_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/es/invert-pdf-colors`,
      lastModified: ES_INVERT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/pt`,
      lastModified: PT_HOME_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/pt/invert-pdf-colors`,
      lastModified: PT_INVERT_UPDATED_AT,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/blog`,
      // The index re-renders whenever any post changes — track the newest one.
      lastModified: VARIANTS.map((v) => v.updatedAt).sort().at(-1),
      changeFrequency: "weekly",
      priority: 0.6,
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
      url: `${base}/changelog`,
      // Driven by the newest entry in lib/changelog.ts — no manual bumping.
      lastModified: CHANGELOG_UPDATED_AT,
      changeFrequency: "weekly",
      priority: 0.4,
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
