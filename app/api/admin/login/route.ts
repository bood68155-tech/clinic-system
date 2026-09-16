import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { password } = await req.json();
  const pass = process.env.ADMIN_PASSWORD;

  if (pass && password === pass) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("clinic-admin", pass, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "كلمة السر غير صحيحة" }, { status: 401 });
}