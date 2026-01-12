"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

import { deleteBudget } from "@/app/actions/budgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BudgetWithSpending = {
  id: string;
  category_id: string;
  amount: number;
  month: string;
  rollover: boolean;
  category: { id: string; name: string; type: string } | null;
  spent: number;
  remaining: number;
  percentUsed: number;
};

type BudgetListProps = {
  budgets: BudgetWithSpending[];
};

function getProgressBarColor(percentUsed: number): string {
  if (percentUsed >= 100) {
    return "bg-red-500";
  }
  if (percentUsed >= 80) {
    return "bg-yellow-500";
  }
  return "bg-green-500";
}

function formatRemainingText(remaining: number): string {
  if (remaining >= 0) {
    return `${remaining.toLocaleString()} THB remaining`;
  }
  return `${Math.abs(remaining).toLocaleString()} THB over budget`;
}

export default function BudgetList({ budgets: initialBudgets }: BudgetListProps) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this budget?")) return;

    setDeleting(id);
    const result = await deleteBudget(id);

    if (result.error) {
      alert(result.error);
      setDeleting(null);
      return;
    }

    setBudgets((prev) => prev.filter((b) => b.id !== id));
    setDeleting(null);
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  if (budgets.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No budgets set for this month. Add your first budget to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalBudget.toLocaleString()} THB</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {totalSpent.toLocaleString()} THB
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                totalRemaining >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {totalRemaining.toLocaleString()} THB
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => {
          const remainingColor = budget.remaining >= 0 ? "text-green-600" : "text-red-600";

          return (
            <div
              key={budget.id}
              className="rounded-lg border bg-card p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {budget.category?.name ?? "Unknown"}
                  </h3>
                  {budget.rollover && (
                    <Badge variant="outline" className="text-xs">
                      Rollover
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {budget.spent.toLocaleString()} / {budget.amount.toLocaleString()} THB
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(budget.id)}
                    disabled={deleting === budget.id}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`absolute left-0 top-0 h-full transition-all ${getProgressBarColor(budget.percentUsed)}`}
                  style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                />
              </div>

              <div className="mt-2 flex justify-between text-sm">
                <span className={remainingColor}>
                  {formatRemainingText(budget.remaining)}
                </span>
                <span className="text-muted-foreground">
                  {budget.percentUsed.toFixed(0)}% used
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
