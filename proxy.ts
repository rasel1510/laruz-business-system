import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const path = request.nextUrl.pathname;

  // Protect all routes except login page, API endpoints, uploadthing, static assets, and dev tools
  const isLoginPage = path.startsWith("/login");
  const isApi = path.startsWith("/api");
  const isNextStatic = path.startsWith("/_next") || path.includes(".");
  
  if (isApi || isNextStatic) {
    return NextResponse.next();
  }

  // Redirect to /login if not logged in
  if (!sessionCookie && !isLoginPage) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    // Prevent caching the redirect itself
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
  }

  // Redirect to / (dashboard) if already logged in and visiting /login
  if (sessionCookie && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.next();
  // Prevent browser caching of authenticated dashboard pages to secure back-button history navigation
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
