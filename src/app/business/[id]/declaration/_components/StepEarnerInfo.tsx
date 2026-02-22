"use client";

import { useState } from "react";
import { PlusCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { IncomeEarner } from "../types";
import { EarnerForm } from "./EarnerForm";
import { EarnerCard } from "./EarnerCard";

interface StepEarnerInfoProps {
  earners: IncomeEarner[];
  onEarnersChange: (earners: IncomeEarner[]) => void;
  onNext: () => void;
}

const ORDER_LABELS = [
  "첫 번째",
  "두 번째",
  "세 번째",
  "네 번째",
  "다섯 번째",
  "여섯 번째",
  "일곱 번째",
  "여덟 번째",
  "아홉 번째",
  "열 번째",
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

type EditState =
  | { type: "idle" }
  | { type: "new"; data: Partial<IncomeEarner> }
  | { type: "edit"; index: number; data: Partial<IncomeEarner> };

function getDefaultFormData(): Partial<IncomeEarner> {
  const now = new Date();
  return {
    incomeType: "기타소득",
    incomeCode: "76",
    amountType: "pre-tax",
    paymentDate: `${now.getFullYear()}. ${String(now.getMonth() + 1).padStart(2, "0")}. 01`,
  };
}

function buildEarner(data: Partial<IncomeEarner>): IncomeEarner {
  return {
    id: data.id || generateId(),
    name: data.name || "",
    residentNumber: data.residentNumber || "",
    phone: data.phone || "",
    incomeType: data.incomeType || "기타소득",
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
}: StepEarnerInfoProps) {
  const [editState, setEditState] = useState<EditState>({ type: "idle" });

  const currentOrderIndex =
    editState.type === "new"
      ? earners.length
      : editState.type === "edit"
        ? editState.index
        : Math.max(0, earners.length - 1);

  const orderLabel =
    ORDER_LABELS[currentOrderIndex] ?? `${currentOrderIndex + 1}번째`;

  const isFormValid =
    editState.type !== "idle" &&
    !!(
      editState.data.name &&
      editState.data.residentNumber &&
      editState.data.phone &&
      editState.data.amount &&
      editState.data.amount > 0
    );

  const handleAdd = () => {
    setEditState({ type: "new", data: getDefaultFormData() });
  };

  const handleSaveAndAdd = () => {
    if (editState.type === "idle") return;
    const earner = buildEarner(editState.data);
    let newEarners: IncomeEarner[];
    if (editState.type === "new") {
      newEarners = [...earners, earner];
    } else {
      newEarners = [...earners];
      newEarners[editState.index] = earner;
    }
    onEarnersChange(newEarners);
    setEditState({ type: "new", data: getDefaultFormData() });
  };

  const handleDelete = () => {
    if (editState.type === "edit") {
      onEarnersChange(earners.filter((_, i) => i !== editState.index));
    }
    setEditState({ type: "idle" });
  };

  const handleEdit = (index: number) => {
    setEditState({ type: "edit", index, data: { ...earners[index] } });
  };

  const handleNext = () => {
    if (editState.type !== "idle" && isFormValid) {
      const earner = buildEarner(editState.data);
      let newEarners: IncomeEarner[];
      if (editState.type === "new") {
        newEarners = [...earners, earner];
      } else {
        newEarners = [...earners];
        newEarners[editState.index] = earner;
      }
      onEarnersChange(newEarners);
      setEditState({ type: "idle" });
      onNext();
    } else if (editState.type === "idle" && earners.length > 0) {
      onNext();
    }
  };

  const canProceed =
    (editState.type === "idle" && earners.length > 0) ||
    (editState.type !== "idle" && isFormValid);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-8">
      {/* 제목 */}
      <div className="mt-6">
        <h1 className="text-[22px] font-bold leading-[1.45] tracking-tight">
          <span className="text-primary-100">{orderLabel}</span>
          <br />
          <span className="text-black-100">
            소득자의 정보를 입력해주세요.
          </span>
          <Info size={22} className="ml-1 inline text-primary-100" />
        </h1>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {/* 완료된 소득자 카드 */}
        {earners.map((earner, index) =>
          editState.type === "edit" && editState.index === index ? null : (
            <EarnerCard
              key={earner.id}
              earner={earner}
              onEdit={() => handleEdit(index)}
            />
          ),
        )}

        {/* 현재 편집 중인 폼 */}
        {editState.type !== "idle" && (
          <EarnerForm
            earner={editState.data}
            onChange={(data) =>
              setEditState((prev) =>
                prev.type === "idle" ? prev : { ...prev, data },
              )
            }
            onDelete={handleDelete}
          />
        )}

        {/* 소득자 추가 버튼 */}
        {editState.type === "idle" ? (
          <Button
            variant="outline"
            size="xl"
            onClick={handleAdd}
            className="justify-between font-light"
          >
            <span className="text-base text-black-100">
              {earners.length === 0 ? "소득자 추가" : "소득자 추가 입력"}
            </span>
            <PlusCircle size={24} className="text-primary-100" />
          </Button>
        ) : isFormValid ? (
          <Button
            variant="outline"
            size="xl"
            onClick={handleSaveAndAdd}
            className="justify-between font-light"
          >
            <span className="text-base text-black-100">소득자 추가</span>
            <PlusCircle size={24} className="text-primary-100" />
          </Button>
        ) : null}
      </div>

      {/* 다음 버튼 */}
      <div className="mt-auto pt-8">
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="xl"
          className="w-full"
        >
          다음
        </Button>
      </div>
    </div>
  );
}
