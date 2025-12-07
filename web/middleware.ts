import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const ADMIN_PREFIX = "/dashboard";
const CUSTOMER_PREFIX = "/customer";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("randevum_role")?.value;

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (role !== "admin") {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (pathname.startsWith(CUSTOMER_PREFIX)) {
    if (role !== "customer") {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/customer/:path*"],
};

