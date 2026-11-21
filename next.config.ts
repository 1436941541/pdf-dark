import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import {
  isPulseSourceMapsEnabled,
  withPulseSourceMaps,
} from "@yj-pulse/error-sdk/next-config";

const pulseSourceMapsEnabled = isPulseSourceMapsEnabled();

const nextConfig: NextConfig = {
  // 2026-11-21: moved from Vercel to a Cloudflare Worker (static export in out/).
  // Security headers live in public/_headers + worker/index.ts, and all 301
  // legacy redirects + localized <html lang> + Pulse crawler reporting live in
  // worker/index.ts.
  output: "export",
  images: { unoptimized: true },
};

const sentryConfig = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    // Pulse wraps this hook last and removes maps after both uploads finish.
    ...(pulseSourceMapsEnabled ? { deleteSourcemapsAfterUpload: false } : {}),
  },
});

export default withPulseSourceMaps(sentryConfig, { enabled: pulseSourceMapsEnabled });
