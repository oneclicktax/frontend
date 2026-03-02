"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import {
  BusinessRegisterForm,
  type Business,
} from "@/components/BusinessRegisterForm";

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSave() {
    if (businesses.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businesses: businesses.map((b) => ({
            name: b.name,
            bizNumber: b.bizNumber.replace(/\s/g, ""),
          })),
        }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/home");
    } catch {
      toast.error("사업장 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-6"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium tracking-tight text-black-100">
          사업장 등록
        </span>
      </header>

      {step === 1 ? (
        <div className="flex flex-1 flex-col px-6">
          <div className="mt-6">
            <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
              <span className="text-primary-100">홈택스 연동해서</span>
              <br />
              <span className="text-black-100">
                사업장 정보를 한 번에 가져올까요?
              </span>
            </h1>
          </div>

          <div className="mt-auto flex flex-col items-center gap-3 pb-8">
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
              className="text-black-60"
            >
              사업장 수기로 입력할래요.
            </Button>
            <Button
              size="xl"
              className="w-full"
              onClick={() =>
                toast.info("홈택스 연동 기능은 준비 중입니다.")
              }
            >
              홈택스 연동하기
            </Button>
          </div>
        </div>
      ) : (
        <BusinessRegisterForm
          businesses={businesses}
          onBusinessesChange={setBusinesses}
          onSave={handleSave}
          saving={submitting}
        />
      )}
    </div>
  );
}
