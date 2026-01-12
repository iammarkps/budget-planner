export type ThaiTaxBracket = {
  min: number;
  max?: number | null;
  rate: number;
};

export type ThaiDeductionInput = {
  name: string;
  amount: number;
  capAmount?: number | null;
  capPercent?: number | null;
};

export type ThaiDeductionApplied = ThaiDeductionInput & {
  appliedAmount: number;
};

export type ThaiTaxResult = {
  taxableIncome: number;
  totalDeductions: number;
  tax: number;
  effectiveRate: number;
  deductions: ThaiDeductionApplied[];
};

export const DEFAULT_TH_BRACKETS: ThaiTaxBracket[] = [
  { min: 0, max: 150_000, rate: 0 },
  { min: 150_000, max: 300_000, rate: 0.05 },
  { min: 300_000, max: 500_000, rate: 0.1 },
  { min: 500_000, max: 750_000, rate: 0.15 },
  { min: 750_000, max: 1_000_000, rate: 0.2 },
  { min: 1_000_000, max: 2_000_000, rate: 0.25 },
  { min: 2_000_000, max: 5_000_000, rate: 0.3 },
  { min: 5_000_000, max: null, rate: 0.35 },
];

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const applyDeductionCaps = (
  grossIncome: number,
  deduction: ThaiDeductionInput,
): ThaiDeductionApplied => {
  const percentCap = deduction.capPercent
    ? grossIncome * deduction.capPercent
    : Number.POSITIVE_INFINITY;
  const amountCap = deduction.capAmount ?? Number.POSITIVE_INFINITY;
  const appliedAmount = Math.max(
    0,
    Math.min(deduction.amount, percentCap, amountCap),
  );

  return {
    ...deduction,
    appliedAmount: roundCurrency(appliedAmount),
  };
};

export const calculateThaiTax = (
  grossIncome: number,
  deductions: ThaiDeductionInput[],
  brackets: ThaiTaxBracket[] = DEFAULT_TH_BRACKETS,
): ThaiTaxResult => {
  const appliedDeductions = deductions.map((deduction) =>
    applyDeductionCaps(grossIncome, deduction),
  );
  const totalDeductions = appliedDeductions.reduce(
    (sum, item) => sum + item.appliedAmount,
    0,
  );
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);

  let totalTax = 0;
  for (const bracket of brackets) {
    const bracketMax = bracket.max ?? Number.POSITIVE_INFINITY;
    const taxableInBracket = Math.min(
      Math.max(taxableIncome - bracket.min, 0),
      bracketMax - bracket.min,
    );

    if (taxableInBracket <= 0) {
      continue;
    }

    totalTax += taxableInBracket * bracket.rate;
  }

  const tax = roundCurrency(totalTax);
  const effectiveRate = grossIncome > 0 ? tax / grossIncome : 0;

  return {
    taxableIncome: roundCurrency(taxableIncome),
    totalDeductions: roundCurrency(totalDeductions),
    tax,
    effectiveRate: roundCurrency(effectiveRate),
    deductions: appliedDeductions,
  };
};
