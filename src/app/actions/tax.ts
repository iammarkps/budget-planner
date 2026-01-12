"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
  calculateThaiTax,
  DEFAULT_TH_BRACKETS,
  type ThaiDeductionInput,
  type ThaiTaxResult,
} from "@/lib/tax/thai";
import type { Database } from "@/../database.types";

type TaxDeductionInsert = Database["public"]["Tables"]["tax_deductions"]["Insert"];
type TaxDeductionRow = Database["public"]["Tables"]["tax_deductions"]["Row"];

export type CreateDeductionInput = {
  name: string;
  category: string;
  amount: number;
  cap_amount?: number | null;
  cap_percent?: number | null;
  description?: string | null;
  tax_year: number;
};

export async function getTaxDeductions(taxYear?: number) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const year = taxYear ?? new Date().getFullYear();

  const { data, error } = await supabase
    .from("tax_deductions")
    .select("*")
    .eq("user_id", user.id)
    .eq("tax_year", year)
    .order("category", { ascending: true });

  if (error) {
    return { error: error.message, data: null };
  }

  return { data, error: null };
}

export async function createTaxDeduction(input: CreateDeductionInput) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const deduction: TaxDeductionInsert = {
    user_id: user.id,
    name: input.name,
    category: input.category,
    tax_year: input.tax_year,
    cap_amount: input.cap_amount ?? null,
    cap_percent: input.cap_percent ?? null,
    description: input.description ?? null,
  };

  const { data, error } = await supabase
    .from("tax_deductions")
    .insert(deduction)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tax-planner");
  return { data };
}

export async function updateTaxDeduction(
  id: string,
  input: Partial<CreateDeductionInput>
) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("tax_deductions")
    .update({
      name: input.name,
      category: input.category,
      cap_amount: input.cap_amount,
      cap_percent: input.cap_percent,
      description: input.description,
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tax-planner");
  return { data };
}

export async function deleteTaxDeduction(id: string) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("tax_deductions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/tax-planner");
  return { success: true };
}

export type TaxCalculationInput = {
  grossIncome: number;
  taxYear?: number;
  customDeductions?: ThaiDeductionInput[];
};

export async function calculateTax(
  input: TaxCalculationInput
): Promise<{ data: ThaiTaxResult | null; error: string | null }> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const year = input.taxYear ?? new Date().getFullYear();

  // Get user's stored deductions for this year
  const { data: storedDeductions } = await supabase
    .from("tax_deductions")
    .select("*")
    .eq("user_id", user.id)
    .eq("tax_year", year);

  // Convert stored deductions to the format expected by calculateThaiTax
  const deductionsFromDb: ThaiDeductionInput[] = (storedDeductions ?? []).map(
    (d: TaxDeductionRow) => ({
      name: d.name,
      amount: d.cap_amount ?? 0, // Use cap_amount as the claimed amount
      capAmount: d.cap_amount,
      capPercent: d.cap_percent,
    })
  );

  // Merge with any custom deductions provided
  const allDeductions = [...deductionsFromDb, ...(input.customDeductions ?? [])];

  // Standard personal allowance (60,000 THB for 2024)
  const standardDeductions: ThaiDeductionInput[] = [
    { name: "Personal allowance", amount: 60_000, capAmount: 60_000 },
    { name: "Expense deduction (50%)", amount: input.grossIncome * 0.5, capAmount: 100_000 },
  ];

  const result = calculateThaiTax(
    input.grossIncome,
    [...standardDeductions, ...allDeductions],
    DEFAULT_TH_BRACKETS
  );

  return { data: result, error: null };
}

export async function getAnnualIncome(taxYear?: number) {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", data: null };
  }

  const year = taxYear ?? new Date().getFullYear();
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from("transactions")
    .select("amount_base_thb")
    .eq("user_id", user.id)
    .eq("type", "income")
    .gte("occurred_at", startDate)
    .lte("occurred_at", endDate);

  if (error) {
    return { error: error.message, data: null };
  }

  const totalIncome = (data ?? []).reduce(
    (sum, tx) => sum + tx.amount_base_thb,
    0
  );

  return { data: { year, totalIncome }, error: null };
}
