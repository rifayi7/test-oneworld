import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readSession, ADMIN_COOKIE } from "@/lib/admin-auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin routes
  if (pathname.startsWith("/admin")) {
    // Let login route through without auth checks
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_COOKIE)?.value;
    const userId = await readSession(sessionCookie);

    // If session is invalid, redirect to admin login page
    if (!userId) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Limit middleware trigger paths
export const config = {
  matcher: ["/admin/:path*"],
};
