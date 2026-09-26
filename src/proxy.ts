import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/", "/login"];

function isWebhookPath(pathname: string): boolean {
  // /api/bots/[botId]/events — authenticated by HMAC signature (see that
  // route), not by a panel session, since it's called by the bots
  // themselves.
  return /^\/api\/bots\/[^/]+\/events$/.test(pathname);
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  const isPublic =
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/auth") ||
    isWebhookPath(pathname);

  if (isLoggedIn || isPublic) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/login", req.nextUrl.origin);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
});

export const config = {
  // Every route except static assets and metadata files — auth is
  // evaluated above rather than via matcher exclusions, so a new route is
  // protected by default instead of accidentally left open.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
