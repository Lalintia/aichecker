import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Search Checker - NerdOptimize",
  description: "ตรวจให้พร้อมก่อนให้ AI ค้นหาเว็บไซต์ของคุณ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen bg-[#0f172a]">
        {children}
      </body>
    </html>
  );
}
