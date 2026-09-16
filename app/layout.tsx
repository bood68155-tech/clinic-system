import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "عيادتي — نظام حجز المواعيد الذكي",
  description: "احجز موعدك عند الطبيب مع الوكيل الذكي",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}