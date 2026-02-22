"use client";

import { Button } from "@/components/ui/button";

interface StepPaymentNoticeProps {
  onNext: () => void;
}

export function StepPaymentNotice({ onNext }: StepPaymentNoticeProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6">
      <div className="mt-6">
        <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
          <span className="text-primary-100">간이지급명세서</span>
          <br />
          <span className="text-black-100">
            원천세 신고와 함께 제출할게요.
          </span>
        </h1>
      </div>

      <div className="mt-8">
        <div className="rounded-2xl bg-[#eaf2ff] p-4">
          <p className="text-xs font-bold text-[#1f2024]">
            간이지급명세서란?
          </p>
          <p className="mt-1 text-xs leading-4 tracking-wide text-[#494a50]">
            직원, 알바, 프리랜서에게 지급한 금액을 원천세 신고와 함께 국세청에
            필수적으로 제출해야하는 명세서예요.
          </p>
        </div>
      </div>

      <div className="mt-auto pb-8 pt-8">
        <Button onClick={onNext} size="xl" className="w-full">
          다음
        </Button>
      </div>
    </div>
  );
}
