import { http, HttpResponse, delay } from "msw";
import { businesses, getSchedule, getMonthStatuses } from "./businesses";

interface MockDocument {
  id: number;
  name: string;
  category: "지급대장" | "원천세" | "지급명세서";
  month: number;
}

const documentsByBusiness: Record<number, MockDocument[]> = {
  1: [
    // 1월
    { id: 1, name: "1월 국세 접수증", category: "원천세", month: 1 },
    { id: 2, name: "1월 지방세 접수증", category: "원천세", month: 1 },
    { id: 3, name: "1월 국세 납부서", category: "원천세", month: 1 },
    { id: 4, name: "1월 지방세 납부서", category: "원천세", month: 1 },
    { id: 5, name: "1월 원천징수이행 상황신고서", category: "원천세", month: 1 },
    { id: 6, name: "1월 간이지급명세서", category: "지급명세서", month: 1 },
    { id: 7, name: "1월 지급대장", category: "지급대장", month: 1 },
    { id: 8, name: "1월 소수진 지급내역서", category: "지급대장", month: 1 },
    { id: 9, name: "1월 홍길동 지급내역서", category: "지급대장", month: 1 },
    // 2월
    { id: 10, name: "2월 간이지급명세서", category: "지급명세서", month: 2 },
    { id: 11, name: "2월 국세 접수증", category: "원천세", month: 2 },
    { id: 12, name: "2월 지방세 접수증", category: "원천세", month: 2 },
    { id: 13, name: "2월 지급대장", category: "지급대장", month: 2 },
    // 3월
    { id: 14, name: "3월 간이지급명세서", category: "지급명세서", month: 3 },
  ],
  2: [
    { id: 15, name: "1월 국세 접수증", category: "원천세", month: 1 },
    { id: 16, name: "1월 지방세 접수증", category: "원천세", month: 1 },
    { id: 17, name: "1월 간이지급명세서", category: "지급명세서", month: 1 },
    { id: 18, name: "1월 지급대장", category: "지급대장", month: 1 },
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

  // 사업장 목록 조회
  http.get("/api/businesses", async () => {
    await delay(300);
    return HttpResponse.json(businesses);
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

  // 사업장 문서 목록 조회
  http.get("/api/business/:id/documents", async ({ params }) => {
    await delay(300);

    const id = Number(params.id);
    const docs = documentsByBusiness[id];
    if (!docs) {
      return HttpResponse.json(
        { message: "사업장을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return HttpResponse.json(docs);
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
