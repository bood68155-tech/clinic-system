import { supabase } from "./supabase";
import { getAvailableSlots, isValidDate } from "./availability";

export async function bookAppointment({
  date,
  time,
  name,
  phone,
  reason = "",
}: {
  date: string;
  time: string;
  name: string;
  phone: string;
  reason?: string;
}) {
  if (!isValidDate(date) || !time || !name?.trim() || !phone?.trim()) {
    return { error: "البيانات غير مكتملة" };
  }

  const available = await getAvailableSlots(date);
  if (!available.includes(time)) {
    return { error: "هذا الموعد غير متاح، رجاءً اختيار موعد آخر" };
  }

  const { data: existing } = await supabase
    .from("patients")
    .select("id")
    .eq("phone", phone.trim())
    .maybeSingle();

  let patientId = existing?.id as string | undefined;
  if (!patientId) {
    const { data: newPatient, error: patError } = await supabase
      .from("patients")
      .insert({ name: name.trim(), phone: phone.trim(), notes: reason.trim() })
      .select("id")
      .single();
    if (patError || !newPatient) return { error: "تعذر حفظ بيانات المريض" };
    patientId = newPatient.id;
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert({ patient_id: patientId, date, time, reason: reason.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "هذا الموعد تم حجزه للتو من شخص آخر" };
    }
    return { error: "حدث خطأ أثناء الحجز" };
  }

  return { appointment: data };
}