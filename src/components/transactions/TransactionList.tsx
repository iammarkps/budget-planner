"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteTransaction } from "@/app/actions/transactions";
import { Trash2 } from "lucide-react";

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
  transactions: Transaction[];
};

export default function TransactionList({ transactions: initialTransactions }: Props) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;

    setDeleting(id);
    const result = await deleteTransaction(id);

    if (result.error) {
      alert(result.error);
      setDeleting(null);
      return;
    }

    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totals = filteredTransactions.reduce(
    (acc, tx) => {
      if (tx.type === "income") {
        acc.income += tx.amount_base_thb;
      } else {
        acc.expense += tx.amount_base_thb;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={filter}
          onValueChange={(v) => setFilter(v as "all" | "income" | "expense")}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-4 text-sm">
          <span className="text-green-600">
            Income: {totals.income.toLocaleString()} THB
          </span>
          <span className="text-red-600">
            Expense: {totals.expense.toLocaleString()} THB
          </span>
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          No transactions found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(tx.occurred_at)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tx.type === "income" ? "default" : "secondary"}
                    >
                      {tx.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.merchant || "-"}</TableCell>
                  <TableCell>{tx.category?.name || "-"}</TableCell>
                  <TableCell>{tx.account?.name || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span
                      className={
                        tx.type === "income" ? "text-green-600" : "text-red-600"
                      }
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {tx.amount_original.toLocaleString()} {tx.currency_code}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tx.id)}
                      disabled={deleting === tx.id}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
