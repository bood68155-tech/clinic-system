import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { data } = await supabase
    .from("invoices")
    .select("*, patients(id,name,phone)")
    .order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  if (!body.patient_id || !body.amount) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      patient_id: body.patient_id,
      visit_id: body.visit_id || null,
      amount: body.amount,
      paid: body.paid ?? false,
      payment_method: body.payment_method || "نقدي",
      notes: body.notes || "",
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  if (!body.id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });
  const update: Record<string, unknown> = {};
  if (body.paid !== undefined) update.paid = body.paid;
  if (body.payment_method) update.payment_method = body.payment_method;
  const { error } = await supabase.from("invoices").update(update).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}