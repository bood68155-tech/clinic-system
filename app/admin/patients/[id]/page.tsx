import Link from "next/link";
import { supabase } from "@/lib/supabase";
import DentalChart from "@/components/DentalChart";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: patient } = await supabase.from("patients").select("*").eq("id", id).single();
  if (!patient) return <div className="py-20 text-center text-c-muted">Patient not found</div>;

  const { data: visits } = await supabase.from("visits").select("*, doctors(name, specialty)").eq("patient_id", id).order("visit_date", { ascending: false });
  const visitIds = (visits || []).map((v) => v.id);
  let prescriptions: { visit_id: string; medication: string; dosage: string; frequency: string; duration: string }[] = [];
  if (visitIds.length) { const { data } = await supabase.from("prescriptions").select("*").in("visit_id", visitIds); prescriptions = data || []; }

  const { data: appointments } = await supabase.from("appointments").select("id, date, time, status, reason").eq("patient_id", id).order("date", { ascending: false }).limit(20);
  const { data: invoices } = await supabase.from("invoices").select("*").eq("patient_id", id).order("created_at", { ascending: false });

  // Quick prescriptions are linked straight to the patient (no visit required).
  const { data: quickPrescriptions } = await supabase
    .from("prescriptions")
    .select("id, medication, dosage, frequency, duration, instructions, created_at")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })
    .limit(30);

  const { data: xrayAnalyses } = await supabase
    .from("xray_analyses")
    .select("id, source, summary, quality_score, created_at, findings")
    .eq("patient_id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  const totalPaid = (invoices || []).filter((i) => i.paid).reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = (invoices || []).filter((i) => !i.paid).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-black uppercase tracking-wider text-c-white">{patient.name}</h2>
        <p className="mt-1 text-sm text-c-muted">{patient.phone} | Registered: {String(patient.created_at).slice(0, 10)}</p>
      </div>

      <div className="mb-8 grid gap-px bg-c-border md:grid-cols-4">
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Visits</div><div className="mt-1 text-3xl font-black text-c-accent">{visits?.length || 0}</div></div>
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Appointments</div><div className="mt-1 text-3xl font-black text-c-teal">{appointments?.length || 0}</div></div>
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Paid</div><div className="mt-1 text-3xl font-black text-c-success">{totalPaid.toLocaleString()} SAR</div></div>
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Pending</div><div className="mt-1 text-3xl font-black text-c-gold">{totalPending.toLocaleString()} SAR</div></div>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title !mb-0">Clinical Tools</h2>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/tools?patient=${id}`} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
              AI X-Ray
            </Link>
            <Link href={`/admin/tools?patient=${id}`} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
              Treatment Plan
            </Link>
            <Link href={`/admin/tools?patient=${id}`} className="btn-secondary !px-3 !py-1.5 !text-[11px]">
              Prescription & WhatsApp
            </Link>
          </div>
        </div>
        <DentalChart patientId={id} patientName={patient.name} />
      </div>

      {(quickPrescriptions || []).length > 0 && (
        <div className="mb-8">
          <h2 className="section-title">Quick Prescriptions</h2>
          <div className="space-y-3">
            {(quickPrescriptions || []).map((rx: any) => (
              <div key={rx.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-c-white">{rx.medication}</span>
                  <span className="text-[10px] uppercase tracking-wider text-c-muted">{String(rx.created_at).slice(0, 10)}</span>
                </div>
                <p className="text-xs text-c-muted">
                  {[rx.dosage, rx.frequency, rx.duration].filter(Boolean).join(" | ")}
                </p>
                {rx.instructions && <p className="mt-1 text-xs text-c-light">{rx.instructions}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {(xrayAnalyses || []).length > 0 && (
        <div className="mb-8">
          <h2 className="section-title">Radiology</h2>
          <div className="space-y-3">
            {(xrayAnalyses || []).map((x: any) => (
              <div key={x.id} className="card">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-c-muted">{String(x.created_at).slice(0, 16).replace("T", " ")}</span>
                  <span className="tag !text-[10px]">{x.source === "gemini" ? "Gemini Vision" : "Simulator"} · {x.quality_score}%</span>
                </div>
                <p className="text-xs text-c-light">{x.summary}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-c-muted">
                  {Array.isArray(x.findings) ? x.findings.length : 0} findings
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="section-title">Medical Visits</h2>
        <div className="space-y-3">
          {(visits || []).map((v: any) => {
            const doc = Array.isArray(v.doctors) ? v.doctors[0] : v.doctors;
            const rx = (prescriptions || []).filter((p) => p.visit_id === v.id);
            return (
              <div key={v.id} className="card">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-c-accent">{v.visit_date}</span>
                    {doc && <span className="text-xs uppercase tracking-wider text-c-muted">Dr. {doc.name}</span>}
                  </div>
                  {v.follow_up_date && <span className="text-[10px] uppercase tracking-wider text-c-gold">Follow-up: {v.follow_up_date}</span>}
                </div>
                {v.symptoms && <p className="mb-1 text-sm text-c-muted">Symptoms: {v.symptoms}</p>}
                {v.diagnosis && <p className="mb-1 text-sm text-c-white">Diagnosis: {v.diagnosis}</p>}
                {v.notes && <p className="text-xs text-c-muted">Notes: {v.notes}</p>}
                {rx.length > 0 && (
                  <div className="mt-3 border-t border-c-border pt-3">
                    <p className="mb-2 text-[10px] uppercase tracking-wider text-c-muted">Prescription</p>
                    <div className="grid gap-1 md:grid-cols-2">
                      {rx.map((p, i) => (
                        <div key={i} className="border border-c-border bg-c-surface p-2 text-sm">
                          <span className="font-medium text-c-white">{p.medication}</span>
                          {p.dosage ? <span className="text-c-muted"> — {p.dosage}</span> : null}
                          {p.frequency ? <span className="text-c-muted"> | {p.frequency}</span> : null}
                          {p.duration ? <span className="text-c-muted"> | {p.duration}</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {!(visits || []).length && <div className="card text-center text-c-muted">No visits recorded</div>}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="section-title">Invoices</h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-c-border bg-c-surface text-[10px] uppercase tracking-[0.2em] text-c-muted">
                <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {(invoices || []).map((inv: any) => (
                <tr key={inv.id} className="border-b border-c-border/50">
                  <td className="px-4 py-3 text-c-muted">{String(inv.created_at).slice(0, 10)}</td>
                  <td className="px-4 py-3 font-bold text-c-white">{Number(inv.amount).toLocaleString()} SAR</td>
                  <td className="px-4 py-3"><span className={inv.paid ? "tag-success" : "tag-warning"}>{inv.paid ? "PAID" : "PENDING"}</span></td>
                  <td className="px-4 py-3 text-c-muted">{inv.payment_method}</td>
                </tr>
              ))}
              {!(invoices || []).length && <tr><td colSpan={4} className="px-4 py-6 text-center text-c-muted">No invoices</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}