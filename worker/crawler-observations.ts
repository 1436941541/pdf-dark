// Server-only. The independent collector must never receive PDF data or URL queries.
const BOT_CANDIDATE = /bot\b|crawler|spider|fetcher\b|slurp|Google-InspectionTool|ChatGPT-User|Claude-User|Perplexity-User|facebookexternalhit|WhatsApp|HeadlessChrome/i;
const TIMEOUT_MS = 1500;
const MAX_IN_FLIGHT = 8;
let inFlight = 0;
let budgetMinute = -1;
let budgetUsed = 0;

type Environment = Record<string, string | undefined>;
type ObservationRequest = { url: string; method: string; headers: Headers; cf?: unknown };
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
  edgeBotCategory?: string;
};

function configuration(env: Environment): Configuration | null {
  if (env.CRAWLER_COLLECTION_ENABLED !== "true") return null;
  if (!/^[0-9a-f-]{36}$/i.test(env.CRAWLER_KEY_ID ?? "") || !/^[0-9a-f]{64}$/i.test(env.CRAWLER_SIGNING_SECRET ?? "")) return null;
  try {
    const endpoint = new URL(env.CRAWLER_INGEST_URL ?? "");
    // Local HTTP is only for isolated development. Never forward secrets via redirects.
    const local = env.CRAWLER_ALLOW_LOCAL_HTTP === "true" && ["localhost", "127.0.0.1"].includes(endpoint.hostname);
    if ((endpoint.protocol !== "https:" && !local) || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) return null;
    const hosts = new Set((env.CRAWLER_ALLOWED_HOSTS ?? "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean));
    if (!hosts.size) return null;
    return { endpoint: endpoint.href, keyId: env.CRAWLER_KEY_ID!, secret: env.CRAWLER_SIGNING_SECRET!, hosts };
  } catch { return null; }
}

function cloudflareBotCategory(cf: unknown): string | null {
  const value = (cf as { verifiedBotCategory?: unknown } | null | undefined)?.verifiedBotCategory;
  return typeof value === "string" && /^[A-Za-z0-9 &/(),.-]{1,64}$/.test(value) ? value : null;
}

export function createCrawlerObservation(request: ObservationRequest, response: Response, env: Environment, now = Date.now()): CrawlerObservation | null {
  const config = configuration(env);
  if (!config || !response.ok || (request.method !== "GET" && request.method !== "HEAD")) return null;
  const url = new URL(request.url);
  if (!config.hosts.has(url.hostname.toLowerCase())) return null;
  const headers = request.headers;
  const userAgent = (headers.get("user-agent") ?? "").slice(0, 512);
  if (!BOT_CANDIDATE.test(userAgent) || /[\u0000-\u001f\u007f]/.test(userAgent)) return null;
  if (url.searchParams.has("_rsc") || headers.get("rsc") === "1" || headers.has("next-router-prefetch") ||
      /prefetch/i.test(`${headers.get("purpose") ?? ""} ${headers.get("sec-purpose") ?? ""}`) ||
      headers.has("x-nextjs-data") || /text\/x-component/i.test(headers.get("accept") ?? "")) return null;
  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/$/, "") : "/";
  const resourceType = pathname === "/robots.txt" ? "robots" : pathname === "/sitemap.xml" ? "sitemap" : "html";
  if (resourceType === "html" && (
    !/^text\/html(?:;|$)/i.test(response.headers.get("content-type") ?? "") ||
    /^\/(?:404|_not-found|_next)(?:\/|$)/.test(pathname)
  )) return null;
  const destination = headers.get("sec-fetch-dest");
  if (resourceType === "html" && destination && destination !== "document") return null;
  const forwarded = request.cf ? headers.get("cf-connecting-ip")?.trim() : null;
  const sourceIp = forwarded && validSourceIp(forwarded) ? forwarded : null;
  const edgeBotCategory = request.cf ? cloudflareBotCategory(request.cf) : null;
  return {
    version: 1, eventId: crypto.randomUUID(), occurredAt: new Date(now).toISOString(),
    hostname: url.hostname.toLowerCase(), path: pathname, method: request.method,
    resourceType, userAgent, sourceIp,
    ...(edgeBotCategory ? { edgeBotCategory } : {}),
  };
}

function validSourceIp(value: string): boolean {
  if (value.length > 45 || /[\s%,\[\]\/]/.test(value)) return false;
  if (value.includes(":")) {
    try { return new URL(`http://[${value}]/`).hostname.startsWith("["); } catch { return false; }
  }
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(value) && value.split(".").every(part => Number(part) <= 255);
}

export async function signCrawlerObservation(rawSecret: string, timestamp: string, rawBody: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(rawSecret));
  const hex = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, "0")).join("");
  const key = await crypto.subtle.importKey("raw", encoder.encode(hex), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}\n${rawBody}`));
  return Array.from(new Uint8Array(signature), value => value.toString(16).padStart(2, "0")).join("");
}

export async function sendCrawlerObservation(observation: CrawlerObservation, env: Environment, fetcher: typeof fetch = fetch): Promise<boolean> {
  const config = configuration(env);
  if (!config || inFlight >= MAX_IN_FLIGHT) return false;
  const minute = Math.floor(Date.now() / 60_000);
  if (budgetMinute !== minute) { budgetMinute = minute; budgetUsed = 0; }
  if (budgetUsed >= 60) return false;
  budgetUsed++;
  inFlight++;
  try {
    const rawBody = JSON.stringify(observation);
    const timestamp = String(Math.floor(Date.now() / 1000));
    const signature = await signCrawlerObservation(config.secret, timestamp, rawBody);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetcher(config.endpoint, {
          method: "POST", redirect: "manual", cache: "no-store",
          headers: { "content-type": "application/json", "x-crawler-key-id": config.keyId,
            "x-crawler-timestamp": timestamp, "x-crawler-signature": signature },
          body: rawBody, signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        await response.body?.cancel();
        if (response.ok) return true;
        if (response.status < 500 || attempt === 1) return false;
      } catch { if (attempt === 1) return false; }
    }
  } finally { inFlight--; }
  return false;
}

export function observeCrawlerRequest(request: ObservationRequest, response: Response, event: { waitUntil(promise: Promise<unknown>): void }, env: Environment): void {
  try {
    const observation = createCrawlerObservation(request, response, env);
    if (observation) event.waitUntil(sendCrawlerObservation(observation, env).catch(() => false));
  } catch { /* Telemetry cannot change a page response or create a Sentry error. */ }
}
