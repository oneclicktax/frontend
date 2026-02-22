"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Settings, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import type { Business } from "@/mocks/businesses";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

type Category = "전체" | "지급대장" | "원천세" | "지급명세서";

interface Document {
  id: number;
  name: string;
  category: string;
  month: number;
}

const categories: Category[] = ["전체", "지급대장", "원천세", "지급명세서"];

const months = [
  { value: 0, label: "전체" },
  { value: 1, label: "1월" },
  { value: 2, label: "2월" },
  { value: 3, label: "3월" },
  { value: 4, label: "4월" },
  { value: 5, label: "5월" },
  { value: 6, label: "6월" },
  { value: 7, label: "7월" },
  { value: 8, label: "8월" },
  { value: 9, label: "9월" },
  { value: 10, label: "10월" },
  { value: 11, label: "11월" },
  { value: 12, label: "12월" },
];

export default function DocumentsPage() {
  const router = useRouter();
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<Category>("전체");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: businesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/businesses");
      if (!res.ok) throw new Error();
      return res.json();
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
    if (selectedCategory !== "전체" && doc.category !== selectedCategory)
      return false;
    if (selectedMonth !== 0 && doc.month !== selectedMonth) return false;
    return true;
  });

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
        onClick={() => setDrawerOpen(true)}
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

      {/* 월 필터 */}
      <div className="scrollbar-hide mt-2.5 flex gap-2.5 overflow-x-auto">
        {months.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelectedMonth(m.value)}
            className={`flex h-[38px] shrink-0 items-center justify-center rounded-lg px-2.5 text-xs font-medium ${
              selectedMonth === m.value
                ? "bg-primary-100 text-white"
                : "border border-black-40 bg-white text-black-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 문서 테이블 */}
      <div className="mt-5">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-black-60">
            문서 이름
          </span>
          <span className="text-base font-semibold text-black-60">
            다운로드
          </span>
        </div>

        {/* 문서 목록 */}
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
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
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
                  setDrawerOpen(false);
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
    </div>
  );
}
