"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { IncomeEarner, TaxCalculation } from "./types";
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

  const [step, setStep] = useState(1);
  const [earners, setEarners] = useState<IncomeEarner[]>([]);

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
    toast.success("원천세 신고가 완료되었습니다.");
    router.push(`/business/${businessId}`);
  };

  if (isLoading || !business) {
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
            onEarnersChange={setEarners}
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
