import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { STATUS_MAP, type ToothLogEntry, type ToothStatus } from "@/lib/dental";

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
    .from("tooth_records")
    .select("*")
    .eq("patient_id", patientId)
    .order("tooth_code");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  const patientId = String(body.patient_id || "");
  const toothCode = String(body.tooth_code || "");
  const status = String(body.status || "healthy") as ToothStatus;
  const note = String(body.note || "");

  if (!patientId || !toothCode) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }
  if (!STATUS_MAP[status]) {
    return NextResponse.json({ error: "حالة سن غير معروفة" }, { status: 400 });
  }

  const { data: existing } = await supabase
    .from("tooth_records")
    .select("history")
    .eq("patient_id", patientId)
    .eq("tooth_code", toothCode)
    .maybeSingle();

  const previous: ToothLogEntry[] = Array.isArray(existing?.history) ? (existing.history as ToothLogEntry[]) : [];
  const entry: ToothLogEntry = { status, note, at: new Date().toISOString() };
  const history = [entry, ...previous].slice(0, 20);

  const { data, error } = await supabase
    .from("tooth_records")
    .upsert(
      {
        patient_id: patientId,
        tooth_code: toothCode,
        status,
        note,
        history,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "patient_id,tooth_code" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient_id");
  const toothCode = searchParams.get("tooth_code");
  if (!patientId || !toothCode) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const { error } = await supabase
    .from("tooth_records")
    .delete()
    .eq("patient_id", patientId)
    .eq("tooth_code", toothCode);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
