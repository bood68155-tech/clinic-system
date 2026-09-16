import Link from "next/link";
import { getSettings } from "@/lib/settings";

export default async function Header({ back = false }: { back?: boolean }) {
  const s = await getSettings();
  return (
    <header className="relative z-10 flex items-center justify-between px-6 py-5">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
        {s.clinic_logo ? (
          <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/15">
            <img src={s.clinic_logo} alt="" className="h-full w-full object-cover" />
          </span>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinic-accent text-clinic-dark">+</span>
        )}
        {s.clinic_name}
      </Link>
      <div className="flex items-center gap-3">
        {back ? (
          <Link href="/" className="btn-secondary !py-2 text-sm">← الرئيسية</Link>
        ) : (
          <>
            <Link href="/admin/login" className="btn-secondary !py-2 text-sm">
              <span className="ml-1">🔒</span> لوحة الطبيب
            </Link>
            <Link href="/book" className="btn-primary !py-2 text-sm">حجز موعد</Link>
          </>
        )}
      </div>
    </header>
  );
}