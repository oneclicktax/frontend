"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { IncomeEarner, TaxCalculation } from "./types";

// 제출일 계산: 귀속월 다음달 10일
function calcSubmitDate(year: number, month: number): string {
  const submitMonth = month === 12 ? 1 : month + 1;
  const submitYear = month === 12 ? year + 1 : year;
  return `${submitYear}-${String(submitMonth).padStart(2, "0")}-10`;
}

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "신고 준비 중...",
  AUTH_REQUESTED: "인증 확인 중...",
  FILING: "신고 진행 중...",
};

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filingJobId, setFilingJobId] = useState<string | null>(null);

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

  const { data: member } = useQuery<{
    name: string;
    phoneNumber: string | null;
    hometaxLoginId: string | null;
    birthDate: string | null;
    representName: string | null;
  }>({
    queryKey: ["member", "me"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  const { data: business, isLoading } = useQuery<{
    name: string;
    bizNumber: string;
    bizCode: string;
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
        bizCode: biz.bizCode || "",
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

  // 폴링: 신고 작업 상태 조회
  const { data: filingStatus } = useQuery<{ status: string }>({
    queryKey: ["filing-status", businessId, filingJobId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(
        `${apiUrl}/api/companies/${businessId}/withholding-tax/filing/${filingJobId}/status`,
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
    enabled: !!filingJobId,
    refetchInterval: 2000,
  });

  useEffect(() => {
    if (!filingStatus) return;

    if (filingStatus.status === "COMPLETED") {
      setFilingJobId(null);
      setIsSubmitting(false);
      removeDraft(draftKey);
      toast.success("원천세 신고가 완료되었습니다.");
      router.push(`/business/${businessId}`);
    } else if (filingStatus.status === "FAILED") {
      setFilingJobId(null);
      setIsSubmitting(false);
      toast.error("원천세 신고에 실패했습니다. 다시 시도해주세요.");
    }
  }, [filingStatus, draftKey, router, businessId]);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(
        `${apiUrl}/api/companies/${businessId}/withholding-tax/filing`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            year,
            month,
            submitDate: calcSubmitDate(year, month),
            userName: member?.name ?? "",
            phone: member?.phoneNumber ?? "",
            hometaxUserId: member?.hometaxLoginId ?? "",
            birthDate: member?.birthDate ?? "",
            representName: member?.representName ?? "",
            recipients: earners.map((e) => ({
              name: e.name,
              residentNumber: e.residentNumber,
              phone: e.phone,
              incomeType: e.incomeType,
              paymentDate: e.paymentDate,
              paymentAmount: e.amount,
            })),
          }),
        },
      );

      if (!res.ok) {
        throw new Error("신고 요청 실패");
      }

      const json = await res.json();
      setFilingJobId(json.data.jobId);
    } catch {
      setIsSubmitting(false);
      toast.error("신고 요청에 실패했습니다. 다시 시도해주세요.");
    }
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
            bizCode={business.bizCode}
            earners={earners}
            taxCalculation={taxCalculation}
            onEdit={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      {/* 신고 진행 중 로딩 오버레이 */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 size={48} className="animate-spin text-primary-100" />
          <p className="mt-4 text-base font-medium text-black-100">
            {filingStatus
              ? (STATUS_MESSAGES[filingStatus.status] ?? "신고 진행 중...")
              : "신고 요청 중..."}
          </p>
        </div>
      )}
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
