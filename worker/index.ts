import { observeCrawlerRequest } from "./crawler-observations";
import redirects from "./redirects.json";

type Env = {
  [key: string]: unknown;
  ASSETS: { fetch(request: Request): Promise<Response> };
};
type Context = { waitUntil(promise: Promise<unknown>): void };

declare class HTMLRewriter {
  on(selector: string, handlers: { element?(element: { setAttribute(name: string, value: string): void }): void }): HTMLRewriter;
  transform(response: Response): Response;
}

const REDIRECTS: Record<string, string> = redirects;
const LOCALE_SEGMENTS = new Set(["es", "pt", "de"]);

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, "") || "/";
}

function redirectTarget(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  return REDIRECTS[normalized] ?? REDIRECTS[pathname] ?? null;
}

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  if (!headers.has("Content-Security-Policy")) {
    headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  }
  if (!headers.has("X-Frame-Options")) {
    headers.set("X-Frame-Options", "SAMEORIGIN");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const worker = {
  async fetch(request: Request & { cf?: unknown }, env: Env, ctx: Context): Promise<Response> {
    const url = new URL(request.url);

    // Canonicalize www.pdfdark.org -> pdfdark.org with a single 301.
    if (url.hostname === "www.pdfdark.org") {
      url.hostname = "pdfdark.org";
      return Response.redirect(url.toString(), 301);
    }

    const target = redirectTarget(url.pathname);
    if (target) {
      const dest = new URL(target, url.origin);
      dest.search = url.search;
      return Response.redirect(dest.toString(), 301);
    }

    let response = await env.ASSETS.fetch(request);
    const contentType = response.headers.get("content-type") ?? "";

    // Rewrite <html lang="en"> on localized static HTML routes.
    const firstSegment = url.pathname.split("/")[1];
    if (
      LOCALE_SEGMENTS.has(firstSegment) &&
      /^text\/html(?:;|$)/i.test(contentType)
    ) {
      response = new HTMLRewriter()
        .on("html", {
          element(el) {
            el.setAttribute("lang", firstSegment);
          },
        })
        .transform(response);
    }

    response = withSecurityHeaders(response);
    observeCrawlerRequest(
      request,
      response,
      ctx,
      env as Record<string, string | undefined>,
    );
    return response;
  },
};

export default worker;
