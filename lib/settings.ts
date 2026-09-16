import { supabase } from "./supabase";

export type ClinicSettings = {
  clinic_name: string;
  clinic_phone: string;
  clinic_address: string;
  clinic_logo: string;
};

const DEFAULTS: ClinicSettings = {
  clinic_name: "عيادتي",
  clinic_phone: "",
  clinic_address: "",
  clinic_logo: "",
};

export async function getSettings(): Promise<ClinicSettings> {
  const { data } = await supabase
    .from("settings")
    .select("clinic_name, clinic_phone, clinic_address, clinic_logo")
    .maybeSingle();
  return { ...DEFAULTS, ...(data || {}) };
}