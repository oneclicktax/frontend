"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type NotificationType = "info" | "error" | "success";

interface Notification {
  id: number;
  type: NotificationType;
  date: string;
  title: string;
  description: string;
}

const styleMap: Record<
  NotificationType,
  { bg: string; icon: React.ElementType; iconColor: string }
> = {
  info: { bg: "bg-[#EAF2FF]", icon: Info, iconColor: "text-[#006FFD]" },
  error: { bg: "bg-[#FFE2E5]", icon: AlertCircle, iconColor: "text-[#FF616D]" },
  success: { bg: "bg-[#E7F4E8]", icon: CheckCircle2, iconColor: "text-[#3AC0A0]" },
};

export default function AlertsPage() {
  const router = useRouter();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error();
      return res.json();
    },
  });

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
        <span className="text-base font-medium text-black-100">알림 내역</span>
      </header>

      {/* 알림 목록 */}
      <div className="mt-2 flex flex-col gap-3">
        {notifications.map((noti) => {
          const style = styleMap[noti.type];
          const Icon = style.icon;

          return (
            <div
              key={noti.id}
              className={`flex gap-4 items-center rounded-2xl p-3 ${style.bg}`}
            >
              <Icon size={20} className={`shrink-0 ${style.iconColor}`} />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-[0.625rem] text-black-80">
                  {noti.date}
                </span>
                <span className="text-xs font-bold text-black-100">
                  {noti.title}
                </span>
                <span className="text-xs text-black-80 leading-4">
                  {noti.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
