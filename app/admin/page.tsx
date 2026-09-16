import { supabase } from "@/lib/supabase";
import Link from "next/link";
import AdminAppointments from "@/components/AdminAppointments";

export const dynamic = "force-dynamic";

const today = new Date().toISOString().split("T")[0];

export default async function AdminPage() {
  const { data: todayAppointments } = await supabase
    .from("appointments")
    .select("id, date, time, reason, status, patients(name, phone)")
    .eq("date", today)
    .order("time");

  const { data: allAppointments } = await supabase
    .from("appointments")
    .select("id, date, time, reason, status, patients(name, phone)")
    .order("date", { ascending: true })
    .order("time")
    .limit(50);

  const { count: patientCount } = await supabase
    .from("patients")
    .select("id", { count: "exact", head: true });

  const { count: visitCount } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("amount, paid");

  const totalRevenue = (invoices || []).reduce(
    (s, i) => s + (i.paid ? Number(i.amount) : 0), 0
  );
  const pendingAmount = (invoices || []).reduce(
    (s, i) => s + (!i.paid ? Number(i.amount) : 0), 0
  );

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const { data: weekApps } = await supabase
    .from("appointments")
    .select("date, status")
    .gte("date", days[0])
    .lte("date", days[6]);

  const weekCounts = days.map((day) => ({
    day,
    count: (weekApps || []).filter((a) => a.date === day).length,
  }));
  const totalWeek = weekApps?.length || 0;
  const completedWeek = (weekApps || []).filter((a) => a.status === "completed").length;
  const cancelledWeek = (weekApps || []).filter((a) => a.status === "cancelled").length;
  const maxCount = Math.max(...weekCounts.map((w) => w.count), 1);

  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="text-sm text-white/50">مواعيد اليوم</div>
          <div className="mt-1 text-4xl font-bold text-white">{todayAppointments?.length || 0}</div>
          <div className="mt-1 text-xs text-white/40">{today}</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">إجمالي المرضى</div>
          <div className="mt-1 text-4xl font-bold text-white">{patientCount || 0}</div>
          <div className="mt-1 text-xs text-white/40">مريض مسجل</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">الزيارات</div>
          <div className="mt-1 text-4xl font-bold text-white">{visitCount || 0}</div>
          <div className="mt-1 text-xs text-white/40">زيارة طبية</div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="card">
          <div className="text-sm text-white/50">الإيرادات المحصلة</div>
          <div className="mt-1 text-3xl font-bold text-emerald-400">{totalRevenue.toLocaleString()} ر.س</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">مبالغ معلقة</div>
          <div className="mt-1 text-3xl font-bold text-amber-400">{pendingAmount.toLocaleString()} ر.س</div>
        </div>
        <div className="card flex flex-col justify-center gap-2">
          <Link href="/admin/visits" className="btn-primary text-center text-sm">زيارة جديدة</Link>
          <Link href="/admin/invoices" className="btn-secondary text-center text-sm">انشئ فاتورة</Link>
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 font-semibold text-white">احصائيات الاسبوع</h3>
          <div className="flex items-end gap-1.5" style={{ height: "7rem" }}>
            {weekCounts.map((w) => (
              <div key={w.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-clinic-accent/50 transition-all"
                  style={{ height: `${Math.max(6, (w.count / maxCount) * 100)}%` }}
                />
                <span className="text-[10px] text-white/40">{w.day.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-white/50">
            {totalWeek} حجز هذا الاسبوع - {completedWeek} مكتملة - {cancelledWeek} ملغاة
          </p>
        </div>

        <div className="card flex flex-col justify-center gap-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/50">حجوزات اليوم</div>
              <div className="mt-1 text-4xl font-bold text-white">{todayAppointments?.length || 0}</div>
            </div>
            <div className="text-3xl">🗓️</div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/50">المرضى المسجلون</div>
              <div className="mt-1 text-4xl font-bold text-white">{patientCount || 0}</div>
            </div>
            <div className="text-3xl">👥</div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">مواعيد اليوم</h2>
        <AdminAppointments appointments={todayAppointments || []} today={today} />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">جميع المواعيد</h2>
        <AdminAppointments appointments={allAppointments || []} today={today} />
      </div>
    </>
  );
}