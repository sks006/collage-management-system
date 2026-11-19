import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "School Management System — Enterprise Monolith",
  description: "Comprehensive school and college management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
