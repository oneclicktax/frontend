"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@/components/wheel-picker/wheel-picker";

interface Business {
  id: number;
  name: string;
  number: string;
}

interface Document {
  id: number;
  name: string;
  category: string;
  month: number;
}

type Category = "전체" | "신고내역" | "원천세" | "지급명세서";

const categories: Category[] = ["전체", "신고내역", "원천세", "지급명세서"];

const categoryDocTypes: Record<Category, string[] | null> = {
  전체: null,
  신고내역: ["지급대장", "지급내역서"],
  원천세: ["국세 접수증", "국세 납부서", "지방세 접수증", "지방세 납부서", "원천징수이행 상황신고서"],
  지급명세서: ["간이지급명세서"],
};

export default function DocumentsPage() {
  const router = useRouter();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null,
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [businessDrawerOpen, setBusinessDrawerOpen] = useState(false);
  const [dateDrawerOpen, setDateDrawerOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const [draftYear, setDraftYear] = useState(currentYear);
  const [draftMonth, setDraftMonth] = useState(1);

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return (json.data ?? []).map((b: any) => ({
        id: b.id,
        name: b.name,
        number: b.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, "$1 $2 $3"),
      }));
    },
  });

  const businessId = selectedBusinessId ?? businesses[0]?.id;

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["documents", businessId],
    queryFn: async () => {
      const res = await fetchWithAuth(`/api/business/${businessId}/documents`);
      if (!res.ok) throw new Error();
      return res.json();
    },
    enabled: !!businessId,
  });

  const selectedBusiness = businesses.find((b) => b.id === businessId);

  const filtered = documents.filter((doc) => {
    const docTypes = categoryDocTypes[selectedCategory];
    if (docTypes && !docTypes.some((type) => doc.name.includes(type))) {
      return false;
    }
    if (selectedMonth !== null && doc.month !== selectedMonth) return false;
    return true;
  });

  const yearOptions: WheelPickerOption<number>[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        label: `${currentYear - 2 + i}년`,
        value: currentYear - 2 + i,
      })),
    [currentYear],
  );

  const monthOptions: WheelPickerOption<number>[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        label: `${i + 1}월`,
        value: i + 1,
      })),
    [],
  );

  const handleOpenDatePicker = () => {
    setDraftYear(selectedYear ?? currentYear);
    setDraftMonth(selectedMonth ?? 1);
    setDateDrawerOpen(true);
  };

  const handleConfirmDate = () => {
    setSelectedYear(draftYear);
    setSelectedMonth(draftMonth);
    setDateDrawerOpen(false);
  };

  const dateLabel =
    selectedYear !== null && selectedMonth !== null
      ? `${String(selectedYear).slice(2)}년 ${selectedMonth}월`
      : null;

  return (
    <div className="px-5">
      {/* 상단 바 */}
      <header className="flex h-14 items-center justify-between">
        <span className="text-base font-bold text-black-100">
          원클릭 원천세
        </span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/profile/alerts")}
            aria-label="알림"
          >
            <Bell size={24} className="text-black-100" />
          </button>
          <button type="button" aria-label="설정">
            <Settings size={24} className="text-black-100" />
          </button>
        </div>
      </header>

      {/* 사업장 선택 */}
      <button
        type="button"
        onClick={() => setBusinessDrawerOpen(true)}
        className="mt-2 flex items-center gap-1.5 rounded-full bg-black-10 px-4 py-3"
      >
        <span className="text-base font-bold text-black-100">
          {selectedBusiness?.name ?? "사업장 선택"}
        </span>
        <ChevronDown size={20} className="text-black-100" />
      </button>

      {/* 카테고리 필터 */}
      <div className="mt-4 flex gap-2.5">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`flex h-[38px] items-center justify-center rounded-lg px-2.5 text-xs font-medium ${
              selectedCategory === cat
                ? "bg-primary-100 text-white"
                : "border border-black-40 bg-white text-black-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 월 선택 카드 */}
      <button
        type="button"
        onClick={handleOpenDatePicker}
        className="mt-4 flex h-12 w-full items-center justify-between rounded-lg bg-white px-4 shadow-[0px_0px_14px_0px_rgba(0,0,0,0.13)]"
      >
        <span
          className={`text-sm font-bold ${dateLabel ? "text-black-100" : "text-black-40"}`}
        >
          {dateLabel ?? "월 선택"}
        </span>
        <ChevronDown size={24} className="text-black-60" />
      </button>

      {/* 문서 테이블 */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-black-60">
            문서 이름
          </span>
          <span className="text-base font-semibold text-black-60">
            다운로드
          </span>
        </div>

        <ul className="mt-4 flex flex-col gap-4">
          {filtered.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between border-b border-black-20 pb-3"
            >
              <span className="text-base font-medium text-black-100">
                {doc.name}
              </span>
              <button
                type="button"
                className="shrink-0 text-base font-medium text-[#3629b7] underline"
                onClick={() => {
                  // TODO: 다운로드 처리
                }}
              >
                다운
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-8 text-center text-sm text-black-60">
              해당 조건의 문서가 없습니다.
            </li>
          )}
        </ul>
      </div>

      {/* 사업장 선택 Drawer */}
      <Drawer open={businessDrawerOpen} onOpenChange={setBusinessDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>사업장 선택</DrawerTitle>
            <DrawerDescription>
              문서를 확인할 사업장을 선택하세요.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-1 px-4 pb-6">
            {businesses.map((biz) => (
              <button
                key={biz.id}
                type="button"
                onClick={() => {
                  setSelectedBusinessId(biz.id);
                  setBusinessDrawerOpen(false);
                }}
                className={`rounded-xl px-4 py-3 text-left ${
                  biz.id === businessId ? "bg-primary-40" : ""
                }`}
              >
                <p className="text-base font-bold text-black-100">
                  {biz.name}
                </p>
                <p className="text-sm text-black-60">{biz.number}</p>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      {/* 연/월 선택 Drawer */}
      <Drawer open={dateDrawerOpen} onOpenChange={setDateDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center text-base font-bold text-black-100">
              연/월 선택
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex justify-center px-6 py-4">
            <WheelPickerWrapper className="w-full border-none shadow-none">
              <WheelPicker<number>
                options={yearOptions}
                value={draftYear}
                onValueChange={(v) => setDraftYear(v)}
              />
              <WheelPicker<number>
                options={monthOptions}
                value={draftMonth}
                onValueChange={(v) => setDraftMonth(v)}
              />
            </WheelPickerWrapper>
          </div>

          <DrawerFooter>
            <Button onClick={handleConfirmDate} size="xl" className="w-full">
              선택 완료
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
