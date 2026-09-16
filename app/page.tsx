import Link from "next/link";
import ChatWidget from "@/components/ChatWidget";
import Header from "@/components/Header";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSettings();
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />

      <Header />

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 text-center">
        <p className="mb-4 inline-block rounded-full border border-clinic-accent/30 bg-clinic-accent/10 px-4 py-1.5 text-sm text-clinic-accent">
          نظام حجز ذكي مع وكيل محادثة بالذكاء الاصطناعي
        </p>
        <h1 className="text-4xl font-bold leading-tight text-white md:text-6xl">
          احجز موعدك عند الطبيب
          <br />
          <span className="text-clinic-accent">بدون انتظار ولا مكالمات</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          الوكيل الذكي بيتكلم معك، بيفهم حالتك، وبيسجل موعدك تلقائياً حسب جدول الطبيب المتاح.
          أو اختاري الوقت المناسب بنفسك من صفحة الحجز.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/book" className="btn-primary text-lg">
            📅 احجز موعد الآن
          </Link>
          <Link href="/book" className="btn-secondary text-lg">
            💬 تحدث مع الوكيل الذكي
          </Link>
        </div>

        {s.clinic_logo && (
          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <img
              src={s.clinic_logo}
              alt={s.clinic_name}
              className="w-full object-cover"
              style={{ maxHeight: "24rem" }}
            />
          </div>
        )}

        <div className="mt-24 grid gap-6 text-right md:grid-cols-3">
          {[
            {
              icon: "🗂️",
              title: "ملفات مرضى محفوظة",
              desc: "سيتم حفظ بيانات كل مريض تلقائياً، والطبيب يرى التاريخ الكامل للزيارات.",
            },
            {
              icon: "📅",
              title: "حجز ذكي تلقائي",
              desc: "المواعيد المحجوزة ما تتداخل — النظام بيمنع الحجز المزدوج بشكل تلقائي.",
            },
            {
              icon: "🤖",
              title: "وكيل ذكاء اصطناعي",
              desc: "بيجاوب على المرضى 24/7، بيأخذ البيانات، وبيسجل المواعيد بدون تدخل بشري.",
            },
          ].map((f) => (
            <div key={f.title} className="card animate-fade-up">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}