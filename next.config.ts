import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/invert-pdf-colors",
        destination: "/blog/invert-pdf-colors",
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
