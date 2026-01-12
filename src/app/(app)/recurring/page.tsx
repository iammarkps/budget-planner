import { getRecurringTransactions } from "@/app/actions/recurring";
import { getAccounts, getCategories } from "@/app/actions/transactions";
import RecurringClient from "@/components/recurring/RecurringClient";

export default async function RecurringPage() {
  const [recurringResult, accountsResult, categoriesResult] = await Promise.all([
    getRecurringTransactions(),
    getAccounts(),
    getCategories(),
  ]);

  const recurring = recurringResult.data ?? [];
  const accounts = accountsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return (
    <RecurringClient
      initialRecurring={recurring}
      accounts={accounts}
      categories={categories}
    />
  );
}
