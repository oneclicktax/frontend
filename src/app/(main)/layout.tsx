import { BottomNav } from "@/components/BottomNav";
import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingGuard>
      <div className="min-h-dvh pb-14">
        {children}
        <BottomNav />
      </div>
    </OnboardingGuard>
  );
}
