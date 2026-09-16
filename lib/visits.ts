import { supabase } from "./supabase";

export type Visit = {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  appointment_id: string | null;
  visit_date: string;
  diagnosis: string;
  symptoms: string;
  notes: string;
  follow_up_date: string | null;
  patients?: { id: string; name: string; phone: string } | { id: string; name: string; phone: string }[] | null;
  doctors?: { id: string; name: string; specialty: string } | { id: string; name: string; specialty: string }[] | null;
};

export type Prescription = {
  id: string;
  visit_id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
};

export async function createVisitWithPrescriptions(
  visit: {
    patient_id: string;
    doctor_id?: string;
    appointment_id?: string;
    visit_date: string;
    diagnosis: string;
    symptoms?: string;
    notes?: string;
    follow_up_date?: string;
  },
  prescriptions: {
    medication: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  }[]
): Promise<{ visit_id: string; error?: string }> {
  const { data: v, error: vErr } = await supabase
    .from("visits")
    .insert(visit)
    .select("id")
    .single();
  if (vErr || !v) return { visit_id: "", error: vErr?.message || "Failed to create visit" };

  if (prescriptions.length > 0) {
    const rows = prescriptions.map((p) => ({
      visit_id: v.id,
      medication: p.medication,
      dosage: p.dosage || "",
      frequency: p.frequency || "",
      duration: p.duration || "",
      instructions: p.instructions || "",
    }));
    const { error: pErr } = await supabase.from("prescriptions").insert(rows);
    if (pErr) return { visit_id: v.id, error: pErr?.message };
  }

  return { visit_id: v.id };
}

export async function getPatientVisits(patientId: string): Promise<Visit[]> {
  const { data } = await supabase
    .from("visits")
    .select("*, patients(id,name,phone), doctors(id,name,specialty)")
    .eq("patient_id", patientId)
    .order("visit_date", { ascending: false });
  return (data as Visit[]) || [];
}

export async function getVisitPrescriptions(visitId: string): Promise<Prescription[]> {
  const { data } = await supabase
    .from("prescriptions")
    .select("*")
    .eq("visit_id", visitId)
    .order("created_at");
  return (data as Prescription[]) || [];
}

export function formatPrescriptionText(
  clinicName: string,
  doctorName: string,
  patientName: string,
  diagnosis: string,
  prescriptions: Prescription[],
  followUp?: string
): string {
  let text = `🏥 ${clinicName}\n`;
  text += `👨‍⚕️ Dr. ${doctorName}\n`;
  text += `━━━━━━━━━━━━━━━━\n`;
  text += `📋 المريض: ${patientName}\n`;
  text += `🩺 التشخيص: ${diagnosis}\n`;
  text += `\n💊 الوصفة الطبية:\n`;
  text += `━━━━━━━━━━━━━━━━\n`;
  prescriptions.forEach((p, i) => {
    text += `\n${i + 1}. ${p.medication}\n`;
    if (p.dosage) text += `   📏 الجرعة: ${p.dosage}\n`;
    if (p.frequency) text += `   ⏰ التكرار: ${p.frequency}\n`;
    if (p.duration) text += `   📅 المدة: ${p.duration}\n`;
    if (p.instructions) text += `   💡 ملاحظات: ${p.instructions}\n`;
  });
  text += `\n━━━━━━━━━━━━━━━━\n`;
  if (followUp) text += `📅 الموعد القادم: ${followUp}\n`;
  text += `🔔 بانتظارك لزيارتنا مرة أخرى`;
  return text;
}