"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/../database.types";

type RecurringInsert = Database["public"]["Tables"]["recurring_transactions"]["Insert"];
type RecurringRow = Database["public"]["Tables"]["recurring_transactions"]["Row"];

export type CreateRecurringInput = {
  account_id: string;
  category_id?: string | null;
  type: "income" | "expense";
  amount: number;
  currency_code?: string;
  merchant?: string | null;
  note?: string | null;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  day_of_month?: number | null;
  day_of_week?: number | null;
  start_date: string;
  end_date?: string | null;
};

function calculateNextOccurrence(
  frequency: string,
  startDate: string,
  dayOfMonth?: number | null,
  dayOfWeek?: number | null
): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let next = new Date(startDate);
  
  if (next >= today) {
    return next.toISOString().split("T")[0];
  }
  
  switch (frequency) {
    case "daily":
      next = new Date(today);
      break;
    case "weekly":
      const targetDay = dayOfWeek ?? next.getDay();
      next = new Date(today);
      const currentDay = next.getDay();
      const daysUntil = (targetDay - currentDay + 7) % 7;
      next.setDate(next.getDate() + (daysUntil === 0 ? 0 : daysUntil));
      break;
    case "monthly":
      const targetDayOfMonth = dayOfMonth ?? 1;
      next = new Date(today.getFullYear(), today.getMonth(), targetDayOfMonth);
      if (next < today) {
        next.setMonth(next.getMonth() + 1);
      }
      break;
    case "yearly":
      next = new Date(today.getFullYear(), new Date(startDate).getMonth(), new Date(startDate).getDate());
      if (next < today) {
        next.setFullYear(next.getFullYear() + 1);
      }
      break;
  }
  
  return next.toISOString().split("T")[0];
}

function calculateNextAfterCurrent(
  frequency: string,
  currentDate: string,
  dayOfMonth?: number | null,
): string {
  const current = new Date(currentDate);
  
  switch (frequency) {
    case "daily":
      current.setDate(current.getDate() + 1);
      break;
    case "weekly":
      current.setDate(current.getDate() + 7);
      break;
    case "monthly":
      current.setMonth(current.getMonth() + 1);
      if (dayOfMonth) {
        current.setDate(dayOfMonth);
      }
      break;
    case "yearly":
      current.setFullYear(current.getFullYear() + 1);
      break;
  }
  
  return current.toISOString().split("T")[0];
}

export async function getRecurringTransactions() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .select(`
      *,
      account:accounts(id, name),
      category:categories(id, name, type)
    `)
    .eq("user_id", user.id)
    .order("next_occurrence", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function createRecurringTransaction(input: CreateRecurringInput) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const nextOccurrence = calculateNextOccurrence(
    input.frequency,
    input.start_date,
    input.day_of_month,
    input.day_of_week
  );

  const recurring: RecurringInsert = {
    user_id: user.id,
    account_id: input.account_id,
    category_id: input.category_id ?? null,
    type: input.type,
    amount: input.amount,
    currency_code: input.currency_code ?? "THB",
    merchant: input.merchant ?? null,
    note: input.note ?? null,
    frequency: input.frequency,
    day_of_month: input.day_of_month ?? null,
    day_of_week: input.day_of_week ?? null,
    start_date: input.start_date,
    end_date: input.end_date ?? null,
    next_occurrence: nextOccurrence,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("recurring_transactions")
    .insert(recurring)
    .select(`
      *,
      account:accounts(id, name),
      category:categories(id, name, type)
    `)
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recurring");
  return { data };
}

export async function deleteRecurringTransaction(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recurring");
  return { success: true };
}

export async function toggleRecurringTransaction(id: string, isActive: boolean) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("recurring_transactions")
    .update({ is_active: isActive })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recurring");
  return { data };
}

export async function processRecurringTransactions() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", processed: 0 };
  }

  const today = new Date().toISOString().split("T")[0];

  const { data: dueRecurring, error: fetchError } = await supabase
    .from("recurring_transactions")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .lte("next_occurrence", today);

  if (fetchError) {
    return { error: fetchError.message, processed: 0 };
  }

  if (!dueRecurring || dueRecurring.length === 0) {
    return { processed: 0 };
  }

  let processed = 0;

  for (const recurring of dueRecurring) {
    if (recurring.end_date && recurring.end_date < today) {
      await supabase
        .from("recurring_transactions")
        .update({ is_active: false })
        .eq("id", recurring.id);
      continue;
    }

    const { error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        account_id: recurring.account_id,
        category_id: recurring.category_id,
        type: recurring.type as "income" | "expense",
        amount_original: recurring.amount,
        currency_code: recurring.currency_code,
        amount_base_thb: recurring.amount,
        rate_used: 1,
        merchant: recurring.merchant,
        note: recurring.note ? `[Auto] ${recurring.note}` : "[Auto] Recurring transaction",
        occurred_at: recurring.next_occurrence,
      });

    if (insertError) {
      console.error("Failed to create transaction:", insertError);
      continue;
    }

    const nextOccurrence = calculateNextAfterCurrent(
      recurring.frequency,
      recurring.next_occurrence,
      recurring.day_of_month,
    );

    await supabase
      .from("recurring_transactions")
      .update({ next_occurrence: nextOccurrence })
      .eq("id", recurring.id);

    processed++;
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/recurring");

  return { processed };
}
