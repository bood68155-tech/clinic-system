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

  const { data: prescriptions } = await supabase
    .from("prescriptions")
    .select("medication, dosage, visit_id");

  const enriched = (visits || []).map((v) => ({
    ...v,
    patients: Array.isArray(v.patients) ? v.patients[0] : v.patients,
    doctors: Array.isArray(v.doctors) ? v.doctors[0] : v.doctors,
    prescriptions: (prescriptions || []).filter((p) => p.visit_id === v.id),
  }));

  return (
    <>
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">زيارة جديدة</h2>
        <div className="card">
          <VisitForm doctors={(doctors || []) as { id: string; name: string; specialty: string }[]} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">الزيارات السابقة</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="pb-3 font-medium">التاريخ</th>
                <th className="pb-3 font-medium">المريض</th>
                <th className="pb-3 font-medium">الطبيب</th>
                <th className="pb-3 font-medium">التشخيص</th>
                <th className="pb-3 font-medium">الوصفات</th>
                <th className="pb-3 font-medium">المتابعة</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="py-3 text-white/70">{v.visit_date}</td>
                  <td className="py-3 text-white">{v.patients?.name || "—"}</td>
                  <td className="py-3 text-white/60">{v.doctors?.name || "—"}</td>
                  <td className="py-3 text-white/80 max-w-[200px] truncate">{v.diagnosis || "—"}</td>
                  <td className="py-3 text-clinic-accent">{v.prescriptions?.length || 0} دواء</td>
                  <td className="py-3 text-white/50">{v.follow_up_date || "—"}</td>
                </tr>
              ))}
              {!enriched.length && (
                <tr><td colSpan={6} className="py-6 text-center text-white/40">لا زيارات بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}