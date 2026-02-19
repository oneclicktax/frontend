import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MSWProvider } from "@/mocks/MSWProvider";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "원클릭 원천세",
  description: "초보 사장님도 할 수 있는 원클릭 원천세",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        <div className="relative mx-auto min-h-dvh w-full max-w-[26.875rem] bg-white shadow-[0_0_1.25rem_rgba(0,0,0,0.08)]">
          <MSWProvider>
            <QueryProvider>{children}</QueryProvider>
          </MSWProvider>
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}
