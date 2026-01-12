"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Database } from "@/../database.types"

type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"]

export type ParsedTransactionEntry = {
  type: "income" | "expense"
  amount: number
  currency: string
  merchant?: string | null
  category?: string | null
  account?: string | null
  occurred_at?: string | null
  note?: string | null
}

export type SaveTransactionInput = {
  entries: ParsedTransactionEntry[]
  rawInput: string
  accountId: string
  categoryId?: string | null
}

export async function saveTransactions(input: SaveTransactionInput) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const transactionsToInsert: TransactionInsert[] = input.entries.map(
    (entry) => ({
      user_id: user.id,
      account_id: input.accountId,
      category_id: input.categoryId ?? null,
      type: entry.type,
      amount_original: entry.amount,
      currency_code: entry.currency,
      amount_base_thb: entry.amount, // TODO: Apply exchange rate if currency != THB
      rate_used: 1, // TODO: Fetch actual exchange rate
      merchant: entry.merchant ?? null,
      note: entry.note ?? null,
      occurred_at: entry.occurred_at ?? new Date().toISOString().split("T")[0],
      raw_nl_input: input.rawInput,
    })
  )

  const { data, error } = await supabase
    .from("transactions")
    .insert(transactionsToInsert)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")

  return { data }
}

export async function getTransactions(options?: {
  limit?: number
  offset?: number
  type?: "income" | "expense"
  startDate?: string
  endDate?: string
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  let query = supabase
    .from("transactions")
    .select(
      `
      *,
      account:accounts(id, name),
      category:categories(id, name, type)
    `
    )
    .eq("user_id", user.id)
    .order("occurred_at", { ascending: false })

  if (options?.type) {
    query = query.eq("type", options.type)
  }
  if (options?.startDate) {
    query = query.gte("occurred_at", options.startDate)
  }
  if (options?.endDate) {
    query = query.lte("occurred_at", options.endDate)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  if (options?.offset) {
    query = query.range(
      options.offset,
      options.offset + (options.limit ?? 20) - 1
    )
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function deleteTransaction(id: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/transactions")
  revalidatePath("/dashboard")

  return { success: true }
}

export async function getAccounts() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .order("name")

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getCategories() {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name")

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createAccount(input: {
  name: string
  type: string
  currency_code?: string
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
      currency_code: input.currency_code ?? "THB",
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { data }
}

export async function createCategory(input: {
  name: string
  type: "income" | "expense"
}) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({
      user_id: user.id,
      name: input.name,
      type: input.type,
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/settings")
  return { data }
}

export async function getTransactionSummary(month?: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  const targetMonth = month ?? new Date().toISOString().slice(0, 7)
  const startDate = `${targetMonth}-01`
  const endDate = `${targetMonth}-31`

  const { data, error } = await supabase
    .from("transactions")
    .select("type, amount_base_thb")
    .eq("user_id", user.id)
    .gte("occurred_at", startDate)
    .lte("occurred_at", endDate)

  if (error) {
    return { error: error.message, data: null }
  }

  const summary = {
    income: 0,
    expense: 0,
    net: 0,
  }

  for (const tx of data) {
    if (tx.type === "income") {
      summary.income += tx.amount_base_thb
    } else {
      summary.expense += tx.amount_base_thb
    }
  }
  summary.net = summary.income - summary.expense

  return { data: summary, error: null }
}

export async function getSpendingByCategory(month?: string) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  const targetMonth = month ?? new Date().toISOString().slice(0, 7)
  const startDate = `${targetMonth}-01`
  const endDate = `${targetMonth}-31`

  const { data, error } = await supabase
    .from("transactions")
    .select(`
      amount_base_thb,
      category:categories(id, name)
    `)
    .eq("user_id", user.id)
    .eq("type", "expense")
    .gte("occurred_at", startDate)
    .lte("occurred_at", endDate)

  if (error) {
    return { error: error.message, data: null }
  }

  const categoryMap: Record<string, { name: string; amount: number }> = {}

  for (const tx of data) {
    const categoryName = tx.category?.name ?? "Uncategorized"
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { name: categoryName, amount: 0 }
    }
    categoryMap[categoryName].amount += tx.amount_base_thb
  }

  const result = Object.values(categoryMap).sort((a, b) => b.amount - a.amount)

  return { data: result, error: null }
}

export async function getMonthlyTrend(months: number = 6) {
  const supabase = await createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated", data: null }
  }

  const today = new Date()
  const result: { month: string; income: number; expense: number }[] = []

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const monthStr = date.toISOString().slice(0, 7)
    const startDate = `${monthStr}-01`
    const endDate = `${monthStr}-31`

    const { data } = await supabase
      .from("transactions")
      .select("type, amount_base_thb")
      .eq("user_id", user.id)
      .gte("occurred_at", startDate)
      .lte("occurred_at", endDate)

    let income = 0
    let expense = 0

    for (const tx of data ?? []) {
      if (tx.type === "income") {
        income += tx.amount_base_thb
      } else {
        expense += tx.amount_base_thb
      }
    }

    result.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      income,
      expense,
    })
  }

  return { data: result, error: null }
}
