"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { IncomeEarner, TaxCalculation } from "./types";

function getDraftKey(businessId: number, year: number, month: number) {
  return `Oneclicktax.draft_${businessId}_${year}_${month}`;
}

function loadDraft(key: string): IncomeEarner[] | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return null;
  } catch {
    return null;
  }
}

function saveDraft(key: string, earners: IncomeEarner[]) {
  try {
    if (earners.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(earners));
    }
  } catch {}
}

function removeDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
import { StepHeader } from "./_components/StepHeader";
import { StepBusinessInfo } from "./_components/StepBusinessInfo";
import { StepEarnerInfo } from "./_components/StepEarnerInfo";
import { StepPaymentNotice } from "./_components/StepPaymentNotice";
import { StepReview } from "./_components/StepReview";

function calculateTax(
  earners: IncomeEarner[],
  isOverdue: boolean,
): TaxCalculation {
  let totalPreTaxAmount = 0;
  for (const earner of earners) {
    totalPreTaxAmount += earner.amount;
  }

  const nationalTax = Math.round(totalPreTaxAmount * 0.03);
  const localTax = Math.round(nationalTax * 0.1);
  const surcharge = isOverdue ? Math.round(nationalTax * 0.03) : undefined;
  const totalTax = nationalTax + localTax + (surcharge ?? 0);

  return { nationalTax, localTax, surcharge, totalTax };
}

function WithholdingTaxContent() {
  const params = useParams();
  const businessId = Number(params.id);
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year") || new Date().getFullYear());
  const month = Number(
    searchParams.get("month") || new Date().getMonth() + 1,
  );

  const draftKey = getDraftKey(businessId, year, month);

  const [step, setStep] = useState(1);
  const [earners, setEarners] = useState<IncomeEarner[]>([]);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    const saved = loadDraft(draftKey);
    if (saved) {
      setEarners(saved);
      toast.info("임시 저장된 소득자 정보를 불러왔습니다.");
    }
    setDraftLoaded(true);
  }, [draftKey]);

  const handleEarnersChange = useCallback(
    (newEarners: IncomeEarner[]) => {
      setEarners(newEarners);
      saveDraft(draftKey, newEarners);
    },
    [draftKey],
  );

  const { data: business, isLoading } = useQuery<{
    name: string;
    bizNumber: string;
  }>({
    queryKey: ["business-detail", businessId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      const biz = (json.data ?? []).find(
        (b: { id: number }) => b.id === businessId,
      );
      if (!biz) throw new Error("사업장을 찾을 수 없습니다.");
      return {
        name: biz.name,
        bizNumber: biz.bizNumber.replace(
          /(\d{3})(\d{2})(\d{5})/,
          "$1 $2 $3",
        ),
      };
    },
  });

  const isOverdue = searchParams.get("overdue") === "true";

  const headerTitle =
    step <= 3
      ? `${year}년 ${month}월 귀속 원천세`
      : `${year}년 ${month}월 귀속 제출`;

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = () => {
    removeDraft(draftKey);
    toast.success("원천세 신고가 완료되었습니다.");
    router.push(`/business/${businessId}`);
  };

  if (isLoading || !business || !draftLoaded) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-100" />
      </div>
    );
  }

  const taxCalculation = calculateTax(earners, isOverdue);

  return (
    <div className="flex min-h-dvh flex-col">
      <StepHeader title={headerTitle} onBack={handleBack} />

      <div className="flex min-h-0 flex-1 flex-col">
        {step === 1 && (
          <StepBusinessInfo
            businessName={business.name}
            bizNumber={business.bizNumber}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepEarnerInfo
            earners={earners}
            onEarnersChange={handleEarnersChange}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && <StepPaymentNotice onNext={() => setStep(4)} />}

        {step === 4 && (
          <StepReview
            businessName={business.name}
            bizNumber={business.bizNumber}
            earners={earners}
            taxCalculation={taxCalculation}
            onEdit={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default function WithholdingTaxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary-100" />
        </div>
      }
    >
      <WithholdingTaxContent />
    </Suspense>
  );
}
