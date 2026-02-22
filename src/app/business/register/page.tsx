"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

interface Business {
  name: string;
  number: string;
}

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingBusiness, setPendingBusiness] = useState<Business | null>(null);

  const MAX_BUSINESSES = 5;

  const { data: existingBusinesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return (json.data ?? []).map((b: any) => ({
        name: b.name,
        number: formatBusinessNumber(b.bizNumber),
      }));
    },
  });

  useEffect(() => {
    if (existingBusinesses.length > 0 && businesses.length === 0) {
      setBusinesses(existingBusinesses);
    }
  }, [existingBusinesses]);

  const rawDigits = input.replace(/\D/g, "");
  const isValidLength = rawDigits.length === 10;

  async function handleAdd() {
    if (!isValidLength || loading) return;
    if (businesses.length >= MAX_BUSINESSES) {
      toast.error("사업장은 최대 5개까지 등록할 수 있습니다.");
      return;
    }

    if (businesses.some((b) => b.number.replace(/\s/g, "") === rawDigits)) {
      toast.error("이미 목록에 있는 사업장입니다.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies/lookup/${rawDigits}`);
      if (!res.ok) throw new Error("조회 실패");

      const json = await res.json();
      setPendingBusiness({
        name: json.data.name,
        number: formatBusinessNumber(rawDigits),
      });
      setDrawerOpen(true);
    } catch {
      toast.error("존재하지 않는 사업자등록번호입니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!pendingBusiness) return;
    setBusinesses((prev) => [...prev, pendingBusiness]);
    setPendingBusiness(null);
    setDrawerOpen(false);
    setInput("");
  }

  function handleRemove(index: number) {
    setBusinesses((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    try {
      const res = await fetchWithAuth(`${apiUrl}/api/companies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businesses: businesses.map((b) => ({
            name: b.name,
            bizNumber: b.number.replace(/\s/g, ""),
          })),
        }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/home");
    } catch {
      toast.error("사업장 저장에 실패했습니다.");
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-5">
      {/* 상단 바 */}
      <header className="relative flex h-14 items-center justify-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-0"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium text-black-100">
          사업장 등록
        </span>
      </header>

      {/* 본문 */}
      <div className="flex-1">
        <h1 className="mt-4 text-xl font-bold text-black-100">
          사업자등록번호를 입력해주세요
        </h1>

        <label className="mt-6 block text-sm font-medium text-black-100">
          사업자등록번호
        </label>

        {/* 입력 필드 */}
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-black-20 px-4 py-3">
          <input
            type="text"
            inputMode="numeric"
            placeholder="숫자만 입력해주세요."
            value={input}
            onChange={(e) => setInput(formatBusinessNumber(e.target.value))}
            disabled={loading}
            className="flex-1 text-base text-black-100 placeholder:text-black-40 outline-none disabled:bg-transparent"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!isValidLength || loading}
            aria-label="추가"
          >
            {loading ? (
              <Loader2 size={24} className="animate-spin text-primary-100" />
            ) : (
              <PlusCircle
                size={24}
                className={
                  isValidLength ? "text-primary-100" : "text-black-40"
                }
              />
            )}
          </button>
        </div>

        {/* 등록된 사업장 목록 */}
        <ul className="mt-3 flex flex-col gap-2">
          {businesses.map((biz, index) => (
            <li
              key={index}
              className="flex items-center gap-2 rounded-xl border border-primary-100 px-4 py-3"
            >
              <span className="flex-1 text-sm text-black-100 break-all">
                {biz.name}({biz.number})
              </span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label="삭제"
              >
                <XCircle size={24} className="text-primary-100" />
              </button>
            </li>
          ))}
        </ul>

        {/* 홈택스 연동 */}
        <Link
          href="/business/hometax"
          className="mt-3 flex items-center justify-center rounded-xl border border-black-20 px-4 py-3 text-sm text-black-80"
        >
          홈택스 연동하고 한 번에 불러오기
        </Link>
      </div>

      {/* 확인 버튼 */}
      <div className="py-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={false}
          className="w-full rounded-2xl bg-primary-100 py-4 text-base font-bold text-white disabled:bg-primary-40"
        >
          저장({businesses.length} / {MAX_BUSINESSES})
        </button>
      </div>

      {/* 사업장 확인 Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>이 사업장 정보가 맞나요?</DrawerTitle>
            {pendingBusiness && (
              <DrawerDescription>
                {pendingBusiness.name}({pendingBusiness.number})
              </DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3">
            <DrawerClose asChild>
              <button
                type="button"
                className="flex-1 rounded-2xl border border-black-20 py-4 text-base font-bold text-black-80"
              >
                취소
              </button>
            </DrawerClose>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 rounded-2xl bg-primary-100 py-4 text-base font-bold text-white"
            >
              등록
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
