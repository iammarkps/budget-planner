"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, parse } from "date-fns";

type MonthNavigatorProps = {
  currentMonth: string; // YYYY-MM format
  onMonthChange: (newMonth: string) => void;
  disabled?: boolean;
};

export default function MonthNavigator({
  currentMonth,
  onMonthChange,
  disabled = false,
}: MonthNavigatorProps) {
  // Parse the current month string into a Date object
  // format is yyyy-MM. We use the first day of the month for calculation.
  const date = parse(currentMonth, "yyyy-MM", new Date());

  const handlePrev = () => {
    const prevDate = subMonths(date, 1);
    onMonthChange(format(prevDate, "yyyy-MM"));
  };

  const handleNext = () => {
    const nextDate = addMonths(date, 1);
    onMonthChange(format(nextDate, "yyyy-MM"));
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrev}
        disabled={disabled}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="min-w-[140px] text-center font-medium">
        {format(date, "MMMM yyyy")}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={disabled}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
