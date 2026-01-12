"use client";

import { useState, useTransition } from "react";
import TransactionList from "./TransactionList";
import TransactionFilters, { type FilterState } from "./TransactionFilters";
import { getTransactions } from "@/app/actions/transactions";

type Transaction = {
  id: string;
  type: string;
  amount_original: number;
  amount_base_thb: number;
  currency_code: string;
  merchant: string | null;
  note: string | null;
  occurred_at: string;
  account: { id: string; name: string } | null;
  category: { id: string; name: string; type: string } | null;
};

type Props = {
  initialTransactions: Transaction[];
};

export default function TransactionClient({ initialTransactions }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isPending, startTransition] = useTransition();

  const handleFilterChange = (filters: FilterState) => {
    startTransition(async () => {
      const result = await getTransactions({
        limit: 100,
        type: filters.type === "all" ? undefined : filters.type,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      if (result.data) {
        // Client-side filter for search
        let filtered = result.data;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            (tx) =>
              tx.merchant?.toLowerCase().includes(searchLower) ||
              tx.note?.toLowerCase().includes(searchLower) ||
              tx.category?.name.toLowerCase().includes(searchLower)
          );
        }
        setTransactions(filtered);
      }
    });
  };

  return (
    <div className="space-y-6">
      <TransactionFilters onFilterChange={handleFilterChange} />

      <section className={`rounded-xl border bg-card p-6 shadow-sm ${isPending ? "opacity-50" : ""}`}>
        <TransactionList transactions={transactions} />
      </section>
    </div>
  );
}
