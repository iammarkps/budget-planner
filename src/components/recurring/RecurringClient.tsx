"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import RecurringForm from "./RecurringForm";
import RecurringList from "./RecurringList";
import { processRecurringTransactions } from "@/app/actions/recurring";
import { Button } from "@/components/ui/button";
import type { Database } from "@/../database.types";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

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

type Props = {
  initialRecurring: RecurringWithRelations[];
  accounts: Account[];
  categories: Category[];
};

export default function RecurringClient({
  initialRecurring,
  accounts,
  categories,
}: Props) {
  const [recurring, setRecurring] = useState(initialRecurring);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<string | null>(null);

  const handleCreated = (newRecurring: unknown) => {
    setRecurring((prev) => [newRecurring as RecurringWithRelations, ...prev]);
  };

  const handleDeleted = (id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggled = (id: string, isActive: boolean) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, is_active: isActive } : r))
    );
  };

  const handleProcess = async () => {
    setProcessing(true);
    setProcessResult(null);

    const result = await processRecurringTransactions();

    setProcessing(false);

    if (result.error) {
      setProcessResult(`Error: ${result.error}`);
    } else if (result.processed === 0) {
      setProcessResult("No transactions due today.");
    } else {
      setProcessResult(`Created ${result.processed} transaction(s).`);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Recurring Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Automate regular income and expenses.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleProcess}
            disabled={processing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${processing ? "animate-spin" : ""}`} />
            {processing ? "Processing..." : "Process Due"}
          </Button>
          <RecurringForm
            accounts={accounts}
            categories={categories}
            onCreated={handleCreated}
          />
        </div>
      </header>

      {processResult && (
        <div className="rounded-md bg-muted px-4 py-2 text-sm">
          {processResult}
        </div>
      )}

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <RecurringList
          recurring={recurring}
          onDeleted={handleDeleted}
          onToggled={handleToggled}
        />
      </section>
    </div>
  );
}
