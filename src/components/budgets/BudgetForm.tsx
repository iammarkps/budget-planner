"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createBudget } from "@/app/actions/budgets";
import type { BudgetWithSpending, Category } from "@/types/budget";


type Props = {
  categories: Category[];
  month: string;
  onBudgetAdded?: (budget: BudgetWithSpending) => void;
};

export default function BudgetForm({ categories, month, onBudgetAdded }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Parse YYYY-MM safely
  const date = parse(month, "yyyy-MM", new Date());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createBudget({
      category_id: categoryId,
      amount: parseFloat(amount) || 0,
      month,
      rollover: true,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data && onBudgetAdded) {
      // New budget has no spending yet
      onBudgetAdded({
        ...result.data,
        spent: 0,
        remaining: result.data.amount,
        percentUsed: 0,
      });
    }

    setOpen(false);
    setCategoryId("");
    setAmount("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add budget</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add Budget for {format(date, "MMMM yyyy")}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {expenseCategories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create expense categories in Settings first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Budget (THB)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !categoryId || !amount}>
              {loading ? "Adding..." : "Add Budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
