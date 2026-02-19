"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function NotificationsPage() {
  const router = useRouter();
  const [marketing, setMarketing] = useState(true);

  return (
    <div className="min-h-dvh px-5">
      {/* 상단 바 */}
      <header className="relative flex h-14 items-center justify-center">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-0"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium text-black-100">알림 설정</span>
      </header>

      {/* 마케팅 수신 동의 */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-base font-bold text-black-100">
            마케팅 수신 동의
          </p>
          <p className="mt-1 text-xs text-black-80 leading-relaxed">
            세금 신고를 위한 유용한 팁과 이벤트 소식을
            <br />
            가장 먼저 알려드려요.
          </p>
        </div>
        <Switch
          checked={marketing}
          onCheckedChange={setMarketing}
        />
      </div>
    </div>
  );
}
