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

interface ExampleTransaction {
  text: string;
  description: string;
}

const EXAMPLE_TRANSACTIONS: ExampleTransaction[] = [
  { text: "Grab ride 180", description: "Expense" },
  { text: "Salary 50000", description: "Income" },
  { text: "Lunch 350, coffee 95", description: "Multiple" },
  { text: "Dinner 1600, paid for friends", description: "Split bill" },
  { text: "Reimbursement 800 from Mark", description: "Payback" },
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
    if (!suggestedCategory || !result?.entries[0]?.type) return;

    setCreatingCategory(true);
    const createResult = await createCategory({
      name: suggestedCategory,
      type: result.entries[0].type as "income" | "expense",
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

    setStatus("saving");
    setError(null);

    const saveResult = await saveTransactions({
      entries: result.entries,
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
    setTimeout(() => setStatus("idle"), 2000);
  };

  const handleCancel = () => {
    setResult(null);
    setStatus("idle");
    setError(null);
    setSuggestedCategory(null);
    setSelectedCategoryId("");
    setIsNewCategory(false);
  };

  const filteredCategories = result?.entries[0]?.type
    ? categories.filter((c) => c.type === result.entries[0].type)
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

        {status === "idle" && !input && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Try an example:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TRANSACTIONS.map((example) => (
                <button
                  key={example.text}
                  type="button"
                  onClick={() => setInput(example.text)}
                  className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-muted"
                >
                  <span>{example.text}</span>
                  <span className="text-muted-foreground">({example.description})</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Parsed Result
              </p>
              {result.entries.map((entry, index) => (
                <div
                  key={`${entry.merchant ?? "entry"}-${index}`}
                  className="flex flex-wrap items-center gap-2 text-sm"
                >
                  <Badge variant={entry.type === "income" ? "default" : "secondary"}>
                    {entry.type}
                  </Badge>
                  <span className="font-medium">
                    {entry.amount.toLocaleString()} {entry.currency}
                  </span>
                  {entry.merchant && (
                    <span className="text-muted-foreground">· {entry.merchant}</span>
                  )}
                  {entry.category && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${isNewCategory ? "border-green-500 text-green-600" : ""}`}
                    >
                      {entry.category}
                      {isNewCategory && " (new)"}
                    </Badge>
                  )}
                  {entry.occurred_at && (
                    <span className="text-muted-foreground">· {entry.occurred_at}</span>
                  )}
                </div>
              ))}
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
