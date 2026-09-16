import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

async function findOrCreatePatient(name: string, phone: string): Promise<string> {
  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("patients")
    .insert({ name, phone })
    .select("id")
    .single();
  return created!.id;
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patient_id");
  let q = supabase
    .from("visits")
    .select("*, patients(id,name,phone), doctors(id,name,specialty)")
    .order("visit_date", { ascending: false });
  if (patientId) q = q.eq("patient_id", patientId);
  const { data } = await q.limit(100);
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();

  let patientId = body.patient_id;
  if (!patientId && body.patient_name && body.patient_phone) {
    patientId = await findOrCreatePatient(body.patient_name, body.patient_phone);
  }
  if (!patientId || !body.visit_date) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const { data: visit, error: vErr } = await supabase
    .from("visits")
    .insert({
      patient_id: patientId,
      doctor_id: body.doctor_id || null,
      appointment_id: body.appointment_id || null,
      visit_date: body.visit_date,
      diagnosis: body.diagnosis || "",
      symptoms: body.symptoms || "",
      notes: body.notes || "",
      follow_up_date: body.follow_up_date || null,
    })
    .select()
    .single();
  if (vErr) return NextResponse.json({ error: vErr.message }, { status: 500 });

  if (body.prescriptions?.length) {
    const rows = body.prescriptions.map((p: Record<string, string>) => ({
      visit_id: visit.id,
      medication: p.medication,
      dosage: p.dosage || "",
      frequency: p.frequency || "",
      duration: p.duration || "",
      instructions: p.instructions || "",
    }));
    await supabase.from("prescriptions").insert(rows);
  }

  return NextResponse.json(visit);
}