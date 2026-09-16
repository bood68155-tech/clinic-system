import Header from "@/components/Header";
import BookingForm from "@/components/BookingForm";

export const dynamic = "force-dynamic";

export default function BookPage() {
  return (
    <>
      <Header back />
      <main className="relative min-h-[calc(100vh-65px)]">
        <div className="pointer-events-none fixed inset-0 glow-bg" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 py-12">
          <h1 className="mb-2 text-2xl font-black uppercase tracking-[0.15em] text-c-white">Book Appointment</h1>
          <p className="mb-8 text-sm text-c-muted">Select date and available time slot</p>
          <BookingForm />
        </div>
      </main>
    </>
  );
}