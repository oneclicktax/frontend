"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Business } from "@/mocks/businesses";

export default function AccountPage() {
  const router = useRouter();

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const res = await fetch("/api/businesses");
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

  return (
    <div className="flex min-h-dvh flex-col px-5">
      {/* 상단 바 */}
      <header className="relative flex h-14 items-center justify-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-0"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium text-black-100">계정 설정</span>
      </header>

      {/* 폼 */}
      <div className="mt-2 flex flex-1 flex-col gap-4">
        {/* 이름 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">이름</label>
          <input
            type="text"
            defaultValue="소수진"
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 전화번호 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">전화번호</label>
          <input
            type="tel"
            defaultValue="010 4090 6457"
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">이메일</label>
          <input
            type="email"
            defaultValue="sample@nate.com(카카오 연결)"
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 사업장 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">사업장</label>
          {businesses.map((biz) => (
            <button
              key={biz.id}
              type="button"
              onClick={() => router.push("/business/register")}
              className="flex h-14 items-center justify-between rounded border border-black-40 px-4"
            >
              <span className="text-base text-black-100">
                {biz.name}({biz.number})
              </span>
              <ChevronRight size={20} className="text-black-60" />
            </button>
          ))}
        </div>

        {/* 계정 탈퇴 */}
        <Button
          variant="outline"
          className="h-14 w-full rounded-lg border-black-40 text-base font-bold text-black-60"
          onClick={() => {
            // TODO: 계정 탈퇴
          }}
        >
          계정 탈퇴
        </Button>
      </div>

      {/* 수정하기 버튼 */}
      <div className="py-4">
        <button
          type="button"
          className="w-full rounded-lg bg-primary-100 py-4 text-base font-bold text-white"
        >
          수정하기
        </button>
      </div>
    </div>
  );
}
