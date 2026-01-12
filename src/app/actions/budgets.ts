"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/../database.types";

type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];

export type CreateBudgetInput = {
  category_id: string;
  amount: number;
  month: string; // YYYY-MM format
  rollover?: boolean;
};

export async function getBudgets(month?: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const targetMonth = month ?? new Date().toISOString().slice(0, 7);

  const { data, error } = await supabase
    .from("budgets")
    .select(
      `
      *,
      category:categories(id, name, type)
    `
    )
    .eq("user_id", user.id)
    .eq("month", targetMonth)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function createBudget(input: CreateBudgetInput) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Check if budget already exists for this category and month
  const { data: existing } = await supabase
    .from("budgets")
    .select("id")
    .eq("user_id", user.id)
    .eq("category_id", input.category_id)
    .eq("month", input.month)
    .single();

  if (existing) {
    return { error: "Budget already exists for this category and month" };
  }

  const budget: BudgetInsert = {
    user_id: user.id,
    category_id: input.category_id,
    amount: input.amount,
    month: input.month,
    rollover: input.rollover ?? true,
  };

  const { data, error } = await supabase
    .from("budgets")
    .insert(budget)
    .select(
      `
      *,
      category:categories(id, name, type)
    `
    )
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  return { data };
}

export async function updateBudget(
  id: string,
  input: { amount?: number; rollover?: boolean }
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("budgets")
    .update({
      amount: input.amount,
      rollover: input.rollover,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  return { data };
}

export async function deleteBudget(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  return { success: true };
}

export async function getBudgetWithSpending(month?: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const targetMonth = month ?? new Date().toISOString().slice(0, 7);
  const startDate = `${targetMonth}-01`;
  const endDate = `${targetMonth}-31`;

  // Get budgets for this month
  const { data: budgets, error: budgetError } = await supabase
    .from("budgets")
    .select(
      `
      *,
      category:categories(id, name, type)
    `
    )
    .eq("user_id", user.id)
    .eq("month", targetMonth);

  if (budgetError) {
    return { error: budgetError.message, data: null };
  }

  // Get spending by category for this month
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("category_id, amount_base_thb")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("occurred_at", startDate)
    .lte("occurred_at", endDate);

  if (txError) {
    return { error: txError.message, data: null };
  }

  // Calculate spending per category
  const spendingByCategory: Record<string, number> = {};
  for (const tx of transactions ?? []) {
    if (tx.category_id) {
      spendingByCategory[tx.category_id] =
        (spendingByCategory[tx.category_id] ?? 0) + tx.amount_base_thb;
    }
  }

  // Combine budgets with spending
  const budgetsWithSpending = (budgets ?? []).map((budget) => ({
    ...budget,
    spent: spendingByCategory[budget.category_id] ?? 0,
    remaining: budget.amount - (spendingByCategory[budget.category_id] ?? 0),
    percentUsed:
      budget.amount > 0
        ? ((spendingByCategory[budget.category_id] ?? 0) / budget.amount) * 100
        : 0,
  }));

  return { data: budgetsWithSpending, error: null };
}
