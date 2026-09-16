import BookingForm from "@/components/BookingForm";
import Header from "@/components/Header";

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />

      <Header back />

      <section className="relative z-10 mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white md:text-4xl">حجز موعد جديد</h1>
          <p className="mt-2 text-white/60">
            اختاري التاريخ وشوفي المواعيد المتاحة مباشرة — بدون مكالمات
          </p>
        </div>
        <BookingForm />
      </section>
    </main>
  );
}