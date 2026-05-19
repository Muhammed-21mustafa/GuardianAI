import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuardianAI - İade Doğrulama Operasyon Paneli",
  description: "AI destekli iade önceliklendirme, kanıt yönetimi ve insan denetimli karar destek platformu.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
