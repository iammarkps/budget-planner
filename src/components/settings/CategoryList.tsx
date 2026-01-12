"use client";

import { Badge } from "@/components/ui/badge";
import type { Database } from "@/../database.types";

type Category = Database["public"]["Tables"]["categories"]["Row"];

type Props = {
  categories: Category[];
};

export default function CategoryList({ categories }: Props) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories yet. Add your first category to organize transactions.
      </p>
    );
  }

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      {incomeCategories.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Income Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((category) => (
              <Badge key={category.id} variant="default">
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {expenseCategories.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Expense Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {expenseCategories.map((category) => (
              <Badge key={category.id} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
