import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin(_req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = params;

  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single();
  if (!patient) return NextResponse.json({ error: "مريض غير موجود" }, { status: 404 });

  const { data: visits } = await supabase
    .from("visits")
    .select("*, doctors(id,name,specialty)")
    .eq("patient_id", id)
    .order("visit_date", { ascending: false });

  const visitIds = (visits || []).map((v: { id: string }) => v.id);

  let prescriptions: Record<string, unknown>[] = [];
  if (visitIds.length) {
    const { data } = await supabase
      .from("prescriptions")
      .select("*")
      .in("visit_id", visitIds);
    prescriptions = data || [];
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, date, time, status, reason")
    .eq("patient_id", id)
    .order("date", { ascending: false });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  const visitsWithRx = (visits || []).map((v: { id: string; [k: string]: unknown }) => ({
    ...v,
    prescriptions: prescriptions.filter((p: { visit_id: string }) => p.visit_id === v.id),
  }));

  return NextResponse.json({ patient, visits: visitsWithRx, appointments, invoices });
}