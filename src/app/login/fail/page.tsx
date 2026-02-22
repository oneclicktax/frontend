"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginFailPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "로그인에 실패했습니다.";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <p className="text-lg font-bold text-black-100">로그인 실패</p>
      <p className="mt-2 text-center text-sm text-black-60">{error}</p>
      <Link
        href="/login"
        className="mt-6 rounded-lg bg-primary-100 px-8 py-3 text-base font-bold text-white"
      >
        다시 시도하기
      </Link>
    </div>
  );
}
