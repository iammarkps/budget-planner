"use client";

import { useState } from "react";
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
import { createRecurringTransaction } from "@/app/actions/recurring";
import type { Database } from "@/../database.types";

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

type Props = {
  accounts: Account[];
  categories: Category[];
  onCreated?: (recurring: unknown) => void;
};

const frequencies = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const daysOfWeek = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

export default function RecurringForm({ accounts, categories, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [note, setNote] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createRecurringTransaction({
      account_id: accountId,
      category_id: categoryId || null,
      type,
      amount: parseFloat(amount) || 0,
      merchant: merchant || null,
      note: note || null,
      frequency: frequency as "daily" | "weekly" | "monthly" | "yearly",
      day_of_month: frequency === "monthly" ? parseInt(dayOfMonth) : null,
      day_of_week: frequency === "weekly" ? parseInt(dayOfWeek) : null,
      start_date: startDate,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onCreated?.(result.data);
    setOpen(false);
    resetForm();
  };

  function resetForm() {
    setAccountId("");
    setCategoryId("");
    setType("expense");
    setAmount("");
    setMerchant("");
    setNote("");
    setFrequency("monthly");
    setDayOfMonth("1");
    setDayOfWeek("1");
    setStartDate(new Date().toISOString().split("T")[0]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Recurring</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Recurring Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Amount (THB)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category (optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Merchant/Description</Label>
            <Input
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g., Netflix, Rent, Salary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f.value} value={f.value}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {frequency === "weekly" && (
              <div className="space-y-2">
                <Label>Day of Week</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {frequency === "monthly" && (
              <div className="space-y-2">
                <Label>Day of Month</Label>
                <Input
                  type="number"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  min="1"
                  max="31"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !accountId || !amount}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
