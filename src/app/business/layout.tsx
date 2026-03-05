import { OnboardingGuard } from "@/components/OnboardingGuard";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OnboardingGuard>{children}</OnboardingGuard>;
}
