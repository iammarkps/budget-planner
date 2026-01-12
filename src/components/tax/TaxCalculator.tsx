"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { calculateTax, getAnnualIncome } from "@/app/actions/tax";
import type { ThaiTaxResult } from "@/lib/tax/thai";

type Props = {
  taxYear: number;
};

export default function TaxCalculator({ taxYear }: Props) {
  const [grossIncome, setGrossIncome] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThaiTaxResult | null>(null);
  const [annualIncome, setAnnualIncome] = useState<number>(0);

  useEffect(() => {
    async function loadIncome() {
      const incomeResult = await getAnnualIncome(taxYear);
      if (incomeResult.data) {
        setAnnualIncome(incomeResult.data.totalIncome);
      }
    }
    loadIncome();
  }, [taxYear]);

  const handleCalculate = async () => {
    const income = parseFloat(grossIncome);
    if (!income || income <= 0) return;

    setLoading(true);
    const calcResult = await calculateTax({
      grossIncome: income,
      taxYear,
    });
    setLoading(false);

    if (calcResult.data) {
      setResult(calcResult.data);
    }
  };

  const useTrackedIncome = () => {
    setGrossIncome(annualIncome.toString());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Estimate Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="income">Annual Gross Income (THB)</Label>
          <div className="flex gap-2">
            <Input
              id="income"
              type="number"
              value={grossIncome}
              onChange={(e) => setGrossIncome(e.target.value)}
              placeholder="Enter your gross income"
              min="0"
            />
            <Button onClick={handleCalculate} disabled={loading || !grossIncome}>
              {loading ? "..." : "Calculate"}
            </Button>
          </div>
          {annualIncome > 0 && (
            <button
              type="button"
              onClick={useTrackedIncome}
              className="text-xs text-primary hover:underline"
            >
              Use tracked income: {annualIncome.toLocaleString()} THB
            </button>
          )}
        </div>

        {result && (
          <div className="space-y-4 pt-2">
            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Gross Income</p>
                <p className="text-lg font-semibold">
                  {parseFloat(grossIncome).toLocaleString()} THB
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Deductions</p>
                <p className="text-lg font-semibold text-green-600">
                  -{result.totalDeductions.toLocaleString()} THB
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxable Income</p>
                <p className="text-lg font-semibold">
                  {result.taxableIncome.toLocaleString()} THB
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Tax</p>
                <p className="text-2xl font-bold text-red-600">
                  {result.tax.toLocaleString()} THB
                </p>
              </div>
            </div>

            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-sm">
                <span className="font-medium">Effective Tax Rate:</span>{" "}
                {(result.effectiveRate * 100).toFixed(2)}%
              </p>
            </div>

            {result.deductions.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Deductions Applied:</p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {result.deductions.map((d, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{d.name}</span>
                      <span>{d.appliedAmount.toLocaleString()} THB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
