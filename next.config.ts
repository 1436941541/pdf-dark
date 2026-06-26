import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /blog/invert-pdf-colors was retired — its content overlapped almost
      // entirely with /blog/convert-pdf-to-dark-mode once the "preserves
      // image color" differentiator was dropped. The legacy short link folds
      // through to the same destination.
      {
        source: "/invert-pdf-colors",
        destination: "/blog/convert-pdf-to-dark-mode",
        permanent: true,
      },
      {
        source: "/blog/invert-pdf-colors",
        destination: "/blog/convert-pdf-to-dark-mode",
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
