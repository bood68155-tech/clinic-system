import { supabase } from "@/lib/supabase";
import AdminAppointments from "@/components/AdminAppointments";
import AdminStats from "@/components/AdminStats";
import ToothIcon from "@/components/ToothIcon";
import Link from "next/link";

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

  return (
    <>
      <AdminStats
        todayCount={todayAppointments?.length || 0}
        patientCount={patientCount || 0}
        visitCount={visitCount || 0}
        totalRevenue={totalRevenue}
        pendingAmount={pendingAmount}
        today={today}
      />

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/visits" className="stat-card group flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center bg-c-accent/10 text-c-accent transition-all group-hover:bg-c-accent group-hover:text-c-bg">
            <ToothIcon className="h-6 w-6" />
          </span>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-c-white">New Visit</div>
            <div className="text-xs text-c-muted">Visit + Prescription</div>
          </div>
        </Link>
        <Link href="/admin/invoices" className="stat-card group flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center bg-c-gold/10 text-c-gold transition-all group-hover:bg-c-gold group-hover:text-c-bg">
            <ToothIcon variant="shield" className="h-6 w-6" />
          </span>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-c-white">New Invoice</div>
            <div className="text-xs text-c-muted">Bill a patient</div>
          </div>
        </Link>
        <Link href="/admin/patients" className="stat-card group flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center bg-c-cyan/10 text-c-cyan transition-all group-hover:bg-c-cyan group-hover:text-c-bg">
            <ToothIcon variant="smile" className="h-6 w-6" />
          </span>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-c-white">Patients</div>
            <div className="text-xs text-c-muted">View all records</div>
          </div>
        </Link>
        <Link href="/admin/tools" className="stat-card group flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center bg-c-danger/10 text-c-danger transition-all group-hover:bg-c-danger group-hover:text-c-bg">
            <ToothIcon variant="sparkle" className="h-6 w-6" />
          </span>
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-c-white">Clinical Tools</div>
            <div className="text-xs text-c-muted">Chart, X-ray, plans & Rx</div>
          </div>
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="section-title">Today&apos;s Appointments</h2>
        <AdminAppointments appointments={todayAppointments || []} today={today} />
      </div>

      <div>
        <h2 className="section-title">All Appointments</h2>
        <AdminAppointments appointments={allAppointments || []} today={today} />
      </div>
    </>
  );
}