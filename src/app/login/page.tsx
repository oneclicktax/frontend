"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleKakaoLogin() {
    if (loading) return;
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(
        `${apiUrl}/api/auth/social-login-url?socialLoginType=KAKAO`
      );

      if (!res.ok) throw new Error("소셜 로그인 URL 요청 실패");

      const data = await res.json();
      window.location.href = data.socialLoginUrl;
    } catch {
      setLoading(false);
      alert("카카오 로그인 요청에 실패했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-primary-100 px-6 pb-12">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-base text-white/80">초보 사장님도 할 수 있는</p>
        <h1 className="mt-3 text-center text-4xl font-extrabold tracking-[0.3em] text-white leading-snug">
          원 클 릭<br />원 천 세
        </h1>
      </div>

      <button
        type="button"
        onClick={handleKakaoLogin}
        disabled={loading}
        className="w-full max-w-sm disabled:opacity-70"
      >
        {loading ? (
          <div className="flex h-[54px] items-center justify-center rounded-xl bg-[#FEE500]">
            <Loader2 size={24} className="animate-spin text-black/60" />
          </div>
        ) : (
          <Image
            src="/kakao_login.png"
            alt="카카오 로그인"
            width={600}
            height={90}
            className="w-full"
            priority
          />
        )}
      </button>
    </div>
  );
}
