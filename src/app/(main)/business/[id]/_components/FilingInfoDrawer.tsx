"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface MemberMe {
  name: string;
  phoneNumber: string | null;
  hometaxUserId: string | null;
  birthDate: string | null;
  representName: string | null;
}

interface FilingInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function FilingInfoDrawer({
  open,
  onOpenChange,
  onComplete,
}: FilingInfoDrawerProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [hometaxUserId, setHometaxLoginId] = useState("");
  const [birthDate, setBirthDate] = useState("");
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

  useEffect(() => {
    if (member) {
      setName(member.representName ?? "");
      setPhoneNumber(member.phoneNumber ?? "");
      setHometaxLoginId(member.hometaxUserId ?? "");
      setBirthDate(member.birthDate ?? "");
    }
  }, [member]);

  const isValid =
    name.trim() !== "" &&
    phoneNumber.trim() !== "" &&
    hometaxUserId.trim() !== "" &&
    birthDate.trim().length === 8;

  async function handleSave() {
    if (!isValid) {
      toast.error("모든 필드를 올바르게 입력해주세요.");
      return;
    }
    setIsSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phoneNumber,
          hometaxUserId,
          birthDate,
          representName: name,
        }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["member", "me"] });
      toast.success("회원 정보가 저장되었습니다.");
      onOpenChange(false);
      onComplete();
    } catch {
      toast.error("회원 정보 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-lg font-bold">
            신고에 필요한 정보를 입력해주세요
          </DrawerTitle>
          <DrawerDescription>
            원천세 신고를 위해 아래 정보가 필요합니다.
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-black-100">이름</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="h-12 rounded-lg border border-black-40 px-3 text-sm text-black-100 outline-none focus:border-primary-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-black-100">
                전화번호
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
                }
                placeholder="숫자만 입력 (예: 01012345678)"
                className="h-12 rounded-lg border border-black-40 px-3 text-sm text-black-100 outline-none focus:border-primary-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-black-100">
                홈택스 아이디
              </label>
              <input
                type="text"
                value={hometaxUserId}
                onChange={(e) => setHometaxLoginId(e.target.value)}
                placeholder="홈택스 로그인 아이디"
                className="h-12 rounded-lg border border-black-40 px-3 text-sm text-black-100 outline-none focus:border-primary-100"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-black-100">
                생년월일
              </label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) =>
                  setBirthDate(e.target.value.replace(/[^0-9]/g, "").slice(0, 8))
                }
                placeholder="8자리 숫자 (예: 19900101)"
                maxLength={8}
                className="h-12 rounded-lg border border-black-40 px-3 text-sm text-black-100 outline-none focus:border-primary-100"
              />
            </div>

          </div>
        </div>

        <DrawerFooter>
          <button
            type="button"
            disabled={!isValid || isSubmitting}
            onClick={handleSave}
            className="w-full rounded-lg bg-primary-100 py-4 text-base font-bold text-white disabled:opacity-50"
          >
            {isSubmitting ? "저장 중..." : "저장하기"}
          </button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
