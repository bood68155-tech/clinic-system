import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { data } = await supabase
    .from("doctors")
    .select("*")
    .order("name");
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  if (!body.name) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  const { data, error } = await supabase
    .from("doctors")
    .insert({ name: body.name, specialty: body.specialty || "", phone: body.phone || "" })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });
  const { error } = await supabase.from("doctors").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}