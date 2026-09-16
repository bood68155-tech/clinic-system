import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const { data: patients } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
  const patientIds = (patients || []).map((p) => p.id);

  const visitCounts: Record<string, number> = {};
  const invoiceTotals: Record<string, number> = {};

  if (patientIds.length) {
    const { data: visits } = await supabase.from("visits").select("patient_id").in("patient_id", patientIds);
    (visits || []).forEach((v: { patient_id: string }) => { visitCounts[v.patient_id] = (visitCounts[v.patient_id] || 0) + 1; });

    const { data: invoices } = await supabase.from("invoices").select("patient_id, amount, paid").in("patient_id", patientIds);
    (invoices || []).forEach((inv: { patient_id: string; amount: number; paid: boolean }) => {
      if (inv.paid) invoiceTotals[inv.patient_id] = (invoiceTotals[inv.patient_id] || 0) + Number(inv.amount);
    });
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="section-title">Patients ({patients?.length || 0})</h2>
      </div>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-c-border bg-c-surface text-[10px] uppercase tracking-[0.2em] text-c-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Visits</th>
              <th className="px-4 py-3 font-medium">Payments</th>
              <th className="px-4 py-3 font-medium">Record</th>
            </tr>
          </thead>
          <tbody>
            {(patients || []).map((p) => (
              <tr key={p.id} className="border-b border-c-border/50 transition-colors hover:bg-c-surface/50">
                <td className="px-4 py-3 font-bold text-c-white">{p.name}</td>
                <td className="px-4 py-3 text-c-muted" dir="ltr">{p.phone}</td>
                <td className="px-4 py-3 tag-accent !inline-block">{visitCounts[p.id] || 0}</td>
                <td className="px-4 py-3 text-c-success font-medium">{(invoiceTotals[p.id] || 0).toLocaleString()} SAR</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/patients/${p.id}`} className="text-xs uppercase tracking-wider text-c-accent hover:text-c-accentLight">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {!patients?.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-c-muted">No patients</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}