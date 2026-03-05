"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncomeEarner } from "../types";
import { EarnerForm } from "./EarnerForm";
import { EarnerCard } from "./EarnerCard";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";

interface StepEarnerInfoProps {
  earners: IncomeEarner[];
  onEarnersChange: (earners: IncomeEarner[]) => void;
  onNext: () => void;
  belongYear: number;
  belongMonth: number;
}

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

type ViewState =
  | { type: "list" }
  | { type: "new"; data: Partial<IncomeEarner> }
  | { type: "edit"; index: number; data: Partial<IncomeEarner> };

function getDefaultFormData(
  belongYear: number,
  belongMonth: number,
): Partial<IncomeEarner> {
  return {
    incomeType: "OTHER",
    incomeCode: "76",
    amountType: "pre-tax",
    paymentDate: `${belongYear}-${String(belongMonth).padStart(2, "0")}-01`,
  };
}

function buildEarner(data: Partial<IncomeEarner>): IncomeEarner {
  return {
    id: data.id || generateId(),
    name: data.name || "",
    residentNumber: data.residentNumber || "",
    phone: data.phone || "",
    incomeType: data.incomeType || "OTHER",
    incomeCode: data.incomeCode || "76",
    paymentDate: data.paymentDate || "",
    amountType: data.amountType || "pre-tax",
    amount: data.amount || 0,
  };
}

export function StepEarnerInfo({
  earners,
  onEarnersChange,
  onNext,
  belongYear,
  belongMonth,
}: StepEarnerInfoProps) {
  const [viewState, setViewState] = useState<ViewState>({ type: "list" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const isFormValid =
    viewState.type !== "list" &&
    !!(
      viewState.data.name &&
      viewState.data.residentNumber &&
      viewState.data.phone &&
      viewState.data.amount &&
      viewState.data.amount > 0
    );

  const handleAdd = () => {
    setViewState({
      type: "new",
      data: getDefaultFormData(belongYear, belongMonth),
    });
  };

  const handleEdit = (index: number) => {
    setViewState({ type: "edit", index, data: { ...earners[index] } });
  };

  const handleComplete = () => {
    if (viewState.type === "list" || !isFormValid) return;
    const earner = buildEarner(viewState.data);
    if (viewState.type === "new") {
      onEarnersChange([...earners, earner]);
    } else {
      const newEarners = [...earners];
      newEarners[viewState.index] = earner;
      onEarnersChange(newEarners);
    }
    setViewState({ type: "list" });
  };

  const handleDeleteRequest = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (viewState.type === "edit") {
      onEarnersChange(earners.filter((_, i) => i !== viewState.index));
    }
    setDeleteConfirmOpen(false);
    setViewState({ type: "list" });
  };

  // 목록 화면
  if (viewState.type === "list") {
    return (
      <div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
        <div className="mt-6">
          <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
            <span className="text-primary-100">원천세 신고</span>
            <span className="text-black-100">를 위해</span>
            <br />
            <span className="text-black-100">
              소득자 정보를 추가해주세요.
            </span>
          </h1>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {earners.map((earner, index) => (
            <EarnerCard
              key={earner.id}
              earner={earner}
              onEdit={() => handleEdit(index)}
            />
          ))}

          <Button
            variant="outline"
            size="xl"
            onClick={handleAdd}
            className="justify-between font-light"
          >
            <span className="text-base text-black-100">소득자 추가</span>
            <PlusCircle size={24} className="text-primary-100" />
          </Button>
        </div>

        <div className="mt-auto pt-8">
          <Button
            onClick={onNext}
            disabled={earners.length === 0}
            size="xl"
            className="w-full"
          >
            다음
          </Button>
        </div>
      </div>
    );
  }

  // 입력/수정 화면
  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
      <div className="mt-6">
        <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight text-black-100">
          소득자의 정보를 입력해주세요.
        </h1>
      </div>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
        <EarnerForm
          earner={viewState.data}
          onChange={(data) =>
            setViewState((prev) =>
              prev.type === "list" ? prev : { ...prev, data },
            )
          }
          onDelete={handleDeleteRequest}
          belongYear={belongYear}
          belongMonth={belongMonth}
        />
      </div>

      <div className="shrink-0 pt-6">
        <button
          type="button"
          onClick={handleDeleteRequest}
          className="mb-4 w-full text-center text-sm text-black-60 underline"
        >
          소득자 정보를 삭제할래요
        </button>
        <Button
          onClick={handleComplete}
          disabled={!isFormValid}
          size="xl"
          className="w-full"
        >
          입력 완료
        </Button>
      </div>

      {/* 삭제 확인 Drawer */}
      <Drawer open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>해당 소득자를 삭제할까요?</DrawerTitle>
            <DrawerDescription>
              삭제하면 다시 입력해야해요.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerFooter className="flex-row gap-3">
            <Button
              variant="outline"
              size="xl"
              className="flex-1"
              onClick={() => setDeleteConfirmOpen(false)}
            >
              취소
            </Button>
            <Button
              size="xl"
              className="flex-1"
              onClick={handleDeleteConfirm}
            >
              삭제
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
