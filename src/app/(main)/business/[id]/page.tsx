"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  CircleAlert,
  Lock,
  Loader2,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import {
  MonthScroller,
  type MonthItem,
  type MonthStatus,
} from "@/components/MonthScroller";
import { FilingInfoDrawer } from "./_components/FilingInfoDrawer";
import { DraftConfirmDrawer } from "./_components/DraftConfirmDrawer";

type TaxStatus =
  | "required"
  | "completed"
  | "overdue"
  | "hometax_required"
  | "empty"
  | "error_resolving"
  | "refile_required";

interface TaxSchedule {
  label: string;
  deadline: string;
  status: TaxStatus;
}

type MonthStatusType = "default" | "completed" | "locked" | "error";

interface Business {
  id: number;
  name: string;
  number: string;
}

interface MemberMe {
  name: string;
  phoneNumber: string | null;
  hometaxUserId: string | null;
  birthDate: string | null;
  representName: string | null;
}

function isMemberInfoComplete(member: MemberMe | undefined): boolean {
  if (!member) return false;
  return (
    !!member.name?.trim() &&
    !!member.phoneNumber?.trim() &&
    !!member.hometaxUserId?.trim() &&
    !!member.birthDate?.trim() &&
    !!member.representName?.trim()
  );
}

function getDraftKey(businessId: number, year: number, month: number) {
  return `Oneclicktax.draft_${businessId}_${year}_${month}`;
}

