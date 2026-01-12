import { getBudgetWithSpending } from "@/app/actions/budgets";
import { getCategories } from "@/app/actions/transactions";
import BudgetForm from "@/components/budgets/BudgetForm";
import BudgetList from "@/components/budgets/BudgetList";

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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Budgets</h2>
          <p className="text-sm text-muted-foreground">
            Set category budgets for {monthDisplay}.
          </p>
        </div>
        <BudgetForm categories={categories} month={currentMonth} />
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <BudgetList budgets={budgets} />
      </section>
    </div>
  );
}
