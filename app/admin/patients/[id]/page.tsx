import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single();
  if (!patient) return <div className="text-white/40 text-center py-20">مريض غير موجود</div>;

  const { data: visits } = await supabase
    .from("visits")
    .select("*, doctors(name, specialty)")
    .eq("patient_id", id)
    .order("visit_date", { ascending: false });

  const visitIds = (visits || []).map((v) => v.id);

  let prescriptions: Record<string, unknown>[] = [];
  if (visitIds.length) {
    const { data } = await supabase.from("prescriptions").select("*").in("visit_id", visitIds);
    prescriptions = data || [];
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, date, time, status, reason")
    .eq("patient_id", id)
    .order("date", { ascending: false })
    .limit(20);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("patient_id", id)
    .order("created_at", { ascending: false });

  const totalPaid = (invoices || []).filter((i: { paid: boolean }) => i.paid).reduce((s: number, i: { amount: number }) => s + Number(i.amount), 0);
  const totalPending = (invoices || []).filter((i: { paid: boolean }) => !i.paid).reduce((s: number, i: { amount: number }) => s + Number(i.amount), 0);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
        <p className="text-white/50 mt-1">📞 {patient.phone} &nbsp;|&nbsp; سجل مسجل: {String(patient.created_at).slice(0, 10)}</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="card">
          <div className="text-sm text-white/50">الزيارات</div>
          <div className="text-3xl font-bold text-white mt-1">{visits?.length || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">المواعيد</div>
          <div className="text-3xl font-bold text-white mt-1">{appointments?.length || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">المدفوع</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{totalPaid.toLocaleString()} ر.س</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">معلق</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">{totalPending.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-white">الزيارات الطبية</h3>
        <div className="space-y-4">
          {(visits || []).map((v: { id: string; visit_date: string; diagnosis: string; symptoms: string; notes: string; follow_up_date: string | null; doctors?: { name: string; specialty: string } | { name: string; specialty: string }[] | null; prescriptions?: Record<string, unknown>[] }) => {
            const doc = Array.isArray(v.doctors) ? v.doctors[0] : v.doctors;
            const rx = v.prescriptions || [];
            return (
              <div key={v.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-clinic-accent font-semibold">{v.visit_date}</span>
                    {doc && <span className="text-white/40 text-sm">Dr. {doc.name}</span>}
                  </div>
                  {v.follow_up_date && (
                    <span className="text-amber-400 text-xs">متابعة: {v.follow_up_date}</span>
                  )}
                </div>
                {v.symptoms && <p className="text-white/60 text-sm mb-1">الأعراض: {v.symptoms}</p>}
                {v.diagnosis && <p className="text-white text-sm mb-1">التشخيص: {v.diagnosis}</p>}
                {v.notes && <p className="text-white/50 text-xs">ملاحظات: {v.notes}</p>}
                {rx.length > 0 && (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="text-white/40 text-xs mb-2">الوصفة الطبية:</p>
                    <div className="grid gap-1 md:grid-cols-2">
                      {rx.map((p: { medication?: string; dosage?: string; frequency?: string; duration?: string }, i: number) => (
                        <div key={i} className="text-sm bg-white/5 rounded p-2">
                          <span className="text-white font-medium">{p.medication || ""}</span>
                          {p.dosage ? <span className="text-white/50"> - {p.dosage}</span> : null}
                          {p.frequency ? <span className="text-white/40"> | {p.frequency}</span> : null}
                          {p.duration ? <span className="text-white/30"> | {p.duration}</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!(visits || []).length && <div className="card text-center text-white/40">لا زيارات مسجلة</div>}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-white">الفواتير</h3>
        <div className="card overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="pb-3 font-medium">التاريخ</th>
                <th className="pb-3 font-medium">المبلغ</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">طريقة الدفع</th>
                <th className="pb-3 font-medium">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map((inv: { id: string; amount: number; paid: boolean; payment_method: string; notes: string; created_at: string }) => (
                <tr key={inv.id} className="border-b border-white/5">
                  <td className="py-3 text-white/70">{String(inv.created_at).slice(0, 10)}</td>
                  <td className="py-3 font-semibold text-white">{Number(inv.amount).toLocaleString()} ر.س</td>
                  <td className="py-3">
                    <span className={inv.paid ? "text-emerald-400" : "text-amber-400"}>
                      {inv.paid ? "مدفوع" : "معلق"}
                    </span>
                  </td>
                  <td className="py-3 text-white/50">{inv.payment_method}</td>
                  <td className="py-3 text-white/40 text-xs">{inv.notes || "—"}</td>
                </tr>
              ))}
              {!(invoices || []).length && (
                <tr><td colSpan={5} className="py-4 text-center text-white/40">لا فواتير</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-white">آخر المواعيد</h3>
        <div className="card overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="pb-3 font-medium">التاريخ</th>
                <th className="pb-3 font-medium">الوقت</th>
                <th className="pb-3 font-medium">السبب</th>
                <th className="pb-3 font-medium">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {(appointments || []).map((a: { id: string; date: string; time: string; reason: string; status: string }) => (
                <tr key={a.id} className="border-b border-white/5">
                  <td className="py-3 text-white/70">{a.date}</td>
                  <td className="py-3 text-white">{a.time}</td>
                  <td className="py-3 text-white/50">{a.reason || "—"}</td>
                  <td className="py-3">
                    <span className={a.status === "completed" ? "text-emerald-400" : a.status === "cancelled" ? "text-red-400" : "text-sky-400"}>
                      {a.status === "completed" ? "مكتمل" : a.status === "cancelled" ? "ملغي" : "محجوز"}
                    </span>
                  </td>
                </tr>
              ))}
              {!(appointments || []).length && (
                <tr><td colSpan={4} className="py-4 text-center text-white/40">لا مواعيد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}