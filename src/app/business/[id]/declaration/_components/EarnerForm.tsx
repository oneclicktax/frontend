"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChevronDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
} from "@/components/ui/drawer";
import dayjs from "dayjs";
import type { IncomeEarner, IncomeType, AmountType } from "../types";
import { INCOME_TYPE_OPTIONS } from "../types";

interface EarnerFormProps {
  earner: Partial<IncomeEarner>;
  onChange: (earner: Partial<IncomeEarner>) => void;
  onDelete?: () => void;
  belongYear: number;
  belongMonth: number;
}

const INCOME_CODES_GITA = [
  { code: "76", label: "76(고용관계 없는 일시적 유상 용역)" },
];

const BUSINESS_CODES = [
  { code: "940909", label: "940909(기타자영업)" },
  { code: "940926", label: "940926(소프트웨어 프리랜서)" },
  { code: "940927", label: "940927(관광통역안내사)" },
  { code: "940928", label: "940928(어린이통학버스기사)" },
  { code: "940600", label: "940600(자문 고문)" },
  { code: "940100", label: "940100(저술가)" },
  { code: "940200", label: "940200(화가관련)" },
  { code: "940301", label: "940301(작곡가)" },
  { code: "940302", label: "940302(배우)" },
  { code: "940303", label: "940303(모델)" },
  { code: "940304", label: "940304(가수)" },
  { code: "940305", label: "940305(성악가)" },
  { code: "940306", label: "940306(1인미디어콘텐츠창작자)" },
  { code: "940500", label: "940500(연예보조)" },
  { code: "940901", label: "940901(바둑기사)" },
  { code: "940902", label: "940902(꽃꽃이교사)" },
  { code: "940903", label: "940903(학원강사)" },
  { code: "940910", label: "940910(다단계판매)" },
  { code: "940911", label: "940911(기타모집수당)" },
  { code: "940912", label: "940912(간병인)" },
  { code: "940913", label: "940913(대리운전)" },
  { code: "940914", label: "940914(캐디)" },
  { code: "940915", label: "940915(목욕관리자)" },
  { code: "940916", label: "940916(행사도우미)" },
  { code: "940917", label: "940917(심부름용역)" },
  { code: "940918", label: "940918(퀵서비스)" },
  { code: "940919", label: "940919(물품운반)" },
  { code: "940920", label: "940920(학습지방문강사)" },
  { code: "940921", label: "940921(교육교구방문강사)" },
  { code: "940922", label: "940922(대여제품방문점검원)" },
  { code: "940923", label: "940923(대출모집인)" },
  { code: "940924", label: "940924(신용카드 회원모집인)" },
  { code: "940925", label: "940925(방과후강사)" },
  { code: "940929", label: "940929(중고자동차판매원)" },
];

interface EarnerFormValues {
  name: string;
  residentNumber: string;
  phone: string;
  incomeType: IncomeType;
  incomeCode: string;
  paymentDate: string;
  amountType: AmountType;
  amount: string;
}

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

function formatAmount(value: string): string {
  const num = parseInt(value, 10);
  if (!num) return "";
  return num.toLocaleString("ko-KR");
}

export function EarnerForm({
  earner,
  onChange,
  belongYear,
  belongMonth,
}: EarnerFormProps) {
  const [incomeTypeOpen, setIncomeTypeOpen] = useState(false);
  const [businessCodeOpen, setBusinessCodeOpen] = useState(false);
  const [incomeTypeInfoOpen, setIncomeTypeInfoOpen] = useState(false);

  const lastDayOfMonth = dayjs(`${belongYear}-${String(belongMonth).padStart(2, "0")}`).endOf("month");
  const defaultPaymentDate = lastDayOfMonth.format("YYYY-MM-DD");

  const form = useForm<EarnerFormValues>({
    defaultValues: {
      name: earner.name || "",
      residentNumber: earner.residentNumber || "",
      phone: earner.phone || "",
      incomeType: earner.incomeType || "OTHER",
      incomeCode: earner.incomeCode || "76",
      paymentDate: earner.paymentDate || defaultPaymentDate,
      amountType: earner.amountType || "pre-tax",
      amount: earner.amount ? String(earner.amount) : "",
    },
    mode: "onChange",
  });

  // 부모 상태와 동기화
  useEffect(() => {
    const subscription = form.watch((values) => {
      onChange({
        ...earner,
        name: values.name || "",
        residentNumber: values.residentNumber || "",
        phone: values.phone || "",
        incomeType: values.incomeType as IncomeType,
        incomeCode: values.incomeCode || "",
        paymentDate: values.paymentDate || "",
        amountType: values.amountType as AmountType,
        amount: values.amount ? parseInt(values.amount, 10) : 0,
      });
    });
    return () => subscription.unsubscribe();
  }, [form, onChange, earner.id]);

  const incomeType = form.watch("incomeType");
  const amountType = form.watch("amountType");

  return (
    <Form {...form}>
      <div className="flex flex-col gap-5">
        {/* 소득자 이름 */}
        <FormField
          control={form.control}
          name="name"
          rules={{ required: true }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold text-black-100">
                소득자 이름
              </FormLabel>
              <FormControl>
                <Input {...field} type="text" placeholder="이름 입력" />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 소득자 주민등록번호 */}
        <FormField
          control={form.control}
          name="residentNumber"
          rules={{ required: true, pattern: /^\d{13}$/ }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold text-black-100">
                소득자 주민등록번호
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="주민등록번호 입력"
                  value={formatResidentNumber(field.value)}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 13),
                    )
                  }
                  onBlur={field.onBlur}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 소득자 전화번호 */}
        <FormField
          control={form.control}
          name="phone"
          rules={{ required: true, pattern: /^\d{10,11}$/ }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold text-black-100">
                소득자 전화번호
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="전화번호 입력"
                  value={formatPhone(field.value)}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value.replace(/\D/g, "").slice(0, 11),
                    )
                  }
                  onBlur={field.onBlur}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 소득 지급 유형 */}
        <FormField
          control={form.control}
          name="incomeType"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-1">
                <FormLabel className="text-base font-bold text-black-100">
                  소득 지급 유형
                </FormLabel>
                <button
                  type="button"
                  onClick={() => setIncomeTypeInfoOpen(true)}
                >
                  <Info size={16} className="text-black-60" />
                </button>
              </div>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  onClick={() => setIncomeTypeOpen(!incomeTypeOpen)}
                  className="w-full justify-between font-normal"
                >
                  <span className="text-base text-black-100">
                    {INCOME_TYPE_OPTIONS.find((o) => o.value === field.value)
                      ?.label}
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
                            field.onChange(option.value);
                            form.setValue(
                              "incomeCode",
                              option.value === "OTHER"
                                ? INCOME_CODES_GITA[0].code
                                : BUSINESS_CODES[0].code,
                            );
                            setIncomeTypeOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-base ${
                            field.value === option.value
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
            </FormItem>
          )}
        />

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
          <FormField
            control={form.control}
            name="incomeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-bold text-black-100">
                  업종코드
                </FormLabel>
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    onClick={() => setBusinessCodeOpen(!businessCodeOpen)}
                    className="w-full justify-between font-normal"
                  >
                    <span className="text-base text-black-100">
                      {field.value
                        ? BUSINESS_CODES.find((c) => c.code === field.value)
                            ?.label || field.value
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
                              field.onChange(code.code);
                              setBusinessCodeOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left text-sm ${
                              field.value === code.code
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
              </FormItem>
            )}
          />
        )}

        {/* 지급 날짜 (귀속월 말일 고정) */}
        <div>
          <label className="text-base font-bold text-black-100">
            지급 날짜
          </label>
          <Input
            readOnly
            disabled
            value={lastDayOfMonth.format("YYYY. MM. DD")}
            className="mt-2 border-black-100 bg-black-20 text-sm"
          />
        </div>

        {/* 소득자 지급액 */}
        <FormField
          control={form.control}
          name="amount"
          rules={{ required: true, validate: (v) => parseInt(v, 10) > 0 }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-bold text-black-100">
                소득자 지급액
              </FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={amountType === "pre-tax" ? "default" : "outline"}
                  onClick={() => form.setValue("amountType", "pre-tax")}
                  className="rounded-lg"
                >
                  세전금액
                </Button>
                <Button
                  type="button"
                  variant={amountType === "after-tax" ? "default" : "outline"}
                  onClick={() => form.setValue("amountType", "after-tax")}
                  className="rounded-lg"
                >
                  세후금액
                </Button>
              </div>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="금액 입력"
                  value={field.value ? formatAmount(field.value) : ""}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    field.onChange(raw);
                  }}
                  onBlur={field.onBlur}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* 소득 지급 유형 안내 Drawer */}
        <Drawer open={incomeTypeInfoOpen} onOpenChange={setIncomeTypeInfoOpen}>
          <DrawerContent>
            <div className="px-6 pt-6 pb-2">
              <p className="text-base font-bold text-black-100">
                소득 지급 유형은 보통 이렇게 정해요.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-black-60">
                반복 지급은 사업소득, 일회성 지급은 기타소득이에요.
              </p>
            </div>
            <DrawerFooter>
              <Button
                size="xl"
                className="w-full"
                onClick={() => setIncomeTypeInfoOpen(false)}
              >
                확인
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

      </div>
    </Form>
  );
}
