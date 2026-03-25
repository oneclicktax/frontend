"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronRight, Loader2, X } from "lucide-react";
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
import { memberApi, type Member } from "@/lib/api";

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
  termsService: boolean;
  termsPrivacy: boolean;
}

function OnboardingContent() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 회원 정보 조회하여 이미 완료된 단계 스킵
  const { data: member, isLoading: memberLoading } = useQuery<Member>({
    queryKey: ["member", "me", "onboarding"],
    queryFn: async () => {
      return memberApi.getMe();
    },
    staleTime: 0,
  });

  const form = useForm<ReporterForm>({
    defaultValues: {
      name: "",
      birthDate: "",
      phone: "",
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
      await memberApi.updateMe({
        name: data.name.trim(),
        birthDate: data.birthDate,
        phoneNumber: data.phone,
        termsAgreed: true,
      });
      await queryClient.invalidateQueries({ queryKey: ["member"] });
      router.replace("/business/register");
    } catch {
      toast.error("신고자 정보 저장에 실패했습니다.");
    }
  }

  // 약관 동의 완료 시 사업장 등록으로 리다이렉트
  const shouldRedirect = !memberLoading && member?.termsAgreed;
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/business/register");
    }
  }, [shouldRedirect, router]);

  if (memberLoading || shouldRedirect) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-100" />
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        <span className="text-base font-medium tracking-tight text-black-100">
          신고자 정보 입력
        </span>
      </header>

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
