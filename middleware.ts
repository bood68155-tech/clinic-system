import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pass = process.env.ADMIN_PASSWORD;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin") && path !== "/admin/login") {
    const cookie = req.cookies.get("clinic-admin")?.value;
    if (!pass || cookie !== pass) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};