import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function isAdmin(req: Request) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && (req.headers.get("cookie") || "").includes(`clinic-admin=${pass}`);
}

export async function GET(req: Request) {
  if (!isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("appointments")
    .select("id, date, time, reason, status, doctor_id, patients(name, phone)")
    .eq("date", today)
    .eq("status", "booked")
    .is("reminder_sent", false)
    .order("time");
  return NextResponse.json(data || []);
}