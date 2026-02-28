import type { Metadata } from "next";
import { Prompt, IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";
import { Toast } from "@heroui/react";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const ibmPlex = IBM_Plex_Sans_Thai({
  variable: "--font-ibm-plex",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ผ้าป่า — ระบบบริหารจัดการงานผ้าป่า",
  description: "ระบบบริหารจัดการงานผ้าป่าออนไลน์ ติดตามยอดบริจาคแบบ Realtime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${prompt.variable} ${ibmPlex.variable} ${sarabun.variable} antialiased`}
      >
        <Toast.Provider placement="top end" />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
