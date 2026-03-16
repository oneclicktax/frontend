"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { memberApi, companyApi, type Member } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  BusinessRegisterForm,
  type Business,
} from "@/components/BusinessRegisterForm";

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [hometaxUserId, setHometaxUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: existingBusinesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const data = await companyApi.getAll();
      return data.map((b) => ({
        id: b.id,
        name: b.name,
        bizNumber: formatBusinessNumber(b.bizNumber),
      }));
    },
  });

  const { data: member } = useQuery<Member>({
    queryKey: ["member-me"],
    queryFn: async () => {
      return memberApi.getMe();
    },
  });

  useEffect(() => {
    if (member?.hometaxUserId) {
      setHometaxUserId(member.hometaxUserId);
    }
  }, [member]);

  useEffect(() => {
    if (existingBusinesses.length > 0 && businesses.length === 0) {
      setBusinesses(existingBusinesses);
    }
  }, [existingBusinesses]);

  async function handleSave() {
    if (submitting) return;
    if (!hometaxUserId.trim()) {
      toast.error("홈택스 아이디를 입력해주세요.");
      return;
    }
    setSubmitting(true);
    try {
      // 홈택스 아이디 저장
      await memberApi.updateMe({ hometaxUserId: hometaxUserId.trim() });

      // 사업장 저장
      await companyApi.save(
        businesses.map((b) => ({
          name: b.name,
          bizNumber: b.bizNumber.replace(/\s/g, ""),
        })),
      );
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      await queryClient.invalidateQueries({ queryKey: ["member-me"] });
      router.push("/home");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-6"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium tracking-tight text-black-100">
          사업장 등록
        </span>
      </header>

      <div className="flex flex-1 flex-col">
        <div className="px-6 mt-6">
          <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
            사업장을 등록해주세요.
          </h1>

          <div className="mt-6 flex flex-col gap-2">
            <label className="text-sm font-bold text-black-100">
              홈택스 아이디
            </label>
            <Input
              value={hometaxUserId}
              onChange={(e) => setHometaxUserId(e.target.value)}
              placeholder="홈택스 아이디 입력"
            />
          </div>
        </div>

        <BusinessRegisterForm
          businesses={businesses}
          onBusinessesChange={setBusinesses}
          onSave={handleSave}
          saving={submitting}
        />
      </div>
    </div>
  );
}
