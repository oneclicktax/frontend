"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";

interface Business {
  name: string;
  bizNumber: string;
}

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pendingBizNumber, setPendingBizNumber] = useState("");
  const [pendingName, setPendingName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const rawDigits = input.replace(/\D/g, "");
  const isValidLength = rawDigits.length === 10;

  async function handleSearch() {
    if (!isValidLength || loading) return;

    if (businesses.some((b) => b.bizNumber.replace(/\s/g, "") === rawDigits)) {
      toast.error("이미 등록된 사업장입니다.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(
        `${apiUrl}/api/companies/lookup/${rawDigits}`,
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      setPendingBizNumber(formatBusinessNumber(rawDigits));
      setPendingName(json.data.name);
      setEditingIndex(null);
      setDrawerOpen(true);
    } catch {
      toast.error("존재하지 않는 사업자등록번호입니다.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    const trimmed = pendingName.trim();
    if (!trimmed) return;
    if (editingIndex !== null) {
      setBusinesses((prev) =>
        prev.map((b, i) =>
          i === editingIndex ? { ...b, name: trimmed } : b,
        ),
      );
    } else {
      setBusinesses((prev) => [
        ...prev,
        { name: trimmed, bizNumber: pendingBizNumber },
      ]);
      setInput("");
    }
    closeDrawer();
  }

  function handleDelete() {
    if (editingIndex === null) return;
    setBusinesses((prev) => prev.filter((_, i) => i !== editingIndex));
    closeDrawer();
  }

  function closeDrawer() {
    setPendingBizNumber("");
    setPendingName("");
    setEditingIndex(null);
    setDrawerOpen(false);
  }

  function handleEditClick(index: number) {
    const biz = businesses[index];
    setPendingBizNumber(biz.bizNumber);
    setPendingName(biz.name);
    setEditingIndex(index);
    setDrawerOpen(true);
  }

  async function handleSubmit() {
    if (businesses.length === 0 || submitting) return;
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businesses: businesses.map((b) => ({
            name: b.name,
            bizNumber: b.bizNumber.replace(/\s/g, ""),
          })),
        }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/home");
    } catch {
      toast.error("사업장 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-6"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium tracking-tight text-black-100">
          사업장 등록
        </span>
      </header>

      {step === 1 ? (
        <div className="flex flex-1 flex-col px-6">
          <div className="mt-6">
            <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
              <span className="text-primary-100">홈택스 연동해서</span>
              <br />
              <span className="text-black-100">
                사업장 정보를 한 번에 가져올까요?
              </span>
            </h1>
          </div>

          <div className="mt-auto flex flex-col items-center gap-3 pb-8">
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
              className="text-black-60"
            >
              사업장 수기로 입력할래요.
            </Button>
            <Button
              size="xl"
              className="w-full"
              onClick={() =>
                toast.info("홈택스 연동 기능은 준비 중입니다.")
              }
            >
              홈택스 연동하기
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-6">
          <div className="mt-6">
            <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
              사업장 정보를 입력해주세요 ({businesses.length}/5)
            </h1>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {businesses.map((biz, index) => (
              <Input
                key={index}
                readOnly
                value={`${biz.bizNumber}(${biz.name})`}
                className="cursor-pointer border-primary-100 font-bold"
                onClick={() => handleEditClick(index)}
              />
            ))}

            <div className="flex items-center gap-2 rounded-xl border border-black-20 px-4 py-3">
              <input
                type="text"
                inputMode="numeric"
                placeholder="사업장 번호 입력"
                value={input}
                onChange={(e) =>
                  setInput(formatBusinessNumber(e.target.value))
                }
                disabled={loading}
                className="flex-1 text-base text-black-100 placeholder:text-black-40 outline-none disabled:bg-transparent"
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={!isValidLength || loading}
                aria-label="조회"
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
          </div>

          <div className="mt-auto pb-8 pt-8">
            <Button
              size="xl"
              className="w-full"
              disabled={businesses.length === 0}
              onClick={handleSubmit}
            >
              {submitting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "저장"
              )}
            </Button>
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">
              사업자 정보 확인
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-6 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black-100">
                사업자등록번호
              </label>
              <Input
                value={pendingBizNumber}
                disabled
                className="border-black-20 bg-black-20 font-bold"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black-100">
                상호명
              </label>
              <Input
                value={pendingName}
                onChange={(e) => setPendingName(e.target.value)}
              />
            </div>
          </div>
          <DrawerFooter className={editingIndex !== null ? "flex-row gap-3" : ""}>
            {editingIndex !== null && (
              <Button
                variant="outline"
                size="xl"
                className="flex-1"
                onClick={handleDelete}
              >
                삭제
              </Button>
            )}
            <Button
              size="xl"
              className={editingIndex !== null ? "flex-1" : "w-full"}
              disabled={!pendingName.trim()}
              onClick={handleConfirm}
            >
              {editingIndex !== null ? "저장" : "등록"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
