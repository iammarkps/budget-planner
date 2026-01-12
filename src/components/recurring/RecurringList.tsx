"use client";

import { useState } from "react";
import { Trash2, Pause, Play } from "lucide-react";

import { deleteRecurringTransaction, toggleRecurringTransaction } from "@/app/actions/recurring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type RecurringWithRelations = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  type: string;
  amount: number;
  currency_code: string;
  merchant: string | null;
  note: string | null;
  frequency: string;
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  next_occurrence: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account: { id: string; name: string } | null;
  category: { id: string; name: string; type: string } | null;
};

type RecurringListProps = {
  recurring: RecurringWithRelations[];
  onDeleted?: (id: string) => void;
  onToggled?: (id: string, isActive: boolean) => void;
};

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

const dayOfWeekLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatNextOccurrence(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFrequencyDetail(item: RecurringWithRelations): string {
  switch (item.frequency) {
    case "weekly":
      return item.day_of_week != null
        ? `Every ${dayOfWeekLabels[item.day_of_week]}`
        : "Weekly";
    case "monthly":
      return item.day_of_month
        ? `Day ${item.day_of_month} of each month`
        : "Monthly";
    case "yearly":
      return "Yearly";
    default:
      return frequencyLabels[item.frequency] || item.frequency;
  }
}

export default function RecurringList({
  recurring,
  onDeleted,
  onToggled,
}: RecurringListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this recurring transaction?")) return;

    setLoading(id);
    const result = await deleteRecurringTransaction(id);

    if (result.error) {
      alert(result.error);
      setLoading(null);
      return;
    }

    onDeleted?.(id);
    setLoading(null);
  }

  async function handleToggle(id: string, currentState: boolean) {
    setLoading(id);
    const result = await toggleRecurringTransaction(id, !currentState);

    if (result.error) {
      alert(result.error);
      setLoading(null);
      return;
    }

    onToggled?.(id, !currentState);
    setLoading(null);
  }

  if (recurring.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No recurring transactions set up. Add your first one to automate regular income or expenses.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recurring.map((item) => (
        <div
          key={item.id}
          className={`rounded-lg border bg-card p-4 shadow-sm ${
            !item.is_active ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {item.merchant || item.category?.name || "Untitled"}
                  </h3>
                  <Badge
                    variant={item.type === "income" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {item.type}
                  </Badge>
                  {!item.is_active && (
                    <Badge variant="outline" className="text-xs">
                      Paused
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getFrequencyDetail(item)} • Next: {formatNextOccurrence(item.next_occurrence)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-lg font-semibold ${
                  item.type === "income" ? "text-green-600" : "text-red-600"
                }`}
              >
                {item.type === "income" ? "+" : "-"}
                {item.amount.toLocaleString()} {item.currency_code}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggle(item.id, item.is_active)}
                  disabled={loading === item.id}
                  title={item.is_active ? "Pause" : "Resume"}
                >
                  {item.is_active ? (
                    <Pause className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Play className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(item.id)}
                  disabled={loading === item.id}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </div>
          </div>

          {item.note && (
            <p className="mt-2 text-sm text-muted-foreground">
              {item.note}
            </p>
          )}

          <div className="mt-2 text-xs text-muted-foreground">
            Account: {item.account?.name || "Unknown"}
            {item.category && ` • Category: ${item.category.name}`}
          </div>
        </div>
      ))}
    </div>
  );
}
