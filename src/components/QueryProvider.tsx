"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OverlayProvider } from "overlay-kit";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>{children}</OverlayProvider>
    </QueryClientProvider>
  );
}
