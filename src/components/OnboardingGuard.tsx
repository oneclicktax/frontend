"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { memberApi, type Member } from "@/lib/api";
import { getAccessToken, removeAccessToken } from "@/lib/auth";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const hasToken = !!getAccessToken();

  const { data: member, isLoading, isError } = useQuery<Member>({
    queryKey: ["member", "me", "guard"],
    queryFn: () => memberApi.getMe(),
    enabled: hasToken,
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (!hasToken || isError) {
      removeAccessToken();
      router.replace("/login");
      return;
    }
    if (isLoading) return;
    if (member && !member.termsAgreed) {
      router.replace("/onboarding");
    } else if (member) {
      setChecked(true);
    }
  }, [member, isLoading, isError, hasToken, router]);

  if (!checked) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 size={32} className="animate-spin text-primary-100" />
      </div>
    );
  }

  return <>{children}</>;
}
