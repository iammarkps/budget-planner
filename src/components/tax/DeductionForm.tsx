"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createTaxDeduction } from "@/app/actions/tax";
import { THAI_DEDUCTION_CATEGORIES } from "@/lib/tax/deductions";

type Props = {
  taxYear: number;
  onSuccess?: () => void;
};

export default function DeductionForm({ taxYear, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const selectedCategory = THAI_DEDUCTION_CATEGORIES.find(
    (c) => c.id === category
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createTaxDeduction({
      name: name || selectedCategory?.name || "Deduction",
      category,
      amount: parseFloat(amount) || 0,
      cap_amount: selectedCategory?.maxCap ?? (parseFloat(amount) || null),
      cap_percent: (selectedCategory && "maxPercent" in selectedCategory) ? selectedCategory.maxPercent : null,
      description: description || null,
      tax_year: taxYear,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOpen(false);
    setName("");
    setCategory("");
    setAmount("");
    setDescription("");
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add deduction</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Tax Deduction ({taxYear})</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {THAI_DEDUCTION_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                    {cat.maxCap && ` (max ${cat.maxCap.toLocaleString()})`}
                    {"maxPercent" in cat && cat.maxPercent && ` (max ${cat.maxPercent * 100}%)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={selectedCategory?.name || "e.g. AIA Life Insurance"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (THB)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min="0"
              required
            />
            {selectedCategory?.maxCap && (
              <p className="text-xs text-muted-foreground">
                Maximum deductible: {selectedCategory.maxCap.toLocaleString()} THB
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Notes (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Policy number, provider, etc."
              rows={2}
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
            <Button type="submit" disabled={loading || !category || !amount}>
              {loading ? "Adding..." : "Add Deduction"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
