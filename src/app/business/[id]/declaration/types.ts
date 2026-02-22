export type IncomeType = "기타소득" | "사업소득";
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
