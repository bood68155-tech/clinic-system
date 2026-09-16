import { supabase } from "./supabase";

const WORK_START = parseInt(process.env.CLINIC_START_HOUR || "9", 10);
const WORK_END = parseInt(process.env.CLINIC_END_HOUR || "17", 10);
const SLOT_MINUTES = parseInt(process.env.SLOT_MINUTES || "30", 10);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function generateSlots(): string[] {
  const slots: string[] = [];
  for (let h = WORK_START; h < WORK_END; h++) {
    for (let m = 0; m < 60; m += SLOT_MINUTES) {
      slots.push(`${pad(h)}:${pad(m)}`);
    }
  }
  return slots;
}

export function isValidDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return !isNaN(d.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export async function getAvailableSlots(date: string): Promise<string[]> {
  if (!isValidDate(date)) return [];
  const { data } = await supabase
    .from("appointments")
    .select("time")
    .eq("date", date)
    .neq("status", "cancelled");

  const booked = new Set((data || []).map((r) => String(r.time).slice(0, 5)));
  return generateSlots().filter((s) => !booked.has(s));
}