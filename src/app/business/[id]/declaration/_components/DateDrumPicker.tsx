"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  WheelPicker,
  WheelPickerWrapper,
  type WheelPickerOption,
} from "@/components/wheel-picker/wheel-picker";

interface DateDrumPickerProps {
  value: string; // ISO "YYYY-MM-DD"
  onChange: (value: string) => void;
}

function parseDate(value: string) {
  const parts = value.split("-").map((s) => Number(s.trim()));
  return {
    year: parts[0] || 2026,
    month: parts[1] || 1,
    day: parts[2] || 1,
  };
}

function formatDisplay(year: number, month: number, day: number) {
  return format(new Date(year, month - 1, day), "yyyy. MM. dd");
}

function formatISO(year: number, month: number, day: number) {
  return format(new Date(year, month - 1, day), "yyyy-MM-dd");
}

export function DateDrumPicker({ value, onChange }: DateDrumPickerProps) {
  const [open, setOpen] = useState(false);
  const { year, month, day } = parseDate(value);
  const [draft, setDraft] = useState({ year, month, day });

  const yearOptions: WheelPickerOption<number>[] = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        label: String(2024 + i),
        value: 2024 + i,
      })),
    [],
  );

  const monthOptions: WheelPickerOption<number>[] = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        label: String(i + 1).padStart(2, "0"),
        value: i + 1,
      })),
    [],
  );

  const draftDaysInMonth = new Date(draft.year, draft.month, 0).getDate();
  const dayOptions: WheelPickerOption<number>[] = useMemo(
    () =>
      Array.from({ length: draftDaysInMonth }, (_, i) => ({
        label: String(i + 1).padStart(2, "0"),
        value: i + 1,
      })),
    [draftDaysInMonth],
  );

  const handleOpen = () => {
    setDraft({ year, month, day });
    setOpen(true);
  };

  const handleConfirm = () => {
    onChange(formatISO(draft.year, draft.month, draft.day));
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="xl"
        onClick={handleOpen}
        className="w-full justify-between font-normal"
      >
        <span className="text-base text-black-100">
          {formatDisplay(year, month, day)}
        </span>
        <ChevronDown size={20} className="text-black-60" />
      </Button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="text-center text-base font-bold text-black-100">
              지급 날짜 선택
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex justify-center px-6 py-4">
            <WheelPickerWrapper className="w-full border-none shadow-none">
              <WheelPicker<number>
                options={yearOptions}
                value={draft.year}
                onValueChange={(v) =>
                  setDraft((prev) => {
                    const maxDay = new Date(v, prev.month, 0).getDate();
                    return {
                      ...prev,
                      year: v,
                      day: Math.min(prev.day, maxDay),
                    };
                  })
                }
              />
              <WheelPicker<number>
                options={monthOptions}
                value={draft.month}
                onValueChange={(v) =>
                  setDraft((prev) => {
                    const maxDay = new Date(prev.year, v, 0).getDate();
                    return {
                      ...prev,
                      month: v,
                      day: Math.min(prev.day, maxDay),
                    };
                  })
                }
              />
              <WheelPicker<number>
                options={dayOptions}
                value={Math.min(draft.day, draftDaysInMonth)}
                onValueChange={(v) =>
                  setDraft((prev) => ({ ...prev, day: v }))
                }
              />
            </WheelPickerWrapper>
          </div>

          <DrawerFooter>
            <Button onClick={handleConfirm} size="xl" className="w-full">
              선택 완료
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
