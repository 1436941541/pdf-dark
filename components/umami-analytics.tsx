"use client";

import Script from "next/script";
import { flushAnalyticsEvents } from "@/lib/analytics-events";

export function UmamiAnalytics({ src, websiteId }: { src: string; websiteId: string }) {
  return <Script src={src} data-website-id={websiteId} data-performance="true" strategy="afterInteractive" onReady={flushAnalyticsEvents} />;
}
