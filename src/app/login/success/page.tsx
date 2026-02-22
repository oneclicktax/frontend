"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setAccessToken } from "@/lib/auth";

export default function LoginSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("accessToken");

    if (token) {
      setAccessToken(token);
      router.replace("/home");
    } else {
      router.replace("/login/fail?error=토큰이 전달되지 않았습니다.");
    }
  }, [searchParams, router]);

  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 size={40} className="animate-spin text-primary-100" />
    </div>
  );
}
