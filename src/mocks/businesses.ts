export type TaxStatus =
  | "required"
  | "completed"
  | "overdue"
  | "hometax_required"
  | "empty"
  | "error_resolving"
  | "refile_required";

export interface TaxSchedule {
  label: string;
  deadline: string;
  status: TaxStatus;
}

export interface Business {
  id: number;
  name: string;
  number: string;
}

export const businesses: Business[] = [
  { id: 1, name: "해보자 컴퍼니", number: "000 00 0000" },
  { id: 2, name: "수타짜장집", number: "000 00 0001" },
];

const schedulesByBusiness: Record<number, Record<string, TaxSchedule>> = {
  1: {
    "2025-11": {
      label: "신고내역 가져오기",
      deadline: "",
      status: "hometax_required",
    },
    "2025-12": {
      label: "11월 귀속 원천세",
      deadline: "12월 10일",
      status: "completed",
    },
    "2026-1": {
      label: "12월 귀속 원천세 신고",
      deadline: "",
      status: "error_resolving",
    },
    "2026-2": {
      label: "1월 귀속 원천세",
      deadline: "2월 10일까지",
      status: "required",
    },
  },
  2: {
    "2025-11": {
      label: "10월 귀속 원천세",
      deadline: "11월 10일",
      status: "completed",
    },
    "2025-12": {
      label: "11월 귀속 원천세",
      deadline: "12월 10일까지",
      status: "overdue",
    },
    "2026-1": {
      label: "12월 귀속 원천세 신고",
      deadline: "",
      status: "refile_required",
    },
    "2026-2": {
      label: "1월 귀속 원천세",
      deadline: "",
      status: "empty",
    },
  },
};

export function getSchedule(
  businessId: number,
  year: number,
  month: number
): TaxSchedule | null {
  const data = schedulesByBusiness[businessId];
  if (!data) return null;
  return data[`${year}-${month}`] ?? null;
}

export function getBusiness(id: number): Business | undefined {
  return businesses.find((b) => b.id === id);
}

export type MonthStatusType = "default" | "completed" | "locked" | "error";

function taxStatusToMonthStatus(status: TaxStatus): MonthStatusType {
  switch (status) {
    case "completed":
      return "completed";
    case "hometax_required":
      return "locked";
    case "error_resolving":
    case "refile_required":
    case "overdue":
      return "error";
    default:
      return "default";
  }
}

export function getMonthStatuses(
  businessId: number
): Record<string, MonthStatusType> {
  const data = schedulesByBusiness[businessId];
  if (!data) return {};
  const result: Record<string, MonthStatusType> = {};
  for (const [key, schedule] of Object.entries(data)) {
    result[key] = taxStatusToMonthStatus(schedule.status);
  }
  return result;
}
