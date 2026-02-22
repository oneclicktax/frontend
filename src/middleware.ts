import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/login/success", "/login/fail"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = request.cookies.get("has_token")?.value === "true";

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // 미인증 사용자가 보호된 경로 접근 → /login 리다이렉트
  if (!hasToken && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 인증된 사용자가 /login 접근 → /home 리다이렉트
  if (hasToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|mockServiceWorker\\.js$).*)"],
};
