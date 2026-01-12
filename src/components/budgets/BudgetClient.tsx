"use client";

import { useState } from "react";
import BudgetForm from "./BudgetForm";
import BudgetList from "./BudgetList";
import type { BudgetWithSpending, Category } from "@/types/budget";


type Props = {
  initialBudgets: BudgetWithSpending[];
  categories: Category[];
  month: string;
  monthDisplay: string;
};

export default function BudgetClient({
  initialBudgets,
  categories,
  month,
  monthDisplay,
}: Props) {
  const [budgets, setBudgets] = useState(initialBudgets);

  const handleBudgetAdded = (newBudget: BudgetWithSpending) => {
    setBudgets((prev) => [newBudget, ...prev]);
  };

  const handleBudgetDeleted = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Budgets</h2>
          <p className="text-sm text-muted-foreground">
            Set category budgets for {monthDisplay}.
          </p>
        </div>
        <BudgetForm
          categories={categories}
          month={month}
          onBudgetAdded={handleBudgetAdded}
        />
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <BudgetList budgets={budgets} onBudgetDeleted={handleBudgetDeleted} />
      </section>
    </div>
  );
}
