import type { Database } from "@/../database.types";

export type Category = Database["public"]["Tables"]["categories"]["Row"];

type BudgetRow = Database["public"]["Tables"]["budgets"]["Row"];

export type BudgetWithSpending = BudgetRow & {
  category: { id: string; name: string; type: string } | null;
  spent: number;
  remaining: number;
  percentUsed: number;
};
