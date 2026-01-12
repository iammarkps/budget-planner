import { getBudgetWithSpending } from "@/app/actions/budgets";
import { getCategories } from "@/app/actions/transactions";
import BudgetClient from "@/components/budgets/BudgetClient";

export default async function BudgetsPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [budgetsResult, categoriesResult] = await Promise.all([
    getBudgetWithSpending(currentMonth),
    getCategories(),
  ]);

  const budgets = budgetsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  const monthDisplay = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <BudgetClient
      initialBudgets={budgets}
      categories={categories}
      month={currentMonth}
      monthDisplay={monthDisplay}
    />
  );
}
