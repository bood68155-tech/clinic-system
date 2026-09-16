import LoginForm from "@/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0 opacity-40 glow-bg" />
      <LoginForm />
    </main>
  );
}