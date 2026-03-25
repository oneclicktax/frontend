import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const year = searchParams.get("year");
  const month = searchParams.get("month");

  if (!year || !month) {
    return NextResponse.json(
      { error: "year, month 파라미터가 필요합니다." },
      { status: 400 },
    );
  }

  const apiUrl = process.env.HOLIDAY_API_URL;
  const apiKey = process.env.HOLIDAY_API_KEY;
  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      { error: "서버 설정 오류" },
      { status: 500 },
    );
  }

  const params = new URLSearchParams({
    solYear: year,
    solMonth: month.padStart(2, "0"),
    ServiceKey: apiKey,
    _type: "json",
    numOfRows: "50",
  });

  const res = await fetch(`${apiUrl}?${params}`);
  const data = await res.json();

  const items = data?.response?.body?.items?.item;
  // items가 없으면 빈 배열, 단건이면 배열로 감싸기
  const holidays: string[] = (
    Array.isArray(items) ? items : items ? [items] : []
  )
    .filter((item: { isHoliday: string }) => item.isHoliday === "Y")
    .map((item: { locdate: number }) => String(item.locdate));

  return NextResponse.json({ holidays });
}
