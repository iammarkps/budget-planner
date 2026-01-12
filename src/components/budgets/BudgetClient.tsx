"use client";

import { useState, useTransition } from "react";
import { Copy } from "lucide-react";
import BudgetForm from "./BudgetForm";
import BudgetList from "./BudgetList";
import MonthNavigator from "@/components/ui/MonthNavigator";
import { Button } from "@/components/ui/button";
import { copyLastMonthBudget, getBudgetWithSpending } from "@/app/actions/budgets";
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
  month: initialMonth,
}: Props) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [isPending, startTransition] = useTransition();

  const handleBudgetAdded = (newBudget: BudgetWithSpending) => {
    setBudgets((prev) => [newBudget, ...prev]);
  };

  const handleBudgetDeleted = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  };

  const handleBudgetUpdated = (updatedBudget: BudgetWithSpending) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === updatedBudget.id ? updatedBudget : b))
    );
  };

  const handleMonthChange = (newMonth: string) => {
    startTransition(async () => {
      const result = await getBudgetWithSpending(newMonth);
      setBudgets(result.data ?? []);
      setCurrentMonth(newMonth);
    });
  };

  const handleCopyLastMonth = () => {
    if (!confirm("Copy budget from last month? This will only add missing budgets.")) return;

    startTransition(async () => {
      const result = await copyLastMonthBudget(currentMonth);
      if (result.error) {
        alert(result.error);
      } else {
        // Refresh data
        const refreshResult = await getBudgetWithSpending(currentMonth);
        setBudgets(refreshResult.data ?? []);
        if (result.count) {
          alert(`Successfully copied ${result.count} budgets.`);
        }
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Budgets</h2>
          <p className="text-sm text-muted-foreground">
            Set category budgets for each month.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLastMonth}
            disabled={isPending}
            className="hidden sm:flex"
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Last Month
          </Button>
          <MonthNavigator
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            disabled={isPending}
          />
          <BudgetForm
            categories={categories}
            month={currentMonth}
            onBudgetAdded={handleBudgetAdded}
          />
        </div>
      </header>

      <section className={`rounded-xl border bg-card p-6 shadow-sm ${isPending ? "opacity-50" : ""}`}>
        <BudgetList
          budgets={budgets}
          onBudgetDeleted={handleBudgetDeleted}
          onBudgetUpdated={handleBudgetUpdated}
        />
      </section>
    </div>
  );
}
