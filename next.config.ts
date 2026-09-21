import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Autosurf/traffic-exchange sites (cashlee.co etc.) iframe the whole
          // site to farm "views", polluting analytics. Same-origin framing only.
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // August 2026: /converter and /invert-pdf-colors were the same tool —
      // drop a PDF, download the rewritten file — differing only in which
      // defaults they opened on. They are now one page at /invert-pdf-colors.
      //
      // Why that URL survived rather than /converter:
      //   · Both were "URL is unknown to Google" in Search Console, so the
      //     merge cost nothing either way.
      //   · Word volume: invert pdf (11K) + pdf inverter (5K) against
      //     convert pdf to dark mode (500).
      //   · SERP overlap: `convert pdf to dark mode` shares 58% of its
      //     results with `pdf dark mode`, which the homepage already targets
      //     — so /converter was competing with the homepage. `invert pdf
      //     colors` shares 0% with it, i.e. a genuinely separate need.
      //   · /invert-pdf-colors reached pos 7.2 in June before being retired.
      //
      // Every legacy URL below lands on the tool directly — no chains.
      {
        source: "/converter",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      {
        source: "/blog/invert-pdf-colors",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      {
        source: "/blog/invert-pdf-colors-without-inverting-images",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      {
        source: "/convert-pdf-to-dark-mode",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      {
        source: "/blog/convert-pdf-to-dark-mode",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      // September 2026: URLs that real sessions landed on but that 404'd.
      // Found by cross-checking GA4 landing pages against live HTTP status —
      // every entry below has recorded traffic, none is speculative.
      //
      // /convert and /invert are guesses: assistants citing the tool
      // sometimes shorten the path. The third is /invert-pdf-colors spelled
      // with U+2011 NON-BREAKING HYPHEN instead of U+002D — what a text
      // formatter produces when it decides the URL shouldn't wrap.
      //
      // That source has to be written percent-encoded: matching happens on
      // the raw pathname, so a literal "\u2011" in the source never fires
      // (verified both ways against a dev server).
      //
      // Deliberately NOT a catch-all 404 -> /invert-pdf-colors rule: that
      // would read as a soft 404 to Google, and would silently swallow real
      // broken links (random scanner paths already show up in GA4).
      {
        source: "/convert",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      {
        source: "/invert",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      {
        source: "/invert%E2%80%91pdf%E2%80%91colors",
        destination: "/invert-pdf-colors",
        permanent: true,
      },
      // Restores a redirect dropped in a007410 (2026-07-30). That call was
      // right on the evidence then — neither old slug was indexed. GA4 now
      // shows this URL still taking real direct traffic, so it earns its
      // entry back. Note the target is the retargeted post, not the tool:
      // sending a blog URL to the tool page would be its own soft 404.
      {
        source: "/blog/how-to-darken-a-pdf",
        destination: "/blog/how-to-put-a-pdf-in-dark-mode",
        permanent: true,
      },
      {
        source: "/pdf-dark-mode-chrome",
        destination: "/blog/pdf-dark-mode-chrome",
        permanent: true,
      },
      {
        source: "/pdf-dark-mode-firefox",
        destination: "/blog/pdf-dark-mode-firefox",
        permanent: true,
      },
      // September 2026: the Indonesian and Turkish locales are retired —
      // deliberately with no redirect. /id was indexed ("Submitted and indexed", last crawled
      // 2026-09-20) yet took zero impressions in 90 days, and the evidence
      // says it never could:
      //   · Autocomplete (hl=id&gl=ID) gives the Indonesian phrasings no
      //     query family at all — `pdf mode gelap` returns only itself,
      //     `pdf mode malam` and `pembaca pdf gelap` return nothing.
      //   · Indonesia does search this topic, but in English: all 24
      //     impressions from IDN in 90 days are English queries
      //     (`make pdf dark mode`, `dark mode pdf`, `darkmode pdf reader`),
      //     and they already land on / at position 5-9.
      // The market is real and already served by the English pages; only the
      // Indonesian-language duplicates were dead weight. They carried no
      // traffic and no inbound links, so a 404 is the honest signal — a
      // redirect would just claim equity that was never there.
      //
      // /tr and /tr/invert-pdf-colors go with them: never indexed at all,
      // zero impressions, and their primaries were never verified either.
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
});
