export type Budget = {
  id: string;
  category: string;
  monthlyLimit: number;
  currentSpent: number;
  icon?: string;
};

export const budgets: Budget[] = [
  {
    id: "1",
    category: "Food & Dining",
    monthlyLimit: 8000,
    currentSpent: 5200,
    icon: "🍔",
  },
  {
    id: "2",
    category: "Shopping",
    monthlyLimit: 10000,
    currentSpent: 6500,
    icon: "🛍️",
  },
  {
    id: "3",
    category: "Transportation",
    monthlyLimit: 5000,
    currentSpent: 2000,
    icon: "🚗",
  },
  {
    id: "4",
    category: "Entertainment",
    monthlyLimit: 6000,
    currentSpent: 4000,
    icon: "🎬",
  },
  {
    id: "5",
    category: "Bills & Utilities",
    monthlyLimit: 8000,
    currentSpent: 3500,
    icon: "💡",
  },
  {
    id: "6",
    category: "Health & Fitness",
    monthlyLimit: 3000,
    currentSpent: 1500,
    icon: "💊",
  },
  {
    id: "7",
    category: "Education",
    monthlyLimit: 5000,
    currentSpent: 2000,
    icon: "📚",
  },
  {
    id: "8",
    category: "Travel",
    monthlyLimit: 15000,
    currentSpent: 8000,
    icon: "✈️",
  },
];



