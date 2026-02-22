"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeAccessToken } from "@/lib/auth";

const menuItems = [
  { label: "계정 설정", href: "/profile/account" },
  { label: "알림 설정", href: "/profile/notifications" },
  { label: "서비스 이용약관", href: "#" },
  { label: "개인정보처리방침", href: "#" },
  { label: "공지사항", href: "#" },
  { label: "1:1 문의하기", href: "#" },
  { label: "앱 공유하기", href: "#" },
];

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="px-5">
      {/* 상단 바 */}
      <header className="flex h-14 items-center justify-between">
        <span className="text-base font-bold text-black-100">
          원클릭 원천세
        </span>
        <button
          type="button"
          onClick={() => router.push("/profile/alerts")}
          aria-label="알림"
        >
          <Bell size={24} className="text-black-100" />
        </button>
      </header>

      {/* 유저 이름 */}
      <h1 className="mt-6 text-3xl font-bold text-black-100">소수진 님</h1>

      {/* 내 정보 */}
      <section className="mt-8">
        <h2 className="text-xl font-bold text-black-100">내 정보</h2>

        <ul className="mt-3 flex flex-col">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex h-12 items-center justify-between"
              >
                <span className="text-base font-bold text-black-100">
                  {item.label}
                </span>
                <ChevronRight size={20} className="text-black-60" />
              </Link>
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          className="mt-2 h-14 w-full rounded-lg border-black-40 text-base font-bold text-black-60"
          onClick={() => {
            removeAccessToken();
            router.replace("/login");
          }}
        >
          로그아웃
        </Button>
      </section>
    </div>
  );
}
