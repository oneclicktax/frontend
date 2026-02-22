"use client";

import { ArrowLeft } from "lucide-react";

interface StepHeaderProps {
  title: string;
  onBack: () => void;
}

export function StepHeader({ title, onBack }: StepHeaderProps) {
  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center px-6">
      <button
        type="button"
        onClick={onBack}
        className="absolute left-6"
        aria-label="뒤로가기"
      >
        <ArrowLeft size={24} className="text-black-100" />
      </button>
      <span className="text-base font-medium text-black-100 tracking-tight">
        {title}
      </span>
    </header>
  );
}
