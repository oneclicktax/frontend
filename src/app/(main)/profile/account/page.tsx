"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";

interface Business {
  id: number;
  name: string;
  number: string;
}

interface MemberMe {
  id: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  hometaxUserId: string | null;
  birthDate: string | null;
  representName: string | null;
  socialLoginType: string;
}

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hometaxUserId, setHometaxLoginId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [representName, setRepresentName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: member } = useQuery<MemberMe>({
    queryKey: ["member", "me"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return (json.data ?? []).map((b: any) => ({
        id: b.id,
        name: b.name,
        number: b.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, "$1 $2 $3"),
      }));
    },
  });

  useEffect(() => {
    if (member) {
      setName(member.name ?? "");
      setPhoneNumber(member.phoneNumber ?? "");
      setHometaxLoginId(member.hometaxUserId ?? "");
      setBirthDate(member.birthDate ?? "");
      setRepresentName(member.representName ?? "");
    }
  }, [member]);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phoneNumber, hometaxUserId, birthDate, representName }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["member", "me"] });
      toast.success("회원 정보가 수정되었습니다.");
    } catch {
      toast.error("회원 정보 수정에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 전화번호 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">전화번호</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 홈택스 로그인 ID */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">홈택스 ID</label>
          <input
            type="text"
            value={hometaxUserId}
            onChange={(e) => setHometaxLoginId(e.target.value)}
            maxLength={30}
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 생년월일 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">생년월일</label>
          <input
            type="text"
            value={birthDate}
            onChange={(e) =>
              setBirthDate(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))
            }
            placeholder="8자리 숫자 (예: 19900101)"
            maxLength={8}
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 대표자명 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">대표자명</label>
          <input
            type="text"
            value={representName}
            onChange={(e) => setRepresentName(e.target.value)}
            placeholder="대표자명을 입력해주세요"
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">이메일</label>
          <input
            type="email"
            value={member?.email ? `${member.email}(${member.socialLoginType === "KAKAO" ? "카카오" : member.socialLoginType} 연결)` : ""}
            readOnly
            className="h-14 rounded border border-black-40 bg-gray-50 px-4 text-base text-black-60 outline-none"
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
          disabled={isSubmitting}
          onClick={handleSubmit}
          className="w-full rounded-lg bg-primary-100 py-4 text-base font-bold text-white disabled:opacity-50"
        >
          {isSubmitting ? "수정 중..." : "수정하기"}
        </button>
      </div>
    </div>
  );
}
