"use client";

import { useState } from "react";
import { CheckCircle2, ChevronDown, Info } from "lucide-react";

interface ReviewSectionProps {
  title: string;
  showInfo?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children?: React.ReactNode;
}

export function ReviewSection({
  title,
  showInfo,
  collapsible = true,
  defaultExpanded = false,
  children,
}: ReviewSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-xl border border-primary-100 p-4">
      <button
        type="button"
        onClick={() => collapsible && setExpanded(!expanded)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <CheckCircle2 size={24} className="text-primary-100" />
          <span className="text-base font-semibold text-black-100">
            {title}
          </span>
          {showInfo && <Info size={17} className="text-primary-80" />}
        </div>
        {collapsible && (
          <ChevronDown
            size={20}
            className={`text-black-60 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {expanded && children && (
        <div className="mt-3 border-t border-black-20 pt-3">{children}</div>
      )}
    </div>
  );
}
