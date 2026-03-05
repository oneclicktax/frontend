"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAccessToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const hasToken = !!getAccessToken();
    router.replace(hasToken ? "/home" : "/login");
  }, [router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 size={32} className="animate-spin text-primary-100" />
    </div>
  );
}
