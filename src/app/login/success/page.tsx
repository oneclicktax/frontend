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

    Promise.all([
      fetchWithAuth(`${apiUrl}/api/members/me`).then((r) =>
        r.ok ? r.json() : Promise.reject(),
      ),
      fetchWithAuth(`${apiUrl}/api/companies`).then((r) =>
        r.ok ? r.json() : Promise.reject(),
      ),
    ])
      .then(([memberJson, companiesJson]) => {
        const member = memberJson.data;
        const hasCompanies = (companiesJson.data ?? []).length > 0;

        if (!member?.termsAgreed) {
          // 약관 미동의 → 온보딩 1단계부터
          router.replace("/onboarding");
        } else if (!hasCompanies) {
          // 약관 동의했지만 사업장 없음 → 온보딩 2단계부터
          router.replace("/onboarding?step=2");
        } else {
          router.replace("/home");
        }
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
