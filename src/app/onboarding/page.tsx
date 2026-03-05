"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, ChevronRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";

const TERMS_URLS = {
  termsService: "https://www.notion.so/314ae3b5258380768d85f85921ff23c4",
  termsPrivacy:
    "https://www.notion.so/ec9ae3b525838352bfda011dcc252572?v=ab1ae3b5258383fea091884b91e0367f&p=314ae3b5258380409a13dc2e3c2984c1&pm=s",
} as const;
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";

function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`;
}

interface ReporterForm {
  name: string;
  birthDate: string;
  phone: string;
  hometaxId: string;
  termsService: boolean;
  termsPrivacy: boolean;
}

type OnboardingStep = 1 | 2;

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<OnboardingStep>(1);

  // 회원 정보 조회하여 이미 완료된 단계 스킵
  const { data: member, isLoading: memberLoading } = useQuery<{
    name: string;
    phoneNumber: string | null;
    birthDate: string | null;
    hometaxUserId: string | null;
    termsAgreed: boolean;
  }>({
    queryKey: ["member", "me", "onboarding"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
    staleTime: 0,
  });

  // 약관 동의 완료 시 즉시 2단계로 설정 (useEffect 대신 동기 처리로 플리커링 방지)
  const effectiveStep: OnboardingStep =
    member?.termsAgreed ? 2 : step;

  const form = useForm<ReporterForm>({
    defaultValues: {
      name: "",
      birthDate: "",
      phone: "",
      hometaxId: "",
      termsService: false,
      termsPrivacy: false,
    },
    mode: "onChange",
  });

  const { isValid, isSubmitting } = form.formState;

  // 약관 상세보기
  const [termsView, setTermsView] = useState<{
    field: "termsService" | "termsPrivacy";
    title: string;
    url: string;
  } | null>(null);


  async function onSubmitReporter(data: ReporterForm) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name.trim(),
          birthDate: data.birthDate,
          phoneNumber: data.phone,
          hometaxUserId: data.hometaxId.trim(),
          termsAgreed: true,
        }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["member"] });
      setStep(2);
    } catch {
      toast.error("신고자 정보 저장에 실패했습니다.");
    }
  }

  const handleBack = () => {
    router.replace("/home");
  };

  const headerTitle = effectiveStep === 1 ? "신고자 정보 입력" : "사업장 등록";

  if (memberLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-100" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        {effectiveStep !== 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="absolute left-6"
            aria-label="뒤로가기"
          >
            <ArrowLeft size={24} className="text-black-100" />
          </button>
        )}
        <span className="text-base font-medium tracking-tight text-black-100">
          {headerTitle}
        </span>
      </header>

      {/* 1단계: 신고자 정보 입력 */}
      {effectiveStep === 1 && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmitReporter)}
            className="flex flex-1 flex-col px-6"
          >
            <div className="mt-6">
              <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
                신고자 정보를 입력해주세요
              </h1>
            </div>

            <div className="mt-8 flex flex-col gap-5">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: true, minLength: 1 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-black-100">
                      이름
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="이름 입력"
                        className="placeholder:text-black-40"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthDate"
                rules={{ required: true, pattern: /^\d{8}$/ }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-black-100">
                      생년월일
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="1997 10 21"
                        className="placeholder:text-black-40"
                        value={formatBirthDate(field.value)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/\D/g, "").slice(0, 8),
                          )
                        }
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                rules={{ required: true, pattern: /^\d{10,11}$/ }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-black-100">
                      전화번호
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="010 1234 1234"
                        className="placeholder:text-black-40"
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

              <FormField
                control={form.control}
                name="hometaxId"
                rules={{ required: true, minLength: 1 }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-bold text-black-100">
                      홈택스 아이디
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="text"
                        placeholder="홈택스 아이디 입력"
                        className="placeholder:text-black-40"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 약관 동의 */}
            <div className="mt-6 flex flex-col gap-3">
              <FormField
                control={form.control}
                name="termsService"
                rules={{ validate: (v) => v === true }}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                        field.value
                          ? "bg-primary-100 text-white"
                          : "border border-black-40 text-transparent"
                      }`}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTermsView({
                          field: "termsService",
                          title: "서비스 이용약관",
                          url: TERMS_URLS.termsService,
                        })
                      }
                      className="flex flex-1 items-center justify-between"
                    >
                      <span className="text-sm text-black-100">
                        서비스 이용약관(필수)
                      </span>
                      <ChevronRight size={16} className="text-black-60" />
                    </button>
                  </div>
                )}
              />

              <FormField
                control={form.control}
                name="termsPrivacy"
                rules={{ validate: (v) => v === true }}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                        field.value
                          ? "bg-primary-100 text-white"
                          : "border border-black-40 text-transparent"
                      }`}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTermsView({
                          field: "termsPrivacy",
                          title: "개인정보 처리방침",
                          url: TERMS_URLS.termsPrivacy,
                        })
                      }
                      className="flex flex-1 items-center justify-between"
                    >
                      <span className="text-sm text-black-100">
                        개인정보 처리방침(필수)
                      </span>
                      <ChevronRight size={16} className="text-black-60" />
                    </button>
                  </div>
                )}
              />
            </div>

            <div className="mt-auto pb-8 pt-8">
              <Button
                type="submit"
                size="xl"
                className="w-full"
                disabled={!isValid || isSubmitting}
              >
                다음
              </Button>
            </div>
          </form>
        </Form>
      )}

      {/* 약관 상세보기 */}
      {termsView && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-black-20 px-6">
            <button
              type="button"
              onClick={() => setTermsView(null)}
              className="absolute right-6"
              aria-label="닫기"
            >
              <X size={24} className="text-black-100" />
            </button>
            <span className="text-base font-medium text-black-100">
              {termsView.title}
            </span>
          </header>

          <div className="flex-1 overflow-hidden">
            <iframe
              src={termsView.url}
              className="h-full w-full border-none"
              title={termsView.title}
            />
          </div>

          <div className="shrink-0 border-t border-black-20 px-6 pb-8 pt-4">
            <Button
              size="xl"
              className="w-full"
              onClick={() => {
                form.setValue(termsView.field, true, { shouldValidate: true });
                setTermsView(null);
              }}
            >
              동의하기
            </Button>
          </div>
        </div>
      )}

      {/* 2단계: 사업장 등록 - 홈택스 연동 선택 */}
      {effectiveStep === 2 && (
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
              onClick={() => router.replace("/business/register")}
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
      )}

    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary-100" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
