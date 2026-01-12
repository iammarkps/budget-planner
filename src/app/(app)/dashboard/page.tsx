import Link from "next/link";

import { getTransactionSummary, getTransactions } from "@/app/actions/transactions";
import NlTransactionCard from "@/components/transactions/NlTransactionCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getAmountColor(isPositive: boolean): string {
  return isPositive ? "text-green-600" : "text-red-600";
}

function formatNetAmount(net: number): string {
  const prefix = net >= 0 ? "+" : "";
  return `${prefix}${net.toLocaleString()} THB`;
}

export default async function DashboardPage() {
  const [summaryResult, recentResult] = await Promise.all([
    getTransactionSummary(),
    getTransactions({ limit: 5 }),
  ]);

  const summary = summaryResult.data ?? { income: 0, expense: 0, net: 0 };
  const recentTransactions = recentResult.data ?? [];

  const currentMonth = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track monthly cashflow and budget health.
          </p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Income ({currentMonth})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              +{summary.income.toLocaleString()} THB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Expenses ({currentMonth})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              -{summary.expense.toLocaleString()} THB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net ({currentMonth})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${getAmountColor(summary.net >= 0)}`}>
              {formatNetAmount(summary.net)}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <NlTransactionCard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Transactions</span>
              <Link
                href="/transactions"
                className="text-sm font-normal text-muted-foreground hover:text-foreground"
              >
                View all
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No transactions yet. Use the NLP input to add your first one!
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => {
                  const isIncome = tx.type === "income";
                  const displayLabel = tx.merchant || tx.note || "Transaction";
                  const amountPrefix = isIncome ? "+" : "-";

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={isIncome ? "default" : "secondary"}
                          className="w-16 justify-center"
                        >
                          {tx.type}
                        </Badge>
                        <span className="text-muted-foreground">{displayLabel}</span>
                      </div>
                      <span className={`font-medium ${getAmountColor(isIncome)}`}>
                        {amountPrefix}
                        {tx.amount_original.toLocaleString()} {tx.currency_code}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
