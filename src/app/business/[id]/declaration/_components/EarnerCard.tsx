"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncomeEarner } from "../types";
import { INCOME_TYPE_OPTIONS } from "../types";

interface EarnerCardProps {
  earner: IncomeEarner;
  onEdit: () => void;
}

function formatResidentNumber(raw: string): string {
  if (raw.length <= 6) return raw;
  return `${raw.slice(0, 6)} ${raw.slice(6)}`;
}

function formatPhone(raw: string): string {
  if (raw.length <= 3) return raw;
  if (raw.length <= 7) return `${raw.slice(0, 3)} ${raw.slice(3)}`;
  return `${raw.slice(0, 3)} ${raw.slice(3, 7)} ${raw.slice(7)}`;
}

export function EarnerCard({ earner, onEdit }: EarnerCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-primary-100 p-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={24} className="text-primary-100" />
          <span className="text-base font-semibold text-black-100">
            {earner.name}
          </span>
        </div>
        <ChevronDown
          size={20}
          className={`text-black-60 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-base text-black-100">주민등록번호</span>
            <span className="text-base font-semibold text-black-100">
              {formatResidentNumber(earner.residentNumber)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-black-100">전화번호</span>
            <span className="text-base font-semibold text-black-100">
              {formatPhone(earner.phone)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-black-100">지급 날짜</span>
            <span className="text-base font-semibold text-black-100">
              {format(parseISO(earner.paymentDate), "yyyy. MM. dd")}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-black-100">소득 지급 유형</span>
            <span className="text-base font-semibold text-black-100">
              {INCOME_TYPE_OPTIONS.find((o) => o.value === earner.incomeType)?.label}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-base text-black-100">
              소득자 지급액({earner.amountType === "pre-tax" ? "세전" : "세후"})
            </span>
            <span className="text-base font-semibold text-black-100">
              {earner.amount.toLocaleString("ko-KR")}원
            </span>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              수정하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
