"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setAccessToken } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/api";

export default function LoginSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("accessToken");

    if (!token) {
      router.replace("/login/fail?error=토큰이 전달되지 않았습니다.");
      return;
    }

    setAccessToken(token);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    fetchWithAuth(`${apiUrl}/api/companies`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((json) => {
        const hasBusinesses = (json.data ?? []).length > 0;
        router.replace(hasBusinesses ? "/home" : "/onboarding");
      })
      .catch(() => {
        router.replace("/onboarding");
      });
  }, [searchParams, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 size={40} className="animate-spin text-primary-100" />
    </div>
  );
}
