import { createHash, createHmac, randomUUID } from "node:crypto";
import { isIP } from "node:net";
import { VARIANTS } from "./variants";

// Server-only. The independent collector must never receive PDF data or URL queries.
const PUBLIC_PATHS = new Set([
  "/", "/invert-pdf-colors", "/pdf-to-black-and-white", "/deskew-pdf", "/whiten-pdf",
  "/about", "/privacy", "/terms", "/changelog", "/blog",
  ...["es", "pt", "de"].flatMap(locale => [`/${locale}`, `/${locale}/invert-pdf-colors`]),
  ...VARIANTS.map(variant => `/blog/${variant.slug}`),
]);
const BOT_CANDIDATE = /bot\b|crawler|spider|slurp|Google-InspectionTool|ChatGPT-User|Claude-User|Perplexity-User|facebookexternalhit|WhatsApp|HeadlessChrome/i;
const TIMEOUT_MS = 1500;
const MAX_IN_FLIGHT = 8;
let inFlight = 0;
let budgetMinute = -1;
let budgetUsed = 0;

type Environment = Record<string, string | undefined>;
type ObservationRequest = { url: string; method: string; headers: Headers };
type Configuration = { endpoint: string; keyId: string; secret: string; hosts: Set<string> };
export type CrawlerObservation = {
  version: 1;
  eventId: string;
  occurredAt: string;
  hostname: string;
  path: string;
  method: "GET" | "HEAD";
  resourceType: "html" | "robots" | "sitemap";
  userAgent: string;
  sourceIp: string | null;
};

function configuration(env: Environment): Configuration | null {
  if (env.CRAWLER_COLLECTION_ENABLED !== "true") return null;
  if (!/^[0-9a-f-]{36}$/i.test(env.CRAWLER_KEY_ID ?? "") || !/^[0-9a-f]{64}$/i.test(env.CRAWLER_SIGNING_SECRET ?? "")) return null;
  try {
    const endpoint = new URL(env.CRAWLER_INGEST_URL ?? "");
    // Local HTTP is only for isolated development. Never forward secrets via redirects.
    const local = env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(endpoint.hostname);
    if ((endpoint.protocol !== "https:" && !local) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return null;
    const hosts = new Set((env.CRAWLER_ALLOWED_HOSTS ?? "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean));
    if (!hosts.size) return null;
    return { endpoint: endpoint.href, keyId: env.CRAWLER_KEY_ID!, secret: env.CRAWLER_SIGNING_SECRET!, hosts };
  } catch { return null; }
}

export function createCrawlerObservation(request: ObservationRequest, env: Environment, now = Date.now()): CrawlerObservation | null {
  const config = configuration(env);
  if (!config || (request.method !== "GET" && request.method !== "HEAD")) return null;
  const url = new URL(request.url);
  if (!config.hosts.has(url.hostname.toLowerCase())) return null;
  const headers = request.headers;
  const userAgent = (headers.get("user-agent") ?? "").slice(0, 512);
  if (!BOT_CANDIDATE.test(userAgent) || /[\u0000-\u001f\u007f]/.test(userAgent)) return null;
  // Next can strip Flight headers and _rsc before Proxy. Browser fetch metadata
  // also fences real client navigations below; none of these skip locale handling.
  if (url.searchParams.has("_rsc") || headers.get("rsc") === "1" || headers.has("next-router-prefetch") ||
      /prefetch/i.test(`${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`) ||
      headers.has("x-nextjs-data") || /text\/x-component/i.test(headers.get("accept") ?? "")) return null;
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : "/";
  const resourceType = pathname === "/robots.txt" ? "robots" : pathname === "/sitemap.xml" ? "sitemap" : "html";
  if (resourceType === "html" && !PUBLIC_PATHS.has(pathname)) return null;
  const destination = headers.get("sec-fetch-dest");
  if (resourceType === "html" && destination && destination !== "document") return null;
  // Trust the Vercel-controlled header only on Vercel. Generic forwarded headers
  // from other deployments or browsers cannot establish a crawler identity.
  const forwarded = env.VERCEL === "1" ? headers.get("x-vercel-forwarded-for")?.trim() : null;
  const sourceIp = forwarded && isIP(forwarded) ? forwarded : null;
  return {
    version: 1, eventId: randomUUID(), occurredAt: new Date(now).toISOString(),
    hostname: url.hostname.toLowerCase(), path: pathname, method: request.method,
    resourceType, userAgent, sourceIp,
  };
}

export function signCrawlerObservation(rawSecret: string, timestamp: string, rawBody: string): string {
  // Protocol v1: collector decrypts this derived signing key; it remains a credential.
  const signingKey = createHash("sha256").update(rawSecret, "utf8").digest("hex");
  return createHmac("sha256", signingKey).update(`${timestamp}\n${rawBody}`, "utf8").digest("hex");
}

export async function sendCrawlerObservation(observation: CrawlerObservation, env: Environment, fetcher: typeof fetch = fetch): Promise<boolean> {
  const config = configuration(env);
  if (!config || inFlight >= MAX_IN_FLIGHT) return false;
  const minute = Math.floor(Date.now() / 60_000);
  if (budgetMinute !== minute) { budgetMinute = minute; budgetUsed = 0; }
  // Additional best-effort per-process ceiling. The collector enforces durable site caps.
  if (budgetUsed >= 60) return false;
  budgetUsed++;
  inFlight++;
  try {
    const rawBody = JSON.stringify(observation);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = signCrawlerObservation(config.secret, timestamp, rawBody);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetcher(config.endpoint, {
          method: "POST", redirect: "error", cache: "no-store",
          headers: { "content-type": "application/json", "x-crawler-key-id": config.keyId,
            "x-crawler-timestamp": timestamp, "x-crawler-signature": signature },
          body: rawBody, signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        // Cancel rather than buffer an arbitrary collector response body.
        await response.body?.cancel();
        if (response.ok) return true;
        if (response.status < 500 || attempt === 1) return false;
      } catch { if (attempt === 1) return false; }
    }
  } finally { inFlight--; }
  return false;
}

export function observeCrawlerRequest(request: ObservationRequest, event: { waitUntil(promise: Promise<unknown>): void }, env: Environment = process.env): void {
  try {
    const observation = createCrawlerObservation(request, env);
    if (observation) event.waitUntil(sendCrawlerObservation(observation, env).catch(() => false));
  } catch { /* Telemetry cannot change a page response or create a Sentry error. */ }
}
