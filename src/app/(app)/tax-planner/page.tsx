import { getTaxDeductions } from "@/app/actions/tax";
import DeductionForm from "@/components/tax/DeductionForm";
import DeductionList from "@/components/tax/DeductionList";
import TaxCalculator from "@/components/tax/TaxCalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_TH_BRACKETS } from "@/lib/tax/thai";

function getTaxRateColor(rate: number): string {
  if (rate === 0) {
    return "text-green-600";
  }
  if (rate >= 0.25) {
    return "text-red-600";
  }
  return "text-foreground";
}

function formatBracketRange(min: number, max: number | null | undefined): string {
  const minFormatted = min.toLocaleString();
  const maxFormatted = max ? ` ${max.toLocaleString()}` : " +";
  return `${minFormatted} -${maxFormatted} THB`;
}

export default async function TaxPlannerPage() {
  const currentYear = new Date().getFullYear();
  const { data: deductions } = await getTaxDeductions(currentYear);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Thailand Tax Planner</h2>
          <p className="text-sm text-muted-foreground">
            Track deductions and estimate taxable income for {currentYear}.
          </p>
        </div>
        <DeductionForm taxYear={currentYear} />
      </header>

      <Tabs defaultValue="calculator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="deductions">Deductions</TabsTrigger>
          <TabsTrigger value="brackets">Tax Brackets</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <TaxCalculator taxYear={currentYear} />
        </TabsContent>

        <TabsContent value="deductions">
          <Card>
            <CardHeader>
              <CardTitle>Your Deductions ({currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <DeductionList deductions={deductions ?? []} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brackets">
          <Card>
            <CardHeader>
              <CardTitle>{currentYear} Thailand Tax Brackets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DEFAULT_TH_BRACKETS.map((bracket) => (
                  <div
                    key={`${bracket.min}-${bracket.max ?? "plus"}`}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <span className="text-sm">
                      {formatBracketRange(bracket.min, bracket.max)}
                    </span>
                    <span className={`font-semibold ${getTaxRateColor(bracket.rate)}`}>
                      {Math.round(bracket.rate * 100)}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Standard Deductions:</p>
                <ul className="mt-2 list-inside list-disc space-y-1">
                  <li>Personal allowance: 60,000 THB</li>
                  <li>Expense deduction: 50% of income (max 100,000 THB)</li>
                  <li>Social security: up to 9,000 THB</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
