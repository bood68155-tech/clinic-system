import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = req.headers.get("cookie") || "";
  const pass = process.env.ADMIN_PASSWORD;
  const authed = pass && token.includes(`clinic-admin=${pass}`);

  if (!authed) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id || !["booked", "completed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
  }

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "حدث خطأ في التحديث" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}