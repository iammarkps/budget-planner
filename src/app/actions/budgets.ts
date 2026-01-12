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

import { subMonths, format } from "date-fns";

export async function copyLastMonthBudget(targetMonth: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const targetDate = new Date(`${targetMonth}-01`);
  const lastMonthDate = subMonths(targetDate, 1);
  const lastMonthStr = format(lastMonthDate, "yyyy-MM");

  // Get budgets from last month
  const { data: lastMonthBudgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .eq("month", `${lastMonthStr}-01`);

  if (!lastMonthBudgets || lastMonthBudgets.length === 0) {
    return { error: `No budgets found for ${format(lastMonthDate, "MMMM yyyy")}` };
  }

  // Get budgets already set for this month
  const { data: currentBudgets } = await supabase
    .from("budgets")
    .select("category_id")
    .eq("user_id", user.id)
    .eq("month", `${targetMonth}-01`);

  const currentCategoryIds = new Set(
    (currentBudgets ?? []).map((b) => b.category_id)
  );

  // Filter budgets to copy (only ones not already set)
  const budgetsToCopy = lastMonthBudgets
    .filter((b) => !currentCategoryIds.has(b.category_id))
    .map((b) => ({
      user_id: user.id,
      category_id: b.category_id,
      amount: b.amount,
      month: `${targetMonth}-01`,
      rollover: b.rollover,
    }));

  if (budgetsToCopy.length === 0) {
    return { error: "All categories already have budgets for this month" };
  }

  const { error } = await supabase.from("budgets").insert(budgetsToCopy);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  return { success: true, count: budgetsToCopy.length };
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
    .eq("month", `${input.month}-01`)
    .single();

  if (existing) {
    return { error: "Budget already exists for this category and month" };
  }

  const budget: BudgetInsert = {
    user_id: user.id,
    category_id: input.category_id,
    amount: input.amount,
    month: `${input.month}-01`,
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

  const updateData: { amount?: number; rollover?: boolean } = {};
  if (input.amount !== undefined) updateData.amount = input.amount;
  if (input.rollover !== undefined) updateData.rollover = input.rollover;

  const { data, error } = await supabase
    .from("budgets")
    .update(updateData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      category:categories(id, name, type)
    `)
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/budgets");
  return { data };
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
  const targetMonthDate = `${targetMonth}-01`;
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
    .eq("month", targetMonthDate);

  if (budgetError) {
    return { error: budgetError.message, data: null };
  }

  // Get spending by category for this month
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("category_id, amount_base_thb")
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("occurred_at", targetMonthDate)
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
