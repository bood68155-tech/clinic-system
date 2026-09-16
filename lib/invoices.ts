import { supabase } from "./supabase";

export type Invoice = {
  id: string;
  patient_id: string;
  visit_id: string | null;
  amount: number;
  paid: boolean;
  payment_method: string;
  notes: string;
  created_at: string;
  patients?: { name: string; phone: string } | { name: string; phone: string }[] | null;
};

export async function createInvoice(data: {
  patient_id: string;
  visit_id?: string;
  amount: number;
  payment_method?: string;
  notes?: string;
}): Promise<{ invoice?: Invoice; error?: string }> {
  const { data: inv, error } = await supabase
    .from("invoices")
    .insert({
      patient_id: data.patient_id,
      visit_id: data.visit_id || null,
      amount: data.amount,
      payment_method: data.payment_method || "نقدي",
      notes: data.notes || "",
    })
    .select()
    .single();
  if (error) return { error: error.message };
  return { invoice: inv as Invoice };
}

export async function updateInvoicePayment(
  id: string,
  paid: boolean,
  method?: string
): Promise<{ error?: string }> {
  const update: Record<string, unknown> = { paid };
  if (method) update.payment_method = method;
  const { error } = await supabase.from("invoices").update(update).eq("id", id);
  return { error: error?.message };
}

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await supabase
    .from("invoices")
    .select("*, patients(name, phone)")
    .order("created_at", { ascending: false });
  return (data as Invoice[]) || [];
}

export async function getPatientInvoices(patientId: string): Promise<Invoice[]> {
  const { data } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", patientId)
    .order("created_at", { ascending: false });
  return (data as Invoice[]) || [];
}