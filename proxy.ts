import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Locale segments that get their own `<html lang>` value. Everything else
// (including the unprefixed English routes) falls back to "en" — see
// app/layout.tsx, which reads this header to set the root `<html>` tag.
const LOCALE_SEGMENTS = new Set(["es", "pt", "tr", "id", "de"]);

export function proxy(request: NextRequest) {
  const firstSegment = request.nextUrl.pathname.split("/")[1];
  const locale = LOCALE_SEGMENTS.has(firstSegment) ? firstSegment : "en";

  const headers = new Headers(request.headers);
  headers.set("x-html-lang", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
};
