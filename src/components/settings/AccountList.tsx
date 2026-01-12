"use client";

import { Badge } from "@/components/ui/badge";
import type { Database } from "@/../database.types";

type Account = Database["public"]["Tables"]["accounts"]["Row"];

type Props = {
  accounts: Account[];
};

export default function AccountList({ accounts }: Props) {
  if (accounts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No accounts yet. Add your first account to start tracking.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {accounts.map((account) => (
        <div
          key={account.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">{account.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {account.type.replace("_", " ")}
              </p>
            </div>
          </div>
          <Badge variant="outline">{account.currency_code}</Badge>
        </div>
      ))}
    </div>
  );
}