function hasDraft(businessId: number, year: number, month: number): boolean {
  try {
    const raw = localStorage.getItem(getDraftKey(businessId, year, month));
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

function StatusIcon({ status }: { status: TaxStatus }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 size={20} className="text-primary-100" />;
    case "overdue":
    case "error_resolving":
    case "refile_required":
      return <CircleAlert size={20} className="text-error-100" />;
    case "hometax_required":
      return <Lock size={20} className="text-success-100" />;
    default:
      return <CheckCircle2 size={20} className="text-black-40" />;
  }
}

function StatusLabel({ status }: { status: TaxStatus }) {
  switch (status) {
    case "required":
      return <span className="text-sm font-bold text-black-100">신고 필요</span>;
    case "completed":
      return <span className="text-sm font-bold text-primary-100">신고 완료</span>;
    case "overdue":
      return <span className="text-sm font-bold text-black-100">신고 필요</span>;
    case "hometax_required":
      return <span className="text-sm font-bold text-black-40">연동 필요</span>;
    case "error_resolving":
      return <span className="text-sm font-bold text-error-100">오류 해결중</span>;
    case "refile_required":
      return <span className="text-sm font-bold text-error-100">재신고 필요</span>;
    default:
      return null;
  }
}

function DeadlineLabel({
  status,
  deadline,
}: {
  status: TaxStatus;
  deadline: string;
}) {
  switch (status) {
    case "required":
    case "completed":
      return <p className="text-xs text-black-60">{deadline}</p>;
    case "overdue":
      return <p className="text-xs text-black-60">기한 후</p>;
    case "hometax_required":
      return <p className="text-xs text-black-60">홈택스</p>;
    default:
      return null;
  }
}

function InfoBanner({ status }: { status: TaxStatus }) {
  if (status === "hometax_required") {
    return (
      <div className="rounded-2xl bg-black-20/50 px-4 py-4">
        <p className="text-sm font-medium text-black-100">
          신고내역을 확인하고 싶어요
        </p>
        <p className="mt-1 text-xs text-black-60 leading-relaxed">
          원천세 신고내역을 확인하기 위해서는 간편인증을 통해 홈택스 연동이
          필요해요.
        </p>
      </div>
    );
  }
  if (status === "error_resolving" || status === "refile_required") {
    return (
      <div className="rounded-2xl bg-black-20/50 px-4 py-4">
        <p className="text-sm font-medium text-black-100">
          오류가 발생하면 어떻게 하나요?
        </p>
        <p className="mt-1 text-xs text-black-60 leading-relaxed">
          오류가 해결되면 카카오톡으로 안내해드려요.
          <br />
          알림을 받은 후 앱에 접속해 다시 신고해주세요.
          <br />
          (예상 해결 시간: 2일 이내)
        </p>
      </div>
    );
  }
  return null;
}

function BusinessDetailContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const initialId = Number(params.id);
  const now = new Date();

  const [businessId, setBusinessId] = useState(initialId);
  const [selected, setSelected] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  });
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draftDrawerOpen, setDraftDrawerOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);

  const { data: memberData } = useQuery<MemberMe>({
    queryKey: ["member", "me"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/members/me`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  const { data: businessList = [] } = useQuery<Business[]>({
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

  const {
    data,
    isLoading,
  } = useQuery<{ business: Business; schedule: TaxSchedule | null }>({
    queryKey: ["schedule", businessId, selected.year, selected.month],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(
        `${apiUrl}/api/business/${businessId}/schedules?year=${selected.year}&month=${selected.month}`
      );
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  const { data: monthStatuses = {} } = useQuery<
    Record<string, MonthStatusType>
  >({
    queryKey: ["monthStatuses", businessId],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/business/${businessId}/month-statuses`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (!selectorOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        selectorRef.current &&
        !selectorRef.current.contains(e.target as Node)
      ) {
        setSelectorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [selectorOpen]);

  const today = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
  const businessName =
    data?.business?.name ??
    businessList.find((b) => b.id === businessId)?.name ??
    "";
  const schedule = data?.schedule ?? null;

  async function handleDownloadReceipt() {
    if (!jobId) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(
        `${apiUrl}/api/companies/${businessId}/withholding-tax/filing/${jobId}/receipt`,
      );
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `접수증_${jobId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      const { toast } = await import("sonner");
      toast.error("접수증 다운로드에 실패했습니다.");
    }
  }

  function getMonthStatus(item: MonthItem): MonthStatus {
    const key = `${item.year}-${item.month}`;
    return monthStatuses[key] ?? "default";
  }

  return (
    <div className="flex min-h-dvh flex-col">
      {/* 상단 바 */}
      <header className="relative flex h-14 items-center justify-center px-5">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-5"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium text-black-100">
          원천세 신고 일정
        </span>
      </header>

      {/* 월 스크롤러 */}
      <div className="px-2">
        <MonthScroller
          selected={selected}
          onSelect={setSelected}
          getMonthStatus={getMonthStatus}
        />
      </div>

      {/* 사업장 선택 & 날짜 */}
      <div className="mt-4 flex items-center justify-between px-5">
        <div ref={selectorRef} className="relative">
          <button
            type="button"
            onClick={() => setSelectorOpen((prev) => !prev)}
            className="flex items-center gap-1 rounded-full border border-black-20 px-4 py-2"
          >
            <span className="text-sm font-medium text-black-100">
              {businessName}
            </span>
            <ChevronDown size={16} className="text-black-60" />
          </button>

          {selectorOpen && (
            <ul className="absolute left-0 top-full z-50 mt-1 w-48 rounded-xl border border-black-20 bg-white py-1 shadow-lg">
              {businessList.map((biz) => (
                <li key={biz.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectorOpen(false);
                      setBusinessId(biz.id);
                      window.history.replaceState(
                        null,
                        "",
                        `/business/${biz.id}`
                      );
                    }}
                    className={`flex w-full items-center px-4 py-3 text-sm ${
                      biz.id === businessId
                        ? "font-bold text-primary-100"
                        : "text-black-100"
                    }`}
                  >
                    {biz.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="text-sm text-black-60">오늘 {today}</span>
      </div>

      {/* 신고 내용 */}
      <div className="mt-4 flex flex-1 flex-col gap-3 px-5">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 size={32} className="animate-spin text-primary-100" />
          </div>
        ) : !schedule || schedule.status === "empty" ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-center text-2xl font-bold text-black-40 leading-relaxed">
              신고 내역이
              <br />
              없어요.
            </p>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                if (
                  schedule.status === "required" ||
                  schedule.status === "overdue"
                ) {
                  if (!isMemberInfoComplete(memberData)) {
                    setDrawerOpen(true);
                    return;
                  }
                  if (hasDraft(businessId, selected.year, selected.month)) {
                    setDraftDrawerOpen(true);
                    return;
                  }
                  router.push(
                    `/business/${businessId}/declaration?year=${selected.year}&month=${selected.month}${schedule.status === "overdue" ? "&overdue=true" : ""}`,
                  );
                }
              }}
              className={`flex w-full items-center justify-between rounded-2xl border border-black-20 px-4 py-4 text-left ${
                schedule.status === "required" || schedule.status === "overdue"
                  ? "cursor-pointer active:bg-black-10"
                  : "cursor-default"
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusIcon status={schedule.status} />
                <span className="text-sm font-medium text-black-100">
                  {schedule.label}
                </span>
              </div>
              {schedule.status === "error_resolving" ||
              schedule.status === "refile_required" ? (
                <div className="flex items-center gap-1 px-2 py-1">
                  <StatusLabel status={schedule.status} />
                  <ChevronRight size={16} className="text-error-100" />
                </div>
              ) : (
                <div className="text-right">
                  <DeadlineLabel
                    status={schedule.status}
                    deadline={schedule.deadline}
                  />
                  <StatusLabel status={schedule.status} />
                </div>
              )}
            </button>

            <InfoBanner status={schedule.status} />
          </>
        )}

        {jobId && (
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="flex items-center gap-2 rounded-2xl border border-primary-100 px-4 py-4 active:bg-primary-100/10"
          >
            <Download size={20} className="text-primary-100" />
            <span className="text-sm font-bold text-primary-100">
              접수증 다운로드
            </span>
          </button>
        )}
      </div>

      <FilingInfoDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onComplete={() => {
          if (hasDraft(businessId, selected.year, selected.month)) {
            setDraftDrawerOpen(true);
            return;
          }
          router.push(
            `/business/${businessId}/declaration?year=${selected.year}&month=${selected.month}${schedule?.status === "overdue" ? "&overdue=true" : ""}`,
          );
        }}
      />

      <DraftConfirmDrawer
        open={draftDrawerOpen}
        onOpenChange={setDraftDrawerOpen}
        onContinue={() => {
          setDraftDrawerOpen(false);
          router.push(
            `/business/${businessId}/declaration?year=${selected.year}&month=${selected.month}${schedule?.status === "overdue" ? "&overdue=true" : ""}`,
          );
        }}
        onDiscard={() => {
          localStorage.removeItem(getDraftKey(businessId, selected.year, selected.month));
          setDraftDrawerOpen(false);
          router.push(
            `/business/${businessId}/declaration?year=${selected.year}&month=${selected.month}${schedule?.status === "overdue" ? "&overdue=true" : ""}`,
          );
        }}
      />
    </div>
  );
}

export default function BusinessDetailPage() {
  return (
    <Suspense>
      <BusinessDetailContent />
    </Suspense>
  );
}
