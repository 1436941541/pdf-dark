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
