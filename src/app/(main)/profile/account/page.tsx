"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { memberApi, companyApi, type Member, type Company } from "@/lib/api";
import { removeAccessToken } from "@/lib/auth";
import { toast } from "sonner";
import { overlay } from "overlay-kit";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

export default function AccountPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hometaxUserId, setHometaxLoginId] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: member } = useQuery<Member>({
    queryKey: ["member", "me"],
    queryFn: async () => {
      return memberApi.getMe();
    },
  });

  const { data: businesses = [] } = useQuery<Company[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const data = await companyApi.getAll();
      return data.map((b: any) => ({
        id: b.id,
        name: b.name,
        bizNumber: b.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, "$1 $2 $3"),
      }));
    },
  });

  useEffect(() => {
    if (member) {
      setName(member.name ?? "");
      setPhoneNumber(member.phoneNumber ?? "");
      setHometaxLoginId(member.hometaxUserId ?? "");
      setBirthDate(member.birthDate ?? "");
      setEmail(member.email ?? "");
    }
  }, [member]);

  function openWithdrawDrawer() {
    overlay.open(({ isOpen, close }) => (
      <Drawer open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-lg font-bold text-black-100">
              원클릭 원천세를 탈퇴할까요?
            </DrawerTitle>
            <DrawerDescription className="text-sm text-black-60">
              탈퇴 즉시 계정 정보를 복구할 수 없어요.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={close}
            >
              취소
            </Button>
            <Button
              className="flex-1"
              onClick={async () => {
                try {
                  await memberApi.deleteMe();
                  removeAccessToken();
                  window.location.href = "/login";
                } catch {
                  toast.error("계정 탈퇴에 실패했습니다.");
                }
              }}
            >
              탈퇴
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    ));
  }

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("이름을 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      await memberApi.updateMe({ name, phoneNumber, hometaxUserId, birthDate, email });
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

        {/* 이메일 */}
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 rounded border border-black-40 px-4 text-base text-black-100 outline-none"
          />
        </div>

        {/* 사업장 */}
        {businesses.length > 0 && (
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
                  {biz.name}({biz.bizNumber})
                </span>
                <ChevronRight size={20} className="text-black-60" />
              </button>
            ))}
          </div>
        )}

        {/* 계정 탈퇴 */}
        <Button
          variant="outline"
          className="h-14 w-full rounded-lg border-black-40 text-base font-bold text-black-60"
          onClick={() => openWithdrawDrawer()}
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
