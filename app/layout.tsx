import type { Metadata } from "next";
import { LanguageProvider } from "@/lib/translations/context";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicAI - Smart Clinic Management",
  description: "AI-powered clinic management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}