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
      setBusinesses((prev) => [
        ...prev,
        { name: json.data.name, bizNumber: formatBusinessNumber(rawDigits) },
      ]);
      setInput("");
      setDrawerOpen(false);
    } catch {
      toast.error("존재하지 않는 사업자등록번호입니다.");
    } finally {
      setLoading(false);
    }
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
              사업장 정보를 입력해주세요
            </h1>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {businesses.map((biz, index) => (
              <div key={index} className="flex flex-col gap-2">
                <label className="text-base font-bold text-black-100">
                  사업장명
                </label>
                <Input
                  readOnly
                  value={`${biz.name}(${biz.bizNumber})`}
                  className="border-primary-100 font-bold"
                />
                <label className="text-base font-bold text-black-100">
                  사업자등록번호
                </label>
                <Input
                  readOnly
                  value={biz.bizNumber}
                  className="border-primary-100 font-bold"
                />
              </div>
            ))}

            <Button
              variant="outline"
              size="xl"
              onClick={() => {
                setInput("");
                setDrawerOpen(true);
              }}
              className="w-full justify-between font-light"
            >
              <span>사업장 추가 등록</span>
              <PlusCircle size={24} className="text-primary-100" />
            </Button>
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
                "확인"
              )}
            </Button>
          </div>
        </div>
      )}

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center">
              사업자등록번호 입력
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-6 py-4">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="숫자만 입력해주세요"
              value={input}
              onChange={(e) =>
                setInput(formatBusinessNumber(e.target.value))
              }
              disabled={loading}
            />
          </div>
          <DrawerFooter>
            <Button
              size="xl"
              className="w-full"
              disabled={!isValidLength || loading}
              onClick={handleSearch}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                "조회"
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
