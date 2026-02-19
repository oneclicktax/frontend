"use client";

import { useRef, useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;
import { CircleCheck, LockKeyhole, CircleAlert } from "lucide-react";

export type MonthStatus = "default" | "completed" | "locked" | "error";

export interface MonthItem {
  year: number;
  month: number;
}

interface MonthScrollerProps {
  selected: MonthItem;
  onSelect: (item: MonthItem) => void;
  getMonthStatus?: (item: MonthItem) => MonthStatus;
}

function generateMonths(): MonthItem[] {
  const items: MonthItem[] = [];
  for (let y = 2025; y <= 2026; y++) {
    const startM = y === 2025 ? 11 : 1;
    const endM = 12;
    for (let m = startM; m <= endM; m++) {
      items.push({ year: y, month: m });
    }
  }
  return items;
}

function MonthIcon({
  status,
  isSelected,
}: {
  status: MonthStatus;
  isSelected: boolean;
}) {
  if (status === "locked") {
    return <LockKeyhole size={18} className="text-success-100" />;
  }
  if (status === "error") {
    return <CircleAlert size={18} className="text-error-100" />;
  }
  if (status === "completed") {
    return <CircleCheck size={18} className="text-primary-100" />;
  }
  return <CircleCheck size={18} className="text-black-40" />;
}

function defaultGetMonthStatus(item: MonthItem): MonthStatus {
  const now = new Date();
  const isPast =
    item.year < now.getFullYear() ||
    (item.year === now.getFullYear() && item.month < now.getMonth() + 1);
  return isPast ? "completed" : "default";
}

export function MonthScroller({
  selected,
  onSelect,
  getMonthStatus = defaultGetMonthStatus,
}: MonthScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const months = generateMonths();

  useIsomorphicLayoutEffect(() => {
    if (selectedRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = selectedRef.current;
      container.scrollLeft =
        el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide py-2"
    >
      {months.map((item) => {
        const isSelected =
          item.year === selected.year && item.month === selected.month;
        const status = getMonthStatus(item);
        const hasError = status === "error";

        return (
          <button
            key={`${item.year}-${item.month}`}
            ref={isSelected ? selectedRef : undefined}
            type="button"
            onClick={() => onSelect(item)}
            className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-2xl px-4 py-2 ${
              isSelected ? "bg-primary-40" : ""
            }`}
          >
            <span className="text-xs text-black-60">
              {item.year}
            </span>
            <span className="text-2xl font-bold text-black-100">
              {item.month}
            </span>
            <MonthIcon status={status} isSelected={isSelected} />
          </button>
        );
      })}
    </div>
  );
}
