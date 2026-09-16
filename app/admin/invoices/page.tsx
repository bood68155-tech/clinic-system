import { supabase } from "@/lib/supabase";
import InvoiceForm from "@/components/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, patients(id, name, phone)")
    .order("created_at", { ascending: false });

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, phone")
    .order("name");

  const enriched = (invoices || []).map((inv) => ({
    ...inv,
    patients: Array.isArray(inv.patients) ? inv.patients[0] : inv.patients,
  }));

  const totalPaid = enriched.filter((i) => i.paid).reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = enriched.filter((i) => !i.paid).reduce((s, i) => s + Number(i.amount), 0);
  const totalCount = enriched.length;
  const paidCount = enriched.filter((i) => i.paid).length;

  return (
    <>
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <div className="card">
          <div className="text-sm text-white/50">إجمالي الفواتير</div>
          <div className="text-3xl font-bold text-white mt-1">{totalCount}</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">مدفوعة ({paidCount})</div>
          <div className="text-3xl font-bold text-emerald-400 mt-1">{totalPaid.toLocaleString()} ر.س</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">معلقة ({totalCount - paidCount})</div>
          <div className="text-3xl font-bold text-amber-400 mt-1">{totalPending.toLocaleString()} ر.س</div>
        </div>
        <div className="card">
          <div className="text-sm text-white/50">الصافي</div>
          <div className="text-3xl font-bold text-clinic-accent mt-1">{totalPaid.toLocaleString()} ر.س</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-white">فاتورة جديدة</h2>
        <div className="card">
          <InvoiceForm patients={(patients || []) as { id: string; name: string; phone: string }[]} />
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">جميع الفواتير</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="pb-3 font-medium">التاريخ</th>
                <th className="pb-3 font-medium">المريض</th>
                <th className="pb-3 font-medium">المبلغ</th>
                <th className="pb-3 font-medium">الحالة</th>
                <th className="pb-3 font-medium">الدفع</th>
                <th className="pb-3 font-medium">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((inv) => (
                <tr key={inv.id} className="border-b border-white/5">
                  <td className="py-3 text-white/70">{String(inv.created_at).slice(0, 10)}</td>
                  <td className="py-3 text-white">{inv.patients?.name || "—"}</td>
                  <td className="py-3 font-semibold text-white">{Number(inv.amount).toLocaleString()} ر.س</td>
                  <td className="py-3">
                    <span className={inv.paid ? "text-emerald-400" : "text-amber-400"}>
                      {inv.paid ? "مدفوع" : "معلق"}
                    </span>
                  </td>
                  <td className="py-3 text-white/50">{inv.payment_method}</td>
                  <td className="py-3 text-white/40 text-xs max-w-[150px] truncate">{inv.notes || "—"}</td>
                </tr>
              ))}
              {!enriched.length && (
                <tr><td colSpan={6} className="py-6 text-center text-white/40">لا فواتير بعد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}