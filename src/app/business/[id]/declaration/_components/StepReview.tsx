"use client";

import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncomeEarner, TaxCalculation } from "../types";
import { ReviewSection } from "./ReviewSection";

interface StepReviewProps {
  businessName: string;
  bizNumber: string;
  earners: IncomeEarner[];
  taxCalculation: TaxCalculation;
  onEdit: () => void;
  onSubmit: () => void;
}

export function StepReview({
  businessName,
  bizNumber,
  earners,
  taxCalculation,
  onEdit,
  onSubmit,
}: StepReviewProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
      <div className="mt-6">
        <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
          최종적으로
          <br />
          신고 정보를 확인해주세요.
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {/* 사업장 정보 */}
        <ReviewSection title="사업장 정보">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-black-60">상호명</span>
              <span className="text-sm font-medium text-black-100">
                {businessName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-black-60">사업자등록번호</span>
              <span className="text-sm font-medium text-black-100">
                {bizNumber}
              </span>
            </div>
          </div>
        </ReviewSection>

        {/* 소득자 정보 */}
        <ReviewSection title="소득자 정보">
          <div className="flex flex-col gap-3">
            {earners.map((earner) => (
              <div key={earner.id} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-black-100">
                  {earner.name}
                </span>
                <div className="flex justify-between">
                  <span className="text-xs text-black-60">소득 유형</span>
                  <span className="text-xs text-black-100">
                    {earner.incomeType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-black-60">지급액</span>
                  <span className="text-xs text-black-100">
                    {earner.amount.toLocaleString("ko-KR")}원
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ReviewSection>

        {/* 납부 세액 */}
        <ReviewSection title="납부 세액" showInfo defaultExpanded>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-base text-black-100">국세(원천세)</span>
              <span className="text-base font-semibold text-black-100">
                {taxCalculation.nationalTax.toLocaleString("ko-KR")}원
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-base text-black-100">지방세(원천세)</span>
              <span className="text-base font-semibold text-black-100">
                {taxCalculation.localTax.toLocaleString("ko-KR")}원
              </span>
            </div>
            {taxCalculation.surcharge != null &&
              taxCalculation.surcharge > 0 && (
                <div className="flex justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-base text-black-100">가산세</span>
                    <Info size={16} className="text-primary-80" />
                  </div>
                  <span className="text-base font-semibold text-error-100">
                    {taxCalculation.surcharge.toLocaleString("ko-KR")}원
                  </span>
                </div>
              )}
            <div className="flex justify-between">
              <span className="text-base text-black-100">총 납부세액</span>
              <span className="text-base font-semibold text-primary-100">
                {taxCalculation.totalTax.toLocaleString("ko-KR")}원
              </span>
            </div>
          </div>
        </ReviewSection>

        {/* 간이지급명세서 */}
        <ReviewSection
          title="간이지급명세서 함께 제출"
          collapsible={false}
        />
      </div>

      <div className="mt-auto flex flex-col items-center gap-3 pt-8">
        <Button variant="ghost" onClick={onEdit} className="text-black-60">
          수정이 필요해요
        </Button>
        <Button onClick={onSubmit} size="xl" className="w-full">
          신고하기
        </Button>
      </div>
    </div>
  );
}
