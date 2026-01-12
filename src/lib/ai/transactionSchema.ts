import { z } from "zod";

export const transactionSchema = z.object({
  entries: z
    .array(
      z.object({
        type: z.enum(["income", "expense"]),
        amount: z.number().positive(),
        currency: z.string().min(3).max(3),
        merchant: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
        account: z.string().optional().nullable(),
        occurred_at: z.string().optional().nullable(),
        note: z.string().optional().nullable(),
      }),
    )
    .min(1),
});

export type TransactionSchema = z.infer<typeof transactionSchema>;
