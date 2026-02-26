export type IncomeType = "OTHER" | "BUSINESS";

export const INCOME_TYPE_OPTIONS: { value: IncomeType; label: string }[] = [
  { value: "OTHER", label: "기타소득" },
  { value: "BUSINESS", label: "사업소득" },
];
export type AmountType = "pre-tax" | "after-tax";

export interface IncomeEarner {
  id: string;
  name: string;
  residentNumber: string;
  phone: string;
  incomeType: IncomeType;
  incomeCode: string;
  paymentDate: string;
  amountType: AmountType;
  amount: number;
}

export interface TaxCalculation {
  nationalTax: number;
  localTax: number;
  surcharge?: number;
  totalTax: number;
}
