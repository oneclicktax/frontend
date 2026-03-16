"use client";

import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export function MainHeader() {
  const router = useRouter();

  return (
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
  );
}
