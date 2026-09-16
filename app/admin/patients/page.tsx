import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PatientsPage() {
  const { data: patients } = await supabase
    .from("patients")
    .select("*")
    .order("created_at", { ascending: false });

  const patientIds = (patients || []).map((p) => p.id);
  const visitCounts: Record<string, number> = {};
  const invoiceTotals: Record<string, number> = {};

  if (patientIds.length) {
    const { data: visits } = await supabase
      .from("visits")
      .select("patient_id")
      .in("patient_id", patientIds);
    (visits || []).forEach((v: { patient_id: string }) => {
      visitCounts[v.patient_id] = (visitCounts[v.patient_id] || 0) + 1;
    });

    const { data: invoices } = await supabase
      .from("invoices")
      .select("patient_id, amount, paid")
      .in("patient_id", patientIds);
    (invoices || []).forEach((inv: { patient_id: string; amount: number; paid: boolean }) => {
      if (inv.paid) {
        invoiceTotals[inv.patient_id] = (invoiceTotals[inv.patient_id] || 0) + Number(inv.amount);
      }
    });
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">المرضى ({patients?.length || 0})</h2>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-white/10 text-white/50">
              <th className="pb-3 font-medium">الاسم</th>
              <th className="pb-3 font-medium">الهاتف</th>
              <th className="pb-3 font-medium">الزيارات</th>
              <th className="pb-3 font-medium">المدفوعات</th>
              <th className="pb-3 font-medium">السجل</th>
            </tr>
          </thead>
          <tbody>
            {(patients || []).map((p) => (
              <tr key={p.id} className="border-b border-white/5">
                <td className="py-3 text-white font-medium">{p.name}</td>
                <td className="py-3 text-white/70" dir="ltr">{p.phone}</td>
                <td className="py-3 text-clinic-accent">{visitCounts[p.id] || 0} زيارة</td>
                <td className="py-3 text-emerald-400">{(invoiceTotals[p.id] || 0).toLocaleString()} ر.س</td>
                <td className="py-3">
                  <Link href={`/admin/patients/${p.id}`} className="text-clinic-accent hover:underline text-xs">
                    عرض السجل
                  </Link>
                </td>
              </tr>
            ))}
            {!patients?.length && (
              <tr><td colSpan={5} className="py-6 text-center text-white/40">لا مرضى مسجلين</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}