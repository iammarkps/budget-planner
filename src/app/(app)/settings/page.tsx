import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAccounts, getCategories } from "@/app/actions/transactions";
import AccountForm from "@/components/settings/AccountForm";
import AccountList from "@/components/settings/AccountList";
import CategoryForm from "@/components/settings/CategoryForm";
import CategoryList from "@/components/settings/CategoryList";

export default async function SettingsPage() {
  const [accountsResult, categoriesResult] = await Promise.all([
    getAccounts(),
    getCategories(),
  ]);

  const accounts = accountsResult.data ?? [];
  const categories = categoriesResult.data ?? [];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure accounts, categories, and preferences.
        </p>
      </header>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Accounts</CardTitle>
              <AccountForm />
            </CardHeader>
            <CardContent>
              <AccountList accounts={accounts} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Categories</CardTitle>
              <CategoryForm />
            </CardHeader>
            <CardContent>
              <CategoryList categories={categories} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium">Base Currency</h4>
                <p className="text-sm text-muted-foreground">
                  Your base currency is <strong>THB (Thai Baht)</strong>. All
                  transactions are converted to this currency for reporting.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Exchange Rates</h4>
                <p className="text-sm text-muted-foreground">
                  Exchange rates are stored per transaction date. Multi-currency
                  transactions will use the rate from that day.
                </p>
              </div>

              <div>
                <h4 className="font-medium">Tax Year</h4>
                <p className="text-sm text-muted-foreground">
                  Tax calculations use Thailand tax brackets. The fiscal year
                  follows the calendar year (January - December).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
