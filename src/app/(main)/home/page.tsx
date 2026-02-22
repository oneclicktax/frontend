"use client";

import Link from "next/link";
import { Bell, Settings, Plus, ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";

interface Business {
  id: number;
  name: string;
  number: string;
}

export default function HomePage() {
  const { data: businesses = [], isLoading } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return (json.data ?? []).map((b: any) => ({
        id: b.id,
        name: b.name,
        number: b.bizNumber.replace(/(\d{3})(\d{2})(\d{5})/, "$1 $2 $3"),
      }));
    },
  });

  return (
    <div className="px-5">
      {/* 상단 바 */}
      <header className="flex h-14 items-center justify-between">
        <span className="text-base font-bold text-black-100">
          원클릭 원천세
        </span>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="알림">
            <Bell size={24} className="text-black-100" />
          </button>
          <button type="button" aria-label="설정">
            <Settings size={24} className="text-black-100" />
          </button>
        </div>
      </header>

      {/* 보유 사업장 */}
      <section className="mt-4">
        <h2 className="text-xl font-bold text-black-100">보유 사업장</h2>

        {isLoading ? (
          <div className="mt-8 flex justify-center">
            <Loader2 size={32} className="animate-spin text-primary-100" />
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/business/${biz.id}`}
                className="flex h-32 flex-col justify-between rounded-2xl bg-primary-100 p-4"
              >
                <div>
                  <p className="text-sm font-bold text-white">{biz.name}</p>
                  <p className="mt-1 text-xs text-white/80">{biz.number}</p>
                </div>
                <ChevronRight size={20} className="self-end text-white" />
              </Link>
            ))}

            <Link
              href="/business/register"
              className="flex h-32 flex-col justify-between rounded-2xl bg-primary-40/50 p-4"
            >
              <span className="text-sm font-medium text-black-100">
                사업장 등록하기
              </span>
              <Plus size={24} className="self-center text-black-60" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
