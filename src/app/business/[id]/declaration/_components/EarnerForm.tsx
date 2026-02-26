"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { IncomeEarner } from "../types";
import { INCOME_TYPE_OPTIONS } from "../types";
import { DateDrumPicker } from "./DateDrumPicker";

interface EarnerFormProps {
  earner: Partial<IncomeEarner>;
  onChange: (earner: Partial<IncomeEarner>) => void;
  onDelete: () => void;
}

const INCOME_CODES_GITA = [
  { code: "76", label: "76(고용관계 없는 일시적 유상 용역)" },
];

const BUSINESS_CODES = [
  { code: "940909", label: "940909(기타 자영업)" },
  { code: "940100", label: "940100(저술가 및 작곡가)" },
  { code: "940903", label: "940903(연예인)" },
  { code: "940906", label: "940906(프리랜서)" },
];

function formatResidentNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 6) return digits;
  return `${digits.slice(0, 6)} ${digits.slice(6)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

function formatAmount(value: number): string {
  if (!value) return "";
  return value.toLocaleString("ko-KR");
}

export function EarnerForm({ earner, onChange, onDelete }: EarnerFormProps) {
  const [incomeTypeOpen, setIncomeTypeOpen] = useState(false);
  const [businessCodeOpen, setBusinessCodeOpen] = useState(false);

  const incomeType = earner.incomeType || "OTHER";
  const amountType = earner.amountType || "pre-tax";

  const update = (fields: Partial<IncomeEarner>) => {
    onChange({ ...earner, ...fields });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* 소득자 이름 */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-base font-bold text-black-100">
            소득자 이름
          </label>
          <Button variant="outline" size="xs" onClick={onDelete}>
            삭제하기
          </Button>
        </div>
        <Input
          type="text"
          value={earner.name || ""}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="이름 입력"
          className="mt-2"
        />
      </div>

      {/* 소득자 주민등록번호 */}
      <div>
        <label className="text-base font-bold text-black-100">
          소득자 주민등록번호
        </label>
        <Input
          type="text"
          inputMode="numeric"
          value={formatResidentNumber(earner.residentNumber || "")}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, 13);
            update({ residentNumber: raw });
          }}
          placeholder="주민등록번호 입력"
          className="mt-2"
        />
      </div>

      {/* 소득자 전화번호 */}
      <div>
        <label className="text-base font-bold text-black-100">
          소득자 전화번호
        </label>
        <Input
          type="tel"
          value={formatPhone(earner.phone || "")}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
            update({ phone: raw });
          }}
          placeholder="전화번호 입력"
          className="mt-2"
        />
      </div>

      {/* 소득 지급 유형 */}
      <div>
        <div className="flex items-center gap-1">
          <label className="text-base font-bold text-black-100">
            소득 지급 유형
          </label>
          <Info size={16} className="text-primary-100" />
        </div>
        <div className="relative mt-2">
          <Button
            variant="outline"
            size="xl"
            onClick={() => setIncomeTypeOpen(!incomeTypeOpen)}
            className="w-full justify-between font-normal"
          >
            <span className="text-base text-black-100">
              {INCOME_TYPE_OPTIONS.find((o) => o.value === incomeType)?.label}
            </span>
            <ChevronDown
              size={20}
              className={`text-black-60 transition-transform ${incomeTypeOpen ? "rotate-180" : ""}`}
            />
          </Button>
          {incomeTypeOpen && (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-black-20 bg-white shadow-lg">
              {INCOME_TYPE_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      update({
                        incomeType: option.value,
                        incomeCode:
                          option.value === "OTHER"
                            ? INCOME_CODES_GITA[0].code
                            : "",
                      });
                      setIncomeTypeOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left text-base ${
                      incomeType === option.value
                        ? "font-bold text-primary-100"
                        : "text-black-100"
                    }`}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* 소득구분코드 / 업종코드 */}
      {incomeType === "OTHER" ? (
        <div>
          <label className="text-base font-bold text-black-100">
            소득구분코드
          </label>
          <Input
            readOnly
            value={INCOME_CODES_GITA[0].label}
            className="mt-2 border-black-100 bg-black-20 text-sm"
          />
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-1">
            <label className="text-base font-bold text-black-100">
              업종코드
            </label>
            <Info size={16} className="text-primary-100" />
          </div>
          <div className="relative mt-2">
            <Button
              variant="outline"
              size="xl"
              onClick={() => setBusinessCodeOpen(!businessCodeOpen)}
              className="w-full justify-between font-normal"
            >
              <span className="text-base text-black-100">
                {earner.incomeCode
                  ? BUSINESS_CODES.find((c) => c.code === earner.incomeCode)
                      ?.label || earner.incomeCode
                  : "업종코드 선택"}
              </span>
              <ChevronDown
                size={20}
                className={`text-black-60 transition-transform ${businessCodeOpen ? "rotate-180" : ""}`}
              />
            </Button>
            {businessCodeOpen && (
              <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-black-20 bg-white shadow-lg">
                {BUSINESS_CODES.map((code) => (
                  <li key={code.code}>
                    <button
                      type="button"
                      onClick={() => {
                        update({ incomeCode: code.code });
                        setBusinessCodeOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm ${
                        earner.incomeCode === code.code
                          ? "font-bold text-primary-100"
                          : "text-black-100"
                      }`}
                    >
                      {code.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* 지급 날짜 */}
      <div>
        <label className="text-base font-bold text-black-100">지급 날짜</label>
        <div className="mt-2">
          <DateDrumPicker
            value={earner.paymentDate || "2026-01-01"}
            onChange={(date) => update({ paymentDate: date })}
          />
        </div>
      </div>

      {/* 소득자 지급액 */}
      <div>
        <label className="text-base font-bold text-black-100">
          소득자 지급액
        </label>
        <div className="mt-2 flex gap-2">
          <Button
            variant={amountType === "pre-tax" ? "default" : "outline"}
            onClick={() => update({ amountType: "pre-tax" })}
            className="rounded-lg"
          >
            세전금액
          </Button>
          <Button
            variant={amountType === "after-tax" ? "default" : "outline"}
            onClick={() => update({ amountType: "after-tax" })}
            className="rounded-lg"
          >
            세후금액
          </Button>
        </div>
        <Input
          type="text"
          inputMode="numeric"
          value={earner.amount ? formatAmount(earner.amount) : ""}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "");
            update({ amount: raw ? parseInt(raw, 10) : 0 });
          }}
          placeholder="금액 입력"
          className="mt-2"
        />
      </div>
    </div>
  );
}
