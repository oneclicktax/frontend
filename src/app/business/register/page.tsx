"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { companyApi, hometaxApi, memberApi, type Member, type HometaxAuthStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  BusinessRegisterForm,
  type Business,
} from "@/components/BusinessRegisterForm";

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
}

function BusinessRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const step = searchParams.get("step") === "2" ? 2 : 1;

  // ── step=2 수기 입력 상태 ──
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: existingBusinesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const data = await companyApi.getAll();
      return data.map((b) => ({
        id: b.id,
        name: b.name,
        bizNumber: formatBusinessNumber(b.bizNumber),
      }));
    },
  });

  useEffect(() => {
    if (existingBusinesses.length > 0 && businesses.length === 0) {
      setBusinesses(existingBusinesses);
    }
  }, [existingBusinesses]);

  async function handleSave() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await companyApi.save(
        businesses.map((b) => ({
          name: b.name,
          bizNumber: b.bizNumber.replace(/\s/g, ""),
        })),
      );
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      await queryClient.invalidateQueries({ queryKey: ["member-me"] });
      router.push("/home");
    } catch {
      toast.error("저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── step=1 홈택스 연동 상태 ──
  const { data: member } = useQuery<Member>({
    queryKey: ["member", "me"],
    queryFn: () => memberApi.getMe(),
    enabled: step === 1,
  });

  const [hometaxJobId, setHometaxJobId] = useState<string | null>(null);
  const [selectedBizNumbers, setSelectedBizNumbers] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSelection, setShowSelection] = useState(false);

  const { data: jobStatus } = useQuery<HometaxAuthStatus>({
    queryKey: ["hometax", "job", hometaxJobId],
    queryFn: () => hometaxApi.getAuthStatus(hometaxJobId!),
    enabled: !!hometaxJobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "COMPLETED" || status === "FAILED") return false;
      return 3000;
    },
  });

  const isLinking = !!hometaxJobId && jobStatus?.status !== "COMPLETED" && jobStatus?.status !== "FAILED";
  const hometaxMessage = jobStatus?.message ?? null;
  const hometaxBusinesses = jobStatus?.businesses ?? [];

  useEffect(() => {
    if (jobStatus?.status === "COMPLETED") {
      setShowSelection(true);
    } else if (jobStatus?.status === "FAILED") {
      toast.error(jobStatus.message || "홈택스 연동에 실패했습니다.");
    }
  }, [jobStatus?.status]);

  async function handleHometaxLink() {
    if (!member) return;
    setHometaxJobId(null);
    try {
      const res = await hometaxApi.requestAuth({
        name: member.name,
        birthDate: member.birthDate,
        phoneNumber: member.phoneNumber,
      });
      setHometaxJobId(res.jobId);
    } catch {
      toast.error("홈택스 연동 요청에 실패했습니다.");
    }
  }

  function toggleBusiness(bizNumber: string) {
    setSelectedBizNumbers((prev) => {
      const next = new Set(prev);
      if (next.has(bizNumber)) {
        next.delete(bizNumber);
      } else if (next.size < 5) {
        next.add(bizNumber);
      } else {
        toast.error("최대 5개까지 선택할 수 있습니다.");
      }
      return next;
    });
  }

  async function handleSyncCompanies() {
    const selected = hometaxBusinesses.filter((b) =>
      selectedBizNumbers.has(b.bizNumber),
    );
    if (selected.length === 0) {
      toast.error("사업장을 1개 이상 선택해주세요.");
      return;
    }

    setIsSyncing(true);
    try {
      await companyApi.save(
        selected.map((b) => ({
          name: b.name,
          bizNumber: b.bizNumber.replace(/-/g, ""),
        })),
      );
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      toast.success("사업장 등록이 완료되었습니다.");
      router.replace("/home");
    } catch {
      toast.error("사업장 등록에 실패했습니다.");
    } finally {
      setIsSyncing(false);
    }
  }

  const headerTitle = showSelection ? "사업장 선택" : "사업장 등록";

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-6"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium tracking-tight text-black-100">
          {headerTitle}
        </span>
      </header>

      {/* step=1: 홈택스 연동 유도 */}
      {step === 1 && !showSelection && (
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
              onClick={() => router.push("/business/register?step=2")}
              className="text-black-60"
            >
              사업장 수기로 입력할래요.
            </Button>
            <Button
              size="xl"
              className="w-full"
              onClick={handleHometaxLink}
            >
              홈택스 연동하기
            </Button>
          </div>
        </div>
      )}

      {/* 홈택스 연동 로딩 오버레이 */}
      {isLinking && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <Loader2 size={48} className="animate-spin text-primary-100" />
          <p className="mt-4 text-base font-medium text-black-100">
            {hometaxMessage || "홈택스 연동 준비 중..."}
          </p>
          <p className="mt-2 text-sm text-black-40">잠시만 기다려주세요</p>
        </div>
      )}

      {/* step=1 → 홈택스 연동 완료 후: 사업장 선택 */}
      {step === 1 && showSelection && (
        <div className="flex flex-1 flex-col px-6">
          <div className="mt-6">
            <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
              사업장을 선택해주세요
            </h1>
            <p className="mt-2 text-sm text-black-60">
              최대 5개까지 선택할 수 있습니다. (
              {selectedBizNumbers.size}/
              {Math.min(hometaxBusinesses.length, 5)})
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {hometaxBusinesses.map((biz) => {
              const isSelected = selectedBizNumbers.has(biz.bizNumber);
              return (
                <button
                  key={biz.bizNumber}
                  type="button"
                  onClick={() => toggleBusiness(biz.bizNumber)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? "border-primary-100 bg-primary-100/5"
                      : "border-black-20"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                      isSelected
                        ? "bg-primary-100 text-white"
                        : "border border-black-40 text-transparent"
                    }`}
                  >
                    <Check size={14} />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-black-100">
                      {biz.name}
                    </span>
                    <span className="text-xs text-black-60">
                      {biz.bizNumber} · {biz.status}
                    </span>
                  </div>
                  <Building2 size={20} className="shrink-0 text-black-40" />
                </button>
              );
            })}
          </div>

          <div className="mt-auto pb-8 pt-8">
            <Button
              size="xl"
              className="w-full"
              disabled={selectedBizNumbers.size === 0 || isSyncing}
              onClick={handleSyncCompanies}
            >
              {isSyncing ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  등록 중...
                </>
              ) : (
                `선택한 사업장 등록 (${selectedBizNumbers.size}개)`
              )}
            </Button>
          </div>
        </div>
      )}

      {/* step=2: 수기 입력 */}
      {step === 2 && (
        <div className="flex flex-1 flex-col">
          <div className="px-6 mt-6">
            <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
              사업장을 등록해주세요.
            </h1>
          </div>

          <BusinessRegisterForm
            businesses={businesses}
            onBusinessesChange={setBusinesses}
            onSave={handleSave}
            saving={submitting}
          />
        </div>
      )}
    </div>
  );
}

export default function BusinessRegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center">
          <Loader2 size={32} className="animate-spin text-primary-100" />
        </div>
      }
    >
      <BusinessRegisterContent />
    </Suspense>
  );
}
