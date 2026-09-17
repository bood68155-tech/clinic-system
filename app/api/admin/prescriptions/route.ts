import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient_id");
  if (!patientId) return NextResponse.json({ error: "patient_id مطلوب" }, { status: 400 });

  const { data, error } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();

  const patientId = String(body.patient_id || "");
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!patientId || lines.length === 0) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const rows = lines.map((line: Record<string, unknown>) => ({
    patient_id: patientId,
    visit_id: null,
    doctor_id: line.doctor_id || body.doctor_id || null,
    medication: String(line.medication || "").trim(),
    dosage: String(line.dosage || ""),
    frequency: String(line.frequency || ""),
    duration: String(line.duration || ""),
    instructions: String(line.instructions || ""),
  }));

  const clean = rows.filter((r: { medication: string }) => r.medication);
  if (clean.length === 0) {
    return NextResponse.json({ error: "لا توجد أدوية صالحة" }, { status: 400 });
  }

  const { data, error } = await supabase.from("prescriptions").insert(clean).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inserted: data?.length || 0, rows: data || [] });
}
