import { supabase } from "@/lib/supabase";
import VisitForm from "@/components/VisitForm";

export const dynamic = "force-dynamic";

export default async function VisitsPage() {
  const { data: doctors } = await supabase.from("doctors").select("id, name, specialty").eq("is_active", true);
  const { data: visits } = await supabase
    .from("visits")
    .select("*, patients(name, phone), doctors(name, specialty)")
    .order("visit_date", { ascending: false })
    .limit(50);

  const { data: prescriptions } = await supabase.from("prescriptions").select("medication, dosage, visit_id");

  const enriched = (visits || []).map((v) => ({
    ...v,
    patients: Array.isArray(v.patients) ? v.patients[0] : v.patients,
    doctors: Array.isArray(v.doctors) ? v.doctors[0] : v.doctors,
    prescriptions: (prescriptions || []).filter((p) => p.visit_id === v.id),
  }));

  return (
    <>
      <div className="mb-8">
        <h2 className="section-title">New Visit</h2>
        <div className="card">
          <VisitForm doctors={(doctors || []) as { id: string; name: string; specialty: string }[]} />
        </div>
      </div>

      <div>
        <h2 className="section-title">Past Visits</h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-c-border bg-c-surface text-[10px] uppercase tracking-[0.2em] text-c-muted">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Doctor</th>
                <th className="px-4 py-3 font-medium">Diagnosis</th>
                <th className="px-4 py-3 font-medium">Rx</th>
                <th className="px-4 py-3 font-medium">Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((v) => (
                <tr key={v.id} className="border-b border-c-border/50 transition-colors hover:bg-c-surface/50">
                  <td className="px-4 py-3 text-c-accent font-medium">{v.visit_date}</td>
                  <td className="px-4 py-3 text-c-white">{v.patients?.name || "—"}</td>
                  <td className="px-4 py-3 text-c-muted">{v.doctors?.name || "—"}</td>
                  <td className="px-4 py-3 text-c-light max-w-[200px] truncate">{v.diagnosis || "—"}</td>
                  <td className="px-4 py-3 tag-accent !inline-block">{v.prescriptions?.length || 0}</td>
                  <td className="px-4 py-3 text-c-muted">{v.follow_up_date || "—"}</td>
                </tr>
              ))}
              {!enriched.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-c-muted">No visits yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}