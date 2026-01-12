"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteTaxDeduction } from "@/app/actions/tax";
import { THAI_DEDUCTION_CATEGORIES } from "@/lib/tax/deductions";
import { Trash2 } from "lucide-react";
import type { Database } from "@/../database.types";

type TaxDeduction = Database["public"]["Tables"]["tax_deductions"]["Row"];

type Props = {
  deductions: TaxDeduction[];
};

export default function DeductionList({ deductions: initialDeductions }: Props) {
  const [deductions, setDeductions] = useState(initialDeductions);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this deduction?")) return;

    setDeleting(id);
    const result = await deleteTaxDeduction(id);

    if (result.error) {
      alert(result.error);
      setDeleting(null);
      return;
    }

    setDeductions((prev) => prev.filter((d) => d.id !== id));
    setDeleting(null);
  };

  const getCategoryName = (categoryId: string) => {
    const cat = THAI_DEDUCTION_CATEGORIES.find((c) => c.id === categoryId);
    return cat?.name ?? categoryId;
  };

  const totalDeductions = deductions.reduce(
    (sum, d) => sum + (d.cap_amount ?? 0),
    0
  );

  if (deductions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        No deductions added yet. Add your first deduction to start tracking.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Badge variant="secondary" className="text-base">
          Total: {totalDeductions.toLocaleString()} THB
        </Badge>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deductions.map((deduction) => (
              <TableRow key={deduction.id}>
                <TableCell>
                  <Badge variant="outline">{getCategoryName(deduction.category)}</Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{deduction.name}</p>
                    {deduction.description && (
                      <p className="text-xs text-muted-foreground">
                        {deduction.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {(deduction.cap_amount ?? 0).toLocaleString()} THB
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(deduction.id)}
                    disabled={deleting === deduction.id}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
