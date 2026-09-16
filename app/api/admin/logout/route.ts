import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"));
  res.cookies.set("clinic-admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}