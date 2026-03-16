import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/QueryProvider";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
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
        className={`${notoSansKR.variable} antialiased bg-gray-100`}
      >
        <div className="relative mx-auto min-h-dvh w-full max-w-[26.875rem] bg-white shadow-[0_0_1.25rem_rgba(0,0,0,0.08)]">
          <QueryProvider>{children}</QueryProvider>
          <Toaster position="top-center" />
        </div>
      </body>
    </html>
  );
}
