export type Loan = {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  monthlyPayment: number;
  interestRate: number;
  startDate: string;
  endDate: string;
  type: "personal" | "home" | "car" | "education" | "credit_card";
};

export const loans: Loan[] = [
  {
    id: "1",
    name: "Home Loan",
    totalAmount: 5000000,
    remainingAmount: 3200000,
    monthlyPayment: 45000,
    interestRate: 8.5,
    startDate: "2020-01-15",
    endDate: "2035-01-15",
    type: "home",
  },
  {
    id: "2",
    name: "Car Loan",
    totalAmount: 800000,
    remainingAmount: 450000,
    monthlyPayment: 15000,
    interestRate: 9.0,
    startDate: "2022-06-01",
    endDate: "2027-06-01",
    type: "car",
  },
  {
    id: "3",
    name: "Personal Loan",
    totalAmount: 500000,
    remainingAmount: 200000,
    monthlyPayment: 12000,
    interestRate: 12.0,
    startDate: "2023-03-10",
    endDate: "2026-03-10",
    type: "personal",
  },
  {
    id: "4",
    name: "Credit Card Debt",
    totalAmount: 150000,
    remainingAmount: 75000,
    monthlyPayment: 5000,
    interestRate: 18.0,
    startDate: "2023-11-01",
    endDate: "2025-11-01",
    type: "credit_card",
  },
];




