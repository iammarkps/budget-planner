import { generateText, Output } from "ai";
import { z } from "zod";

import { transactionSchema } from "@/lib/ai/transactionSchema";

export const runtime = "edge";

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
});

const requestSchema = z.object({
  input: z.string().min(3),
  baseCurrency: z.string().default("THB"),
  defaultAccount: z.string().optional(),
  categories: z.array(categorySchema).optional(),
});

function buildCategoryInstructions(
  categories: z.infer<typeof categorySchema>[] | undefined,
): string {
  if (!categories || categories.length === 0) {
    return `- category should be a short descriptive string (e.g., "Food & Dining", "Transportation", "Shopping").
- Always suggest an appropriate category based on the merchant or description.`;
  }

  const expenseCategories = categories
    .filter((c) => c.type === "expense")
    .map((c) => c.name);
  const incomeCategories = categories
    .filter((c) => c.type === "income")
    .map((c) => c.name);

  return `
- For expense transactions, prefer one of these existing categories: ${expenseCategories.join(", ")}
- For income transactions, prefer one of these existing categories: ${incomeCategories.join(", ")}
- Match the category based on the merchant or description. Use your best judgment.
- If an existing category fits well, use it EXACTLY as written.
- If NO existing category fits well, create a short, descriptive new category name (e.g., "Healthcare", "Groceries", "Subscriptions").
- Always provide a category - either an existing one or a new suggested one.`;
}

function buildSystemPrompt(
  baseCurrency: string,
  defaultAccount: string | undefined,
  categoryInstructions: string,
): string {
  return `You parse natural language into structured personal finance transactions.

Return the result as a JSON object with an array field "entries".
- Each entry must include: type (income or expense), amount (number), currency (3-letter code).
- When the currency is missing, infer it as ${baseCurrency}.
- Use ISO date (YYYY-MM-DD) when a date is present. If absent, omit.
- merchant should be a short string identifying the vendor/source.
${categoryInstructions}
- If multiple transactions are present, split them into separate entries.
- defaultAccount: ${defaultAccount ?? ""}`;
}

export async function POST(request: Request): Promise<Response> {
  const json = await request.json();
  const { input, baseCurrency, defaultAccount, categories } = requestSchema.parse(json);

  const categoryInstructions = buildCategoryInstructions(categories);
  const system = buildSystemPrompt(baseCurrency, defaultAccount, categoryInstructions);

  const result = await generateText({
    model: "anthropic/claude-sonnet-4.5",
    system,
    prompt: input,
    output: Output.object({ schema: transactionSchema }),
  });

  return Response.json(result.output);
}
