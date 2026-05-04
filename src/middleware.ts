import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  const isAuthPage = path.startsWith("/auth");
  const isAdminRoute = path.startsWith("/admin");
  const isVendorRoute = path.startsWith("/vendor");
  const isProtectedRoute = ["/checkout", "/orders"].some((p) => path.startsWith(p));

  // Redirect to login if not authenticated
  if ((isAdminRoute || isVendorRoute || isProtectedRoute) && !token) {
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${path}`, req.url));
  }

  // RBAC: Admin routes
  if (isAdminRoute && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
  }

  // RBAC: Vendor routes
  if (isVendorRoute && token?.role !== "VENDOR" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/?error=unauthorized", req.url));
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/vendor/:path*",

    "/checkout/:path*",
    "/orders/:path*",
    "/auth/:path*",
  ],
};
