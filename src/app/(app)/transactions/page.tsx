import { Button } from "@/components/ui/button";
import { getTransactions } from "@/app/actions/transactions";
import TransactionClient from "@/components/transactions/TransactionClient";
import Link from "next/link";

export default async function TransactionsPage() {
  const { data: transactions, error } = await getTransactions({ limit: 100 });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Transactions</h2>
          <p className="text-sm text-muted-foreground">
            Review, edit, and tag your cashflow entries.
          </p>
        </div>
        <Link href="/dashboard">
          <Button>Add via NLP</Button>
        </Link>
      </header>

      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : (
        <TransactionClient initialTransactions={transactions ?? []} />
      )}
    </div>
  );
}
