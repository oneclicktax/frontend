"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StepBusinessInfoProps {
  businessName: string;
  bizNumber: string;
  onNext: () => void;
}

export function StepBusinessInfo({
  businessName,
  bizNumber,
  onNext,
}: StepBusinessInfoProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6">
      <div className="mt-6">
        <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
          <span className="text-primary-100">사업장 정보</span>
          <span className="text-black-100">를 확인해주세요.</span>
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">상호명</label>
          <Input
            readOnly
            value={businessName}
            className="border-black-100 bg-black-20 font-bold tracking-wide"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">
            사업자등록번호
          </label>
          <Input
            readOnly
            value={bizNumber}
            className="border-black-100 bg-black-20 font-bold tracking-wide"
          />
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
