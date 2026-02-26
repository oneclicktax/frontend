"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface StepBusinessInfoProps {
  businessName: string;
  bizNumber: string;
  member?: {
    name: string;
    phoneNumber: string | null;
    hometaxLoginId: string | null;
    birthDate: string | null;
    representName: string | null;
  };
  onNext: () => void;
}

export function StepBusinessInfo({
  businessName,
  bizNumber,
  member,
  onNext,
}: StepBusinessInfoProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6">
      <div className="mt-6">
        <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
          <span className="text-primary-100">신고 정보</span>
          <span className="text-black-100">를 확인해주세요.</span>
        </h1>
      </div>

      <div className="mt-8 flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
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

        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">대표자명</label>
          <Input
            readOnly
            value={member?.representName ?? ""}
            className="border-black-100 bg-black-20 font-bold tracking-wide"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">생년월일</label>
          <Input
            readOnly
            value={member?.birthDate ?? ""}
            className="border-black-100 bg-black-20 font-bold tracking-wide"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">전화번호</label>
          <Input
            readOnly
            value={member?.phoneNumber ?? ""}
            className="border-black-100 bg-black-20 font-bold tracking-wide"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-black-100">
            홈택스 아이디
          </label>
          <Input
            readOnly
            value={member?.hometaxLoginId ?? ""}
            className="border-black-100 bg-black-20 font-bold tracking-wide"
          />
        </div>
      </div>

      <div className="shrink-0 pb-8 pt-8">
        <Button onClick={onNext} size="xl" className="w-full">
          다음
        </Button>
      </div>
    </div>
  );
}
