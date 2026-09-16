import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const token = req.headers.get("cookie") || "";
  const pass = process.env.ADMIN_PASSWORD;
  if (!pass || !token.includes(`clinic-admin=${pass}`)) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { clinic_name, clinic_phone, clinic_address, clinic_logo } = await req.json();

  const { error } = await supabase
    .from("settings")
    .update({
      clinic_name: String(clinic_name || "").trim(),
      clinic_phone: String(clinic_phone || "").trim(),
      clinic_address: String(clinic_address || "").trim(),
      clinic_logo: String(clinic_logo || "").trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", 1);

  if (error) {
    return NextResponse.json({ error: "حدث خطأ في الحفظ" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}