import type { Metadata } from "next";
import AppToaster from "@/components/AppToaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Authly — Secure authentication",
  description: "A secure, modern full-stack authentication experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
