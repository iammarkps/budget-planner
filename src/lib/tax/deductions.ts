// Preset deduction categories for Thailand
export const THAI_DEDUCTION_CATEGORIES = [
  { id: "insurance", name: "Life Insurance Premium", maxCap: 100_000 },
  { id: "health_insurance", name: "Health Insurance Premium", maxCap: 25_000 },
  { id: "parents_health_insurance", name: "Parents Health Insurance", maxCap: 15_000 },
  { id: "ssf", name: "SSF (Super Savings Fund)", maxCap: 200_000 },
  { id: "rmf", name: "RMF (Retirement Mutual Fund)", maxCap: null, maxPercent: 0.3 },
  { id: "pvd", name: "PVD (Provident Fund)", maxCap: 500_000 },
  { id: "social_security", name: "Social Security", maxCap: 9_000 },
  { id: "housing_loan_interest", name: "Housing Loan Interest", maxCap: 100_000 },
  { id: "donation", name: "Donation", maxCap: null, maxPercent: 0.1 },
  { id: "education_donation", name: "Education Donation (2x)", maxCap: null, maxPercent: 0.1 },
  { id: "easy_e_receipt", name: "Easy E-Receipt", maxCap: 50_000 },
  { id: "other", name: "Other Deductions", maxCap: null },
] as const;

export type DeductionCategory = (typeof THAI_DEDUCTION_CATEGORIES)[number];
