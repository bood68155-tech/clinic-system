import { NextResponse } from "next/server";
import { bookAppointment } from "@/lib/booking";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  const result = await bookAppointment(body);

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ appointment: result.appointment }, { status: 201 });
}