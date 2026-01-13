export type MonthlyStats = {
  month: string;
  income: number;
  expense: number;
  savings: number;
};

export type CategoryExpense = {
  category: string;
  amount: number;
  percentage: number;
  color: string;
};

export const monthlyStats: MonthlyStats[] = [
  { month: "Jul", income: 50000, expense: 35000, savings: 15000 },
  { month: "Aug", income: 50000, expense: 38000, savings: 12000 },
  { month: "Sep", income: 55000, expense: 40000, savings: 15000 },
  { month: "Oct", income: 50000, expense: 42000, savings: 8000 },
  { month: "Nov", income: 55000, expense: 36000, savings: 19000 },
  { month: "Dec", income: 60000, expense: 45000, savings: 15000 },
  { month: "Jan", income: 50000, expense: 38000, savings: 12000 },
];

export const categoryExpenses: CategoryExpense[] = [
  { category: "Food & Dining", amount: 5200, percentage: 28, color: "#8B5CF6" },
  { category: "Shopping", amount: 6500, percentage: 35, color: "#A855F7" },
  { category: "Transportation", amount: 2000, percentage: 11, color: "#C084FC" },
  { category: "Entertainment", amount: 4000, percentage: 22, color: "#D8B4FE" },
  { category: "Bills & Utilities", amount: 3500, percentage: 19, color: "#E9D5FF" },
  { category: "Health & Fitness", amount: 1500, percentage: 8, color: "#F3E8FF" },
];

export const expenseTrend = [
  { date: "2024-01-01", amount: 1200 },
  { date: "2024-01-02", amount: 800 },
  { date: "2024-01-03", amount: 1500 },
  { date: "2024-01-04", amount: 0 },
  { date: "2024-01-05", amount: 2200 },
  { date: "2024-01-06", amount: 1800 },
  { date: "2024-01-07", amount: 1000 },
  { date: "2024-01-08", amount: 2500 },
  { date: "2024-01-09", amount: 1500 },
  { date: "2024-01-10", amount: 3000 },
  { date: "2024-01-11", amount: 1200 },
  { date: "2024-01-12", amount: 800 },
  { date: "2024-01-13", amount: 1800 },
  { date: "2024-01-14", amount: 2200 },
  { date: "2024-01-15", amount: 0 },
  { date: "2024-01-16", amount: 1200 },
  { date: "2024-01-17", amount: 3500 },
  { date: "2024-01-18", amount: 800 },
  { date: "2024-01-19", amount: 2500 },
  { date: "2024-01-20", amount: 1500 },
  { date: "2024-01-21", amount: 2000 },
  { date: "2024-01-22", amount: 500 },
  { date: "2024-01-23", amount: 3000 },
  { date: "2024-01-24", amount: 1200 },
  { date: "2024-01-25", amount: 800 },
  { date: "2024-01-26", amount: 2000 },
  { date: "2024-01-27", amount: 1500 },
  { date: "2024-01-28", amount: 1000 },
  { date: "2024-01-29", amount: 0 },
  { date: "2024-01-30", amount: 1800 },
  { date: "2024-01-31", amount: 2200 },
];

export const currentMonthStats = {
  totalBalance: 125000,
  thisMonthIncome: 50000,
  thisMonthExpense: 38000,
  savingsRate: 24,
};



