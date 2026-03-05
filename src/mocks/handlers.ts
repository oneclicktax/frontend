import { http, HttpResponse, delay } from "msw";
import { businesses, getSchedule, getMonthStatuses } from "./businesses";

interface MockDocument {
  id: number;
  documentType: string;
  documentName: string;
  createdAt: string;
  belongYearMonth: string;
}

const documentsByBusiness: Record<number, MockDocument[]> = {
  1: [
    // 1월 (202601)
    { id: 1, documentType: "NATIONAL_TAX_RECEIPT", documentName: "1월 국세 접수증", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 2, documentType: "LOCAL_TAX_RECEIPT", documentName: "1월 지방세 접수증", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 3, documentType: "NATIONAL_TAX_PAYMENT", documentName: "1월 국세 납부서", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 4, documentType: "LOCAL_TAX_PAYMENT", documentName: "1월 지방세 납부서", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 5, documentType: "WITHHOLDING_TAX_REPORT", documentName: "1월 원천징수이행 상황신고서", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 6, documentType: "SIMPLE_PAYMENT_STATEMENT", documentName: "1월 간이지급명세서", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 7, documentType: "PAYMENT_LEDGER", documentName: "1월 지급대장", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    // 2월 (202602)
    { id: 10, documentType: "SIMPLE_PAYMENT_STATEMENT", documentName: "2월 간이지급명세서", createdAt: "2026-03-10T10:00:00", belongYearMonth: "202602" },
    { id: 11, documentType: "NATIONAL_TAX_RECEIPT", documentName: "2월 국세 접수증", createdAt: "2026-03-10T10:00:00", belongYearMonth: "202602" },
    { id: 12, documentType: "LOCAL_TAX_RECEIPT", documentName: "2월 지방세 접수증", createdAt: "2026-03-10T10:00:00", belongYearMonth: "202602" },
    { id: 13, documentType: "PAYMENT_LEDGER", documentName: "2월 지급대장", createdAt: "2026-03-10T10:00:00", belongYearMonth: "202602" },
  ],
  2: [
    { id: 15, documentType: "NATIONAL_TAX_RECEIPT", documentName: "1월 국세 접수증", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 16, documentType: "LOCAL_TAX_RECEIPT", documentName: "1월 지방세 접수증", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 17, documentType: "SIMPLE_PAYMENT_STATEMENT", documentName: "1월 간이지급명세서", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
    { id: 18, documentType: "PAYMENT_LEDGER", documentName: "1월 지급대장", createdAt: "2026-02-10T10:00:00", belongYearMonth: "202601" },
  ],
};

export const handlers = [
  // 소셜 로그인 URL 조회 (개발용 mock)
  http.get("/api/auth/social-login-url", ({ request }) => {
    const url = new URL(request.url);
    const socialLoginType = url.searchParams.get("socialLoginType");

    if (socialLoginType === "KAKAO") {
      // MSW 환경에서는 카카오 OAuth를 건너뛰고 바로 토큰 발급
      const mockToken = "mock-jwt-token-for-development";
      const successUrl = `${window.location.origin}/login/success?accessToken=${mockToken}`;

      return HttpResponse.json({
        socialLoginUrl: successUrl,
      });
    }

    return HttpResponse.json(
      { message: "지원하지 않는 소셜 로그인 타입입니다." },
      { status: 400 }
    );
  }),

  // 유저 정보 조회
  http.get("/api/user", () => {
    return HttpResponse.json({
      id: 1,
      name: "홍길동",
      isOnboarded: false,
    });
  }),

  // 회원 정보 조회 (members/me)
  http.get("/api/members/me", () => {
    return HttpResponse.json({
      data: {
        id: 1,
        name: "홍길동",
        phoneNumber: "01012341234",
        email: "hong@test.com",
        hometaxUserId: "testuser",
        birthDate: "19970101",
        representName: "홍길동",
        termsAgreed: true,
        socialLoginType: "KAKAO",
      },
    });
  }),

  // 회원 정보 수정 (members/me)
  http.patch("/api/members/me", async () => {
    await delay(300);
    return HttpResponse.json({
      data: {
        id: 1,
        name: "홍길동",
        termsAgreed: true,
      },
    });
  }),

  // 알림 내역 조회
  http.get("/api/notifications", async () => {
    await delay(300);
    return HttpResponse.json([
      {
        id: 1,
        type: "info",
        date: "2026.02.09 16:00",
        title: "원천세 신고 기간 안내",
        description: "2026년 2월 10일까지 원천세를 제출해야해요.",
      },
      {
        id: 2,
        type: "error",
        date: "2026.02.09 16:00",
        title: "원천세 신고 중 오류 발생",
        description:
          "2026년 1월 귀속 원천세 신고 과정에서 오류가 발생했어요.",
      },
      {
        id: 3,
        type: "success",
        date: "2026.02.09 16:00",
        title: "원천세 신고 완료",
        description: "2026년 1월 귀속 원천세 신고를 완료했어요.",
      },
      {
        id: 4,
        type: "info",
        date: "2026.01.05 10:00",
        title: "원천세 신고 기간 안내",
        description: "2026년 1월 10일까지 원천세를 제출해야해요.",
      },
      {
        id: 5,
        type: "info",
        date: "2025.12.05 10:00",
        title: "원천세 신고 기간 안내",
        description: "2025년 12월 10일까지 원천세를 제출해야해요.",
      },
    ]);
  }),

  // 사업장 월별 상태 조회
  http.get("/api/business/:id/month-statuses", async ({ params }) => {
    await delay(300);

    const id = Number(params.id);
    const business = businesses.find((b) => b.id === id);
    if (!business) {
      return HttpResponse.json(
        { message: "사업장을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return HttpResponse.json(getMonthStatuses(id));
  }),

  // 사업장 문서 목록 조회 (새 API)
  http.get("/api/companies/:id/withholding-tax/documents", async ({ params, request }) => {
    await delay(300);

    const id = Number(params.id);
    const url = new URL(request.url);
    const belongYearMonth = url.searchParams.get("belongYearMonth");

    const allDocs = documentsByBusiness[id];
    if (!allDocs) {
      return HttpResponse.json(
        { data: { documents: [] } }
      );
    }

    const filtered = belongYearMonth
      ? allDocs.filter((d) => d.belongYearMonth === belongYearMonth)
      : allDocs;

    return HttpResponse.json({
      data: { documents: filtered },
    });
  }),

  // 문서 PDF 다운로드 (mock - 빈 PDF 반환)
  http.get("/api/companies/:companyId/withholding-tax/documents/:docId/download", async () => {
    await delay(200);
    return new HttpResponse(new Blob(["mock-pdf-content"], { type: "application/pdf" }), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=\"document.pdf\"",
      },
    });
  }),

  // 사업장 신고 일정 조회
  http.get("/api/business/:id/schedules", async ({ params, request }) => {
    await delay(800);

    const id = Number(params.id);
    const url = new URL(request.url);
    const year = Number(url.searchParams.get("year"));
    const month = Number(url.searchParams.get("month"));

    const business = businesses.find((b) => b.id === id);
    if (!business) {
      return HttpResponse.json(
        { message: "사업장을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const schedule = getSchedule(id, year, month);

    return HttpResponse.json({
      business,
      schedule,
    });
  }),
];
