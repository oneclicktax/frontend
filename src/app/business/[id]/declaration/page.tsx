"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { IncomeEarner, TaxCalculation } from "./types";


// 제출일: 오늘 날짜
function calcSubmitDate(): string {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
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

interface TaxCalcApiResponse {
  recipients: {
    name: string;
    incomeType: string;
    preTaxAmount: number;
    incomeTax: number;
    localTax: number;
    afterTaxAmount: number;
  }[];
  totalIncomeTax: number;
  totalLocalTax: number;
  totalTax: number;
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
  const [isAmendment, setIsAmendment] = useState(false);

  useEffect(() => {
    const saved = loadDraft(draftKey);
    if (saved) {
      setEarners(saved);
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
    hometaxUserId: string | null;
    birthDate: string | null;
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

  // 세금 계산 API 호출 (step 4 진입 시)
  const { data: taxCalcData, isLoading: isTaxCalcLoading } = useQuery<TaxCalcApiResponse>({
    queryKey: ["tax-calculate", businessId, earners],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(
        `${apiUrl}/api/companies/${businessId}/withholding-tax/calculate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipients: earners.map((e) => ({
              name: e.name,
              incomeType: e.incomeType,
              paymentAmount: e.amount,
              amountType: e.amountType === "pre-tax" ? "PRE_TAX" : "AFTER_TAX",
            })),
          }),
        },
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
    enabled: step === 4 && earners.length > 0,
  });

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
      const completedJobId = filingJobId;
      setFilingJobId(null);
      setIsSubmitting(false);
      removeDraft(draftKey);
      toast.success("원천세 신고가 완료되었습니다.");
      router.push(`/business/${businessId}?jobId=${completedJobId}`);
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
            submitDate: calcSubmitDate(),
            amendedReturn: isAmendment,
            userName: member?.name ?? "",
            phone: member?.phoneNumber ?? "",
            hometaxUserId: member?.hometaxUserId ?? "",
            birthDate: member?.birthDate ?? "",
            representName: member?.name ?? "",
            recipients: earners.map((e) => ({
              name: e.name,
              residentNumber: e.residentNumber,
              phone: e.phone,
              incomeType: e.incomeType,
              paymentDate: e.paymentDate,
              paymentAmount: e.amount,
              amountType: e.amountType === "pre-tax" ? "PRE_TAX" : "AFTER_TAX",
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

  const taxCalculation: TaxCalculation | null = taxCalcData
    ? {
        nationalTax: taxCalcData.totalIncomeTax,
        localTax: taxCalcData.totalLocalTax,
        surcharge: isOverdue ? Math.round(taxCalcData.totalIncomeTax * 0.03) : undefined,
        totalTax: taxCalcData.totalTax + (isOverdue ? Math.round(taxCalcData.totalIncomeTax * 0.03) : 0),
      }
    : null;

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
            belongYear={year}
            belongMonth={month}
          />
        )}

        {step === 3 && <StepPaymentNotice onNext={() => setStep(4)} />}

        {step === 4 && (isTaxCalcLoading || !taxCalculation || !taxCalcData ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary-100" />
          </div>
        ) : (
          <StepReview
            businessName={business.name}
            bizNumber={business.bizNumber}
            bizCode={business.bizCode}
            earners={earners}
            taxCalculation={taxCalculation}
            recipientTaxes={taxCalcData.recipients}
            isAmendment={isAmendment}
            onEdit={() => setStep(2)}
            onSubmit={handleSubmit}
          />
        ))}
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
