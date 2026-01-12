"use client";

import { useState } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";

import { deleteBudget, updateBudget } from "@/app/actions/budgets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BudgetWithSpending } from "@/types/budget";

type BudgetListProps = {
  budgets: BudgetWithSpending[];
  onBudgetDeleted?: (id: string) => void;
  onBudgetUpdated?: (budget: BudgetWithSpending) => void;
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

export default function BudgetList({
  budgets,
  onBudgetDeleted,
  onBudgetUpdated,
}: BudgetListProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleDelete(id: string) {
    if (!confirm("Delete this budget?")) return;

    setDeleting(id);
    const result = await deleteBudget(id);

    if (result.error) {
      alert(result.error);
      setDeleting(null);
      return;
    }

    onBudgetDeleted?.(id);
    setDeleting(null);
  }

  function startEdit(budget: BudgetWithSpending) {
    setEditingId(budget.id);
    setEditAmount(budget.amount.toString());
  }

  function cancelEdit() {
    setEditingId(null);
    setEditAmount("");
  }

  async function saveEdit(budget: BudgetWithSpending) {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setSaving(true);
    const result = await updateBudget(budget.id, { amount: newAmount });

    if (result.error) {
      alert(result.error);
      setSaving(false);
      return;
    }

    if (result.data) {
      // Recalculate spent values
      const updatedBudget: BudgetWithSpending = {
        ...result.data,
        spent: budget.spent,
        remaining: newAmount - budget.spent,
        percentUsed: newAmount > 0 ? (budget.spent / newAmount) * 100 : 0,
      };
      onBudgetUpdated?.(updatedBudget);
    }

    setEditingId(null);
    setEditAmount("");
    setSaving(false);
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
          const isEditing = editingId === budget.id;

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
                  {isEditing ? (
                    <>
                      <Input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="w-28"
                        min="0"
                        disabled={saving}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => saveEdit(budget)}
                        disabled={saving}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cancelEdit}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">
                        {budget.spent.toLocaleString()} / {budget.amount.toLocaleString()} THB
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(budget)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(budget.id)}
                        disabled={deleting === budget.id}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  )}
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
