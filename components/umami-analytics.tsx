"use client";

import Script from "next/script";
import { flushAnalyticsEvents } from "@/lib/analytics-events";
import { flushPulseErrors, pulseTrackerSource } from "@/lib/pulse-error-monitoring";

export function UmamiAnalytics({ src, websiteId, errors = false, release = "" }: { src: string; websiteId: string; errors?: boolean; release?: string }) {
  return <Script src={pulseTrackerSource(src, errors)} data-website-id={websiteId} data-performance="true" data-errors={errors ? "true" : undefined}
    data-release={errors ? release : undefined} strategy="afterInteractive" onReady={() => { flushAnalyticsEvents(); flushPulseErrors(); }} />;
}
