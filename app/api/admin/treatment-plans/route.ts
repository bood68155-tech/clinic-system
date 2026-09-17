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

  let query = supabase.from("treatment_plans").select("*").order("created_at", { ascending: false });
  if (patientId) query = query.eq("patient_id", patientId);

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();

  const patientId = String(body.patient_id || "");
  if (!patientId) return NextResponse.json({ error: "patient_id مطلوب" }, { status: 400 });

  const payload = {
    patient_id: patientId,
    title: String(body.title || ""),
    status: String(body.status || "draft"),
    items: Array.isArray(body.items) ? body.items : [],
    discount: Number(body.discount) || 0,
    down_payment: Number(body.down_payment) || 0,
    installments: Math.max(1, Math.floor(Number(body.installments) || 1)),
    start_date: body.start_date || new Date().toISOString().slice(0, 10),
    paid_installments: Array.isArray(body.paid_installments) ? body.paid_installments : [],
    notes: String(body.notes || ""),
    updated_at: new Date().toISOString(),
  };

  const id = body.id ? String(body.id) : "";
  const query = id
    ? supabase.from("treatment_plans").update(payload).eq("id", id)
    : supabase.from("treatment_plans").insert({ ...payload, ...(id ? { id } : {}) });

  const { data, error } = await query.select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });

  const { error } = await supabase.from("treatment_plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
