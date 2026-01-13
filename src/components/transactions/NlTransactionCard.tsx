"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TransactionParsingSkeleton } from "./TransactionParsingSkeleton";
import type { TransactionSchema } from "@/lib/ai/transactionSchema";
import {
  saveTransactions,
  getAccounts,
  getCategories,
  createCategory,
} from "@/app/actions/transactions";
import type { Database } from "@/../database.types";

const LOADING_MESSAGES = [
  "Reading your input...",
  "Understanding the transaction...",
  "Extracting details...",
  "Almost there...",
];

type Account = Database["public"]["Tables"]["accounts"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

export default function NlTransactionCard() {
  const [input, setInput] = useState("");
  const [pendingInput, setPendingInput] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "parsed" | "saving" | "saved" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransactionSchema | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  // Editable fields state
  const [editedType, setEditedType] = useState<"income" | "expense">("expense");
  const [editedAmount, setEditedAmount] = useState("");
  const [editedCurrency, setEditedCurrency] = useState("THB");
  const [editedMerchant, setEditedMerchant] = useState("");
  const [editedDate, setEditedDate] = useState("");
  const [editedNote, setEditedNote] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadData() {
      const [accountsResult, categoriesResult] = await Promise.all([
        getAccounts(),
        getCategories(),
      ]);
      if (accountsResult.data) {
        setAccounts(accountsResult.data);
        if (accountsResult.data.length > 0) {
          setSelectedAccountId(accountsResult.data[0].id);
        }
      }
      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }
    }
    loadData();
  }, []);

  // Rotate loading messages while parsing
  useEffect(() => {
    if (status !== "loading") {
      setLoadingMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) =>
        prev < LOADING_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [status]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleCancelParsing = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus("idle");
    setPendingInput("");
    setLoadingMessageIndex(0);
  }, []);

  const handleParse = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;

    // Store input for optimistic display and create abort controller
    setPendingInput(input.trim());
    abortControllerRef.current = new AbortController();

    setStatus("loading");
    setError(null);
    setResult(null);
    setSuggestedCategory(null);
    setSelectedCategoryId("");
    setIsNewCategory(false);

    try {
      const response = await fetch("/api/ai/parse-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          baseCurrency: "THB",
          categories: categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
          })),
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to parse transaction.");
      }

      const data = (await response.json()) as TransactionSchema;
      setResult(data);
      setPendingInput("");
      setStatus("parsed");

      // Initialize editable fields with parsed values
      if (data.entries[0]) {
        setEditedType(data.entries[0].type);
        setEditedAmount(data.entries[0].amount.toString());
        setEditedCurrency(data.entries[0].currency);
        setEditedMerchant(data.entries[0].merchant || "");
        setEditedDate(data.entries[0].occurred_at || "");
        setEditedNote(data.entries[0].note || "");
      }

      // Auto-select category if AI suggested one
      if (data.entries[0]?.category) {
        const suggestedName = data.entries[0].category;
        setSuggestedCategory(suggestedName);

        // Find matching category by name
        const matchedCategory = categories.find(
          (c) =>
            c.name.toLowerCase() === suggestedName.toLowerCase() &&
            c.type === data.entries[0].type
        );

        if (matchedCategory) {
          setSelectedCategoryId(matchedCategory.id);
          setIsNewCategory(false);
        } else {
          // This is a new category suggestion
          setIsNewCategory(true);
        }
      }
    } catch (errorCaught) {
      // Ignore abort errors (user cancelled)
      if (errorCaught instanceof Error && errorCaught.name === "AbortError") {
        return;
      }
      setStatus("error");
      setPendingInput("");
      setError(
        errorCaught instanceof Error ? errorCaught.message : "Unexpected error"
      );
    }
  };

  const handleCreateCategory = async () => {
    if (!suggestedCategory) return;

    setCreatingCategory(true);
    const createResult = await createCategory({
      name: suggestedCategory,
      type: editedType,
    });

    if (createResult.error) {
      setError(createResult.error);
      setCreatingCategory(false);
      return;
    }

    if (createResult.data) {
      // Add the new category to the list and select it
      setCategories((prev) => [...prev, createResult.data]);
      setSelectedCategoryId(createResult.data.id);
      setIsNewCategory(false);
    }
    setCreatingCategory(false);
  };

  const handleSave = async () => {
    if (!result || !selectedAccountId) return;

    // Validate amount
    const amount = parseFloat(editedAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid positive amount");
      return;
    }

    setStatus("saving");
    setError(null);

    // Create edited entry from user's edits
    const editedEntry = {
      type: editedType,
      amount: amount,
      currency: editedCurrency,
      merchant: editedMerchant || null,
      category: result.entries[0]?.category || null,
      account: null,
      occurred_at: editedDate || null,
      note: editedNote || null,
    };

    const saveResult = await saveTransactions({
      entries: [editedEntry],
      rawInput: input,
      accountId: selectedAccountId,
      categoryId: selectedCategoryId || null,
    });

    if (saveResult.error) {
      setStatus("error");
      setError(saveResult.error);
      return;
    }

    setStatus("saved");
    setInput("");
    setResult(null);
    setSuggestedCategory(null);
    setSelectedCategoryId("");
    setIsNewCategory(false);
    // Reset edited fields
    setEditedType("expense");
    setEditedAmount("");
    setEditedCurrency("THB");
    setEditedMerchant("");
    setEditedDate("");
    setEditedNote("");
    setTimeout(() => setStatus("idle"), 2000);
  };

  const handleCancel = () => {
    setResult(null);
    setStatus("idle");
    setError(null);
    setSuggestedCategory(null);
    setSelectedCategoryId("");
    setIsNewCategory(false);
    // Reset edited fields
    setEditedType("expense");
    setEditedAmount("");
    setEditedCurrency("THB");
    setEditedMerchant("");
    setEditedDate("");
    setEditedNote("");
  };

  const filteredCategories = result
    ? categories.filter((c) => c.type === editedType)
    : categories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Natural language entry</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={handleParse}>
          <Input
            placeholder="e.g. Grab ride 220 THB yesterday"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={status === "loading" || status === "parsed"}
          />
          {status !== "parsed" && status !== "loading" && (
            <Button type="submit" disabled={!input.trim()}>
              Parse
            </Button>
          )}
          {status === "loading" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelParsing}
            >
              Cancel
            </Button>
          )}
        </form>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {status === "saved" && (
          <p className="text-sm text-green-600">Transaction saved!</p>
        )}

        {status === "loading" && pendingInput && (
          <TransactionParsingSkeleton
            inputText={pendingInput}
            loadingMessage={LOADING_MESSAGES[loadingMessageIndex]}
          />
        )}

        {result && (status === "parsed" || status === "saving") && (
          <div className="space-y-4">
            <div className="rounded-md border p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Transaction Details (Edit as needed)
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={editedType}
                    onValueChange={(value) => {
                      setEditedType(value as "income" | "expense");
                      // Reset category when type changes
                      setSelectedCategoryId("");
                    }}
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedAmount}
                    onChange={(e) => setEditedAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={editedCurrency}
                    onValueChange={setEditedCurrency}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="JPY">JPY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    type="text"
                    value={editedMerchant}
                    onChange={(e) => setEditedMerchant(e.target.value)}
                    placeholder="e.g. Starbucks"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="date">Date (YYYY-MM-DD)</Label>
                  <Input
                    id="date"
                    type="text"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    placeholder="e.g. 2026-01-13 or leave blank for today"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="note">Note</Label>
                  <Textarea
                    id="note"
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    placeholder="Optional notes"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {isNewCategory && suggestedCategory && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                <p className="text-sm text-green-800 dark:text-green-200">
                  <span className="font-medium">New category suggested:</span> {suggestedCategory}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory}
                >
                  {creatingCategory ? "Creating..." : `Create "${suggestedCategory}" category`}
                </Button>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account">Account</Label>
                <Select
                  value={selectedAccountId}
                  onValueChange={setSelectedAccountId}
                >
                  <SelectTrigger id="account">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category
                  {suggestedCategory && selectedCategoryId && !isNewCategory && (
                    <span className="ml-2 text-xs text-green-600">(auto)</span>
                  )}
                </Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={(value) => {
                    setSelectedCategoryId(value);
                    setIsNewCategory(false);
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={isNewCategory ? "Create new or select" : "Select category"} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={status === "saving" || !selectedAccountId}
              >
                {status === "saving" ? "Saving..." : "Save Transaction"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {accounts.length === 0 && status === "idle" && (
          <p className="text-xs text-muted-foreground">
            Create an account in Settings before adding transactions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
