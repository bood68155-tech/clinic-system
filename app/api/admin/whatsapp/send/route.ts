import { NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/whatsapp";
import { normalizePhone, waLink } from "@/lib/whatsapp-client";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ ok: false, error: "غير مصرح" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const to = normalizePhone(String(body.to || ""));
  const message = String(body.message || "").trim();

  if (!message) {
    return NextResponse.json({ ok: false, error: "الرسالة فارغة" }, { status: 400 });
  }

  const link = waLink(to, message);
  if (!to) {
    return NextResponse.json({ ok: false, error: "رقم الهاتف غير صالح", waLink: link });
  }

  const result = await sendWhatsApp(to, message);
  return NextResponse.json({ ...result, waLink: link });
}
