import axios from "axios";
import { getAccessToken, removeAccessToken } from "./auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeAccessToken();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Types ──

export interface Member {
  id: number;
  name: string;
  phoneNumber: string | null;
  email: string | null;
  hometaxUserId: string | null;
  birthDate: string | null;
  socialLoginType: string | null;
  termsAgreed: boolean;
}

export interface MemberUpdateRequest {
  name?: string;
  phoneNumber?: string;
  hometaxUserId?: string;
  birthDate?: string;
  email?: string;
  termsAgreed?: boolean;
}

export interface Company {
  id: number;
  name: string;
  bizNumber: string;
  bizCode?: string;
}

export interface CompanyLookupResult {
  name: string;
}

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

export interface ScheduleResponse {
  business: Company;
  schedule: TaxSchedule | null;
}

export type MonthStatusType = "default" | "completed" | "locked" | "error";

export interface TaxRecipientResult {
  name: string;
  incomeType: string;
  preTaxAmount: number;
  incomeTax: number;
  localTax: number;
  afterTaxAmount: number;
}

export interface TaxCalculationResult {
  recipients: TaxRecipientResult[];
  totalIncomeTax: number;
  totalLocalTax: number;
  totalTax: number;
}

export interface FilingRequest {
  year: number;
  month: number;
  submitDate: string;
  amendedReturn: boolean;
  userName: string;
  phone: string;
  hometaxUserId: string;
  birthDate: string;
  representName: string;
  recipients: {
    name: string;
    residentNumber: string;
    phone: string;
    incomeType: string;
    paymentDate: string;
    paymentAmount: number;
    amountType: string;
  }[];
}

export interface FilingResponse {
  jobId: string;
}

export interface FilingStatus {
  status: string;
}

export interface DocumentItem {
  id: number;
  documentType: string;
  documentName: string;
  createdAt: string;
}

export interface HometaxAuthRequest {
  name: string;
  birthDate: string | null;
  phoneNumber: string | null;
}

export interface HometaxAuthResponse {
  jobId: string;
}

export interface HometaxBusiness {
  name: string;
  bizNumber: string;
  openDate: string;
  status: string;
}

export interface HometaxAuthStatus {
  jobId: string;
  status: string;
  message: string;
  businesses: HometaxBusiness[];
}

// ── Member API ──

export const memberApi = {
  getMe: (): Promise<Member> =>
    api.get("/api/members/me").then((r) => r.data.data),

  updateMe: (data: MemberUpdateRequest) =>
    api.patch("/api/members/me", data),

  deleteMe: () => api.delete("/api/members/me"),
};

// ── Company API ──

export const companyApi = {
  getAll: (): Promise<Company[]> =>
    api.get("/api/companies").then((r) => r.data.data ?? []),

  save: (businesses: { name: string; bizNumber: string }[]) =>
    api.put("/api/companies", { businesses }),

  lookup: (bizNumber: string): Promise<CompanyLookupResult> =>
    api.get(`/api/companies/lookup/${bizNumber}`).then((r) => r.data.data),
};

// ── Business Schedule API ──

export const businessApi = {
  getSchedule: (
    businessId: number,
    year: number,
    month: number,
  ): Promise<ScheduleResponse> =>
    api
      .get(`/api/business/${businessId}/schedules?year=${year}&month=${month}`)
      .then((r) => r.data.data),

  getMonthStatuses: (
    businessId: number,
  ): Promise<Record<string, MonthStatusType>> =>
    api
      .get(`/api/business/${businessId}/month-statuses`)
      .then((r) => r.data.data),
};

// ── Withholding Tax API ──

export const withholdingTaxApi = {
  calculate: (
    businessId: number,
    recipients: {
      name: string;
      incomeType: string;
      paymentAmount: number;
      amountType: string;
    }[],
  ): Promise<TaxCalculationResult> =>
    api
      .post(`/api/companies/${businessId}/withholding-tax/calculate`, {
        recipients,
      })
      .then((r) => r.data.data),

  file: (businessId: number, data: FilingRequest): Promise<FilingResponse> =>
    api
      .post(`/api/companies/${businessId}/withholding-tax/filing`, data)
      .then((r) => r.data.data),

  getFilingStatus: (
    businessId: number,
    jobId: string,
  ): Promise<FilingStatus> =>
    api
      .get(
        `/api/companies/${businessId}/withholding-tax/filing/${jobId}/status`,
      )
      .then((r) => r.data.data),

  downloadReceipt: (businessId: number, jobId: string): Promise<Blob> =>
    api
      .get(
        `/api/companies/${businessId}/withholding-tax/filing/${jobId}/receipt`,
        { responseType: "blob" },
      )
      .then((r) => r.data as Blob),

  getDocuments: (
    businessId: number,
    belongYearMonth: string,
  ): Promise<DocumentItem[]> =>
    api
      .get(
        `/api/companies/${businessId}/withholding-tax/documents?belongYearMonth=${belongYearMonth}`,
      )
      .then((r) => r.data.data?.documents ?? []),

  downloadDocument: (
    businessId: number,
    documentId: number,
  ): Promise<Blob> =>
    api
      .get(
        `/api/companies/${businessId}/withholding-tax/documents/${documentId}/download`,
        { responseType: "blob" },
      )
      .then((r) => r.data as Blob),
};

// ── Hometax API ──

export const hometaxApi = {
  requestAuth: (data: HometaxAuthRequest): Promise<HometaxAuthResponse> =>
    api.post("/api/hometax/auth", data).then((r) => r.data.data),

  getAuthStatus: (jobId: string): Promise<HometaxAuthStatus> =>
    api.get(`/api/hometax/auth/${jobId}/status`).then((r) => r.data.data),
};

export default api;
