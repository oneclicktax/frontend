import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 size={40} className="animate-spin text-primary-100" />
    </div>
  );
}
