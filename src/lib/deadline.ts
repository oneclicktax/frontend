import dayjs from "dayjs";

/**
 * 특정 월의 공휴일 목록을 조회한다. (YYYYMMDD 형식 문자열 배열)
 */
async function fetchHolidays(year: number, month: number): Promise<Set<string>> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  const res = await fetch(`/api/holidays?${params}`);
  const data = await res.json();
  return new Set<string>(data.holidays ?? []);
}

/**
 * 귀속 연월(year, month)에 대한 원천세 신고 기한을 계산한다.
 * 기본 기한: 다음 달 10일
 * 10일이 토·일·공휴일이면 그 다음 영업일로 연장
 */
export async function getFilingDeadline(
  belongYear: number,
  belongMonth: number,
): Promise<string> {
  // 다음 달 10일
  let deadline = dayjs(`${belongYear}-${String(belongMonth).padStart(2, "0")}-01`)
    .add(1, "month")
    .date(10);

  // 기한이 속한 월의 공휴일 조회
  let holidays = await fetchHolidays(deadline.year(), deadline.month() + 1);

  // 토·일·공휴일이면 다음 영업일까지 반복
  while (isNonBusinessDay(deadline, holidays)) {
    deadline = deadline.add(1, "day");

    // 월이 바뀌면 새 월의 공휴일도 조회
    if (deadline.date() === 1) {
      holidays = await fetchHolidays(deadline.year(), deadline.month() + 1);
    }
  }

  return deadline.format("YYYY년 MM월 DD일 까지");
}

function isNonBusinessDay(date: dayjs.Dayjs, holidays: Set<string>): boolean {
  const day = date.day();
  // 토요일(6) 또는 일요일(0)
  if (day === 0 || day === 6) return true;
  // 공휴일
  return holidays.has(date.format("YYYYMMDD"));
}
