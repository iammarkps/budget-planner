# Budget Planner Workflows

This document describes recommended workflows for common personal finance scenarios.

## Table of Contents

- [Recording Income](#recording-income)
- [Recording Expenses](#recording-expenses)
- [Split Bills & Advance Payments](#split-bills--advance-payments)
- [Bank Statement Reconciliation](#bank-statement-reconciliation)

---

## Recording Income

### One-time Income

Use natural language to record income as it arrives:

```text
Salary 50000 THB
Freelance payment 15000 from ClientCo
Bonus 10000
Sold old laptop 3500
```

The AI automatically detects these as income based on context (salary, payment, bonus, sold, etc.).

### Recurring Income (Salary)

For predictable monthly income like salary:

1. Go to **Recurring Transactions** (`/recurring`)
2. Create a new recurring transaction:
   - Type: Income
   - Amount: Your salary
   - Frequency: Monthly
   - Day of month: Your payday (e.g., 25th)
3. The system automatically creates the transaction each month

**Tip**: You can still use NLP entry if your salary varies month to month.

---

## Recording Expenses

### Daily Expenses

Simply describe what you spent:

```text
Grab ride 220 THB
Coffee at Starbucks 185
Lunch 150
Netflix subscription 419
Electricity bill 1200
```

### Expenses with Dates

Specify when the expense occurred:

```text
Dinner yesterday 850
Flight tickets on Jan 15 12500
Rent for December 15000
```

### Multiple Transactions at Once

You can enter multiple items in one go:

```text
Groceries 450, coffee 95, parking 40
```

---

## Split Bills & Advance Payments

When you pay for a group (e.g., dinner with friends) and expect reimbursement.

### Recommended Workflow

**Step 1: Record the full payment**

When you pay the bill:

```text
Dinner at Sushi Hiro 1600 THB, paid for Mark and Jane
```

This records the full amount as an expense, matching your credit card statement.

**Step 2: Record reimbursements**

When friends pay you back:

```text
Reimbursement from Mark 530
Reimbursement from Jane 530
```

Or if they pay together:

```text
Reimbursement 1060 for dinner
```

These are automatically detected as income.

### Why This Workflow?

| Benefit | Explanation |
|---------|-------------|
| Matches bank statement | Your credit card shows -1600, your records show -1600 |
| Accurate net spending | After reimbursement, net is -540 (your actual share) |
| Simple tracking | Search "reimbursement" to find pending paybacks |
| No schema changes | Works with existing features |

### Tracking Who Owes You

Add names in the transaction note for easy searching:

```text
Group dinner 2400, Mark owes 800, Jane owes 800
```

Later, search for "Mark owes" to find outstanding amounts.

### Alternative: Record Only Your Share

If friends pay you immediately (e.g., cash at the restaurant):

```text
Dinner 400 (my share)
```

**Pros**: Budget always accurate
**Cons**: Won't match credit card statement

---

## Bank Statement Reconciliation

### Manual Reconciliation Workflow

Since automatic import isn't available yet, here's a manual workflow:

**Weekly Review (Recommended)**

1. Download your bank/credit card statement (weekly or bi-weekly)
2. Open your transactions list (`/transactions`)
3. Compare line by line:
   - ✓ Matching amounts and dates → Already recorded correctly
   - ⚠ Missing in app → Add via NLP entry
   - ❓ Unknown charge → Investigate, then record

**Monthly Reconciliation**

1. At month end, filter transactions by date range
2. Compare totals:
   - Sum of expenses in app vs. credit card total
   - Sum of income in app vs. bank deposits
3. Investigate any discrepancies

### Tips for Easier Reconciliation

1. **Record transactions immediately** - Don't wait until month end
2. **Use merchant names** - "Grab" not "taxi" helps matching
3. **Include dates for past transactions** - "Coffee yesterday" not just "coffee"
4. **Check weekly** - Smaller batches are easier to reconcile

### Future Enhancement

A planned feature will allow:

- CSV/PDF statement import
- Automatic matching with existing transactions
- Side-by-side reconciliation view

---

## Quick Reference: Example Inputs

### Expenses

```text
Grab 180
Lunch at MK 250
Electricity bill 1450
Netflix 419
Groceries at Tops 890
```

### Income

```text
Salary 50000
Freelance from ABC Corp 15000
Reimbursement 800
Sold iPhone 12000
Interest 250
```

### With Context

```text
Dinner 1600, paid for team
Coffee yesterday 95
Flight to Chiang Mai on Feb 1 2500
Monthly rent 15000
```

### Multiple Items

```text
BTS 50, lunch 180, coffee 85
Groceries 500 and household items 350
```
