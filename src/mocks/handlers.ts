import { http, HttpResponse, delay } from "msw";
import { businesses, getSchedule, getMonthStatuses } from "./businesses";

export const handlers = [
  // 유저 정보 조회
  http.get("/api/user", () => {
    return HttpResponse.json({
      id: 1,
      name: "홍길동",
      isOnboarded: false,
    });
  }),

  // 사업자등록번호 조회
  http.get("/api/business/lookup/:businessNumber", async ({ params }) => {
    await delay(1000);

    const { businessNumber } = params;

    if (businessNumber === "0000000000") {
      return HttpResponse.json(
        { message: "존재하지 않는 사업자등록번호입니다." },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      businessNumber,
      name: "해보자 컴퍼니",
    });
  }),

  // 사업장 목록 조회
  http.get("/api/businesses", async () => {
    await delay(300);
    return HttpResponse.json(businesses);
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
