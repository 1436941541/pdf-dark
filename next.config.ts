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
      {
        source: "/convert-pdf-to-dark-mode",
        destination: "/blog/convert-pdf-to-dark-mode",
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
