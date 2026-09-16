import { supabase } from "@/lib/supabase";
import InvoiceForm from "@/components/InvoiceForm";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { data: invoices } = await supabase.from("invoices").select("*, patients(id, name, phone)").order("created_at", { ascending: false });
  const { data: patients } = await supabase.from("patients").select("id, name, phone").order("name");

  const enriched = (invoices || []).map((inv) => ({ ...inv, patients: Array.isArray(inv.patients) ? inv.patients[0] : inv.patients }));
  const totalPaid = enriched.filter((i) => i.paid).reduce((s, i) => s + Number(i.amount), 0);
  const totalPending = enriched.filter((i) => !i.paid).reduce((s, i) => s + Number(i.amount), 0);

  return (
    <>
      <div className="mb-8 grid gap-px bg-c-border md:grid-cols-4">
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Total Invoices</div><div className="mt-1 text-3xl font-black text-c-white">{enriched.length}</div></div>
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Paid</div><div className="mt-1 text-3xl font-black text-c-success">{totalPaid.toLocaleString()} SAR</div></div>
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Pending</div><div className="mt-1 text-3xl font-black text-c-gold">{totalPending.toLocaleString()} SAR</div></div>
        <div className="bg-c-card p-5"><div className="text-[10px] uppercase tracking-wider text-c-muted">Net</div><div className="mt-1 text-3xl font-black text-c-accent">{totalPaid.toLocaleString()} SAR</div></div>
      </div>

      <div className="mb-8">
        <h2 className="section-title">New Invoice</h2>
        <div className="card">
          <InvoiceForm patients={(patients || []) as { id: string; name: string; phone: string }[]} />
        </div>
      </div>

      <div>
        <h2 className="section-title">All Invoices</h2>
        <div className="card overflow-x-auto !p-0">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-c-border bg-c-surface text-[10px] uppercase tracking-[0.2em] text-c-muted">
                <th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Patient</th><th className="px-4 py-3 font-medium">Amount</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Method</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map((inv) => (
                <tr key={inv.id} className="border-b border-c-border/50 transition-colors hover:bg-c-surface/50">
                  <td className="px-4 py-3 text-c-muted">{String(inv.created_at).slice(0, 10)}</td>
                  <td className="px-4 py-3 text-c-white">{inv.patients?.name || "—"}</td>
                  <td className="px-4 py-3 font-bold text-c-white">{Number(inv.amount).toLocaleString()} SAR</td>
                  <td className="px-4 py-3"><span className={inv.paid ? "tag-success" : "tag-warning"}>{inv.paid ? "PAID" : "PENDING"}</span></td>
                  <td className="px-4 py-3 text-c-muted">{inv.payment_method}</td>
                </tr>
              ))}
              {!enriched.length && <tr><td colSpan={5} className="px-4 py-8 text-center text-c-muted">No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}