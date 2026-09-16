import { supabase } from "./supabase";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  phone: string;
  is_active: boolean;
};

export async function getDoctors(): Promise<Doctor[]> {
  const { data } = await supabase
    .from("doctors")
    .select("id, name, specialty, phone, is_active")
    .eq("is_active", true)
    .order("name");
  return (data as Doctor[]) || [];
}

export async function getDefaultDoctor(): Promise<Doctor | null> {
  const { data: settings } = await supabase
    .from("settings")
    .select("default_doctor_id")
    .maybeSingle();
  if (!settings?.default_doctor_id) {
    const docs = await getDoctors();
    return docs[0] || null;
  }
  const { data } = await supabase
    .from("doctors")
    .select("id, name, specialty, phone, is_active")
    .eq("id", settings.default_doctor_id)
    .maybeSingle();
  return (data as Doctor) || null;
}