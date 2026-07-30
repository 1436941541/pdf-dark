import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /blog/invert-pdf-colors was retired in June, then the "images keep
      // their colors" capability actually shipped (July 2026) and the topic
      // came back at a more specific slug — point the legacy links there.
      {
        source: "/invert-pdf-colors",
        destination: "/blog/invert-pdf-colors-without-inverting-images",
        permanent: true,
      },
      {
        source: "/blog/invert-pdf-colors",
        destination: "/blog/invert-pdf-colors-without-inverting-images",
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
      // The convert-pdf-to-dark-mode blog post was merged into /converter
      // (July 2026) — same H1, same target query, and the tool page is the
      // better answer. Both the legacy top-level URL and the blog URL land
      // there directly (no chains).
      {
        source: "/convert-pdf-to-dark-mode",
        destination: "/converter",
        permanent: true,
      },
      {
        source: "/blog/convert-pdf-to-dark-mode",
        destination: "/converter",
        permanent: true,
      },
      // Retargeted July 2026: SERP check showed "darken a pdf" / "darken
      // scanned pdf" mean "boost faded text for printing" — the opposite of
      // dark mode. Both posts moved to slugs matching their real topic
      // (neither URL was indexed yet).
      {
        source: "/blog/darken-scanned-pdf-online",
        destination: "/blog/scanned-pdf-dark-mode",
        permanent: true,
      },
      {
        source: "/blog/how-to-darken-a-pdf",
        destination: "/blog/how-to-put-a-pdf-in-dark-mode",
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
