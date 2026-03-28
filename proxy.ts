// proxy.ts
// MUST be named proxy.ts in Next.js 16
// In older versions this was middleware.ts — that no longer works

import { NextRequest, NextResponse } from "next/server";
// NextRequest  = information about the incoming request
//               has: cookies, headers, URL, method (GET/POST etc.)
// NextResponse = what we send back to the browser
//               can: redirect, block, or allow through

import { verifyAccessToken } from "@/lib/jwt";
// @/ = root of project (we set this in tsconfig.json paths)
// so @/lib/jwt = lib/jwt.ts at root

// THE PROXY FUNCTION
// Runs BEFORE every matched route loads
// Like a security guard at a door — checks your badge before letting you in
export function proxy(request: NextRequest) {
  // Try to read the access_token cookie from the request
  const token = request.cookies.get("access_token")?.value;
  // .cookies        = all cookies sent with this request
  // cleaner than parsing the cookie header manually
  // .get('access_token') = find the cookie named 'access_token'
  // ?.              = optional chaining — if cookie doesn't exist,
  //                   don't crash, just return undefined
  // .value          = the actual string value of the cookie

  // No token = not logged in
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
    // redirect = send the user to a different page
    // new URL('/login', request.url) = build the full URL to /login
    // we need request.url as base because URL() needs a complete address
  }

  try {
    // verify the token — THROWS if expired or tampered with
    const payload = verifyAccessToken(token);
    // if we reach this line, token is valid
    // payload = { userId, email, role, tokenVersion }

    // ROLE CHECK
    // is the user trying to access an admin page?
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // .pathname = just the path part of the URL
      // e.g., from "http://localhost:3000/admin/users"
      // .pathname = "/admin/users"
      // .startsWith('/admin') = true for /admin, /admin/users, /admin/settings

      if (payload.role !== "ADMIN") {
        // user is logged in but NOT an admin
        // send them to dashboard instead
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    // ATTACH USER INFO TO REQUEST HEADERS
    // so pages can know who the user is without
    // hitting the database again
    const requestHeaders = new Headers(request.headers);
    // create a copy of existing headers
    // we don't want to modify the original

    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-user-role", payload.role);
    requestHeaders.set("x-user-email", payload.email);
    // x- prefix = custom header convention
    // means "this is our own custom header, not a standard one"

    // everything checks out — let the request through
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // verifyAccessToken threw an error
    // means: token is expired OR was tampered with
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// CONFIG
// tells Next.js WHICH routes to run the proxy on
// without this, proxy runs on EVERY file including images, CSS, fonts
// that would slow everything down and cause weird bugs
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
  // '/dashboard/:path*' = match /dashboard AND everything after it
  // '/admin/:path*'     = match /admin AND everything after it
};
