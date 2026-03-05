"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api";
import {
  BusinessRegisterForm,
  type Business,
} from "@/components/BusinessRegisterForm";

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`;
}

export default function BusinessRegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const { data: existingBusinesses = [] } = useQuery<Business[]>({
    queryKey: ["businesses"],
    queryFn: async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      return (json.data ?? []).map((b: any) => ({
        id: b.id,
        name: b.name,
        bizNumber: formatBusinessNumber(b.bizNumber),
      }));
    },
  });

  useEffect(() => {
    if (existingBusinesses.length > 0 && businesses.length === 0) {
      setBusinesses(existingBusinesses);
    }
  }, [existingBusinesses]);

  async function handleSave() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetchWithAuth(`${apiUrl}/api/companies`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businesses: businesses.map((b) => ({
            name: b.name,
            bizNumber: b.bizNumber.replace(/\s/g, ""),
          })),
        }),
      });
      if (!res.ok) throw new Error();
      await queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/home");
    } catch {
      toast.error("사업장 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-6"
          aria-label="뒤로가기"
        >
          <ArrowLeft size={24} className="text-black-100" />
        </button>
        <span className="text-base font-medium tracking-tight text-black-100">
          사업장 등록
        </span>
      </header>

      <BusinessRegisterForm
        businesses={businesses}
        onBusinessesChange={setBusinesses}
        onSave={handleSave}
        saving={submitting}
      />
    </div>
  );
}
