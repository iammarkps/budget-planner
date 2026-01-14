"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatTooltip } from "@/lib/chart-utils";

type TrendData = {
  month: string;
  income: number;
  expense: number;
};

type TrendChartProps = {
  data: TrendData[];
};

const formatYAxis = (value: number) =>
  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value);

export default function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No trend data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis tickFormatter={formatYAxis} />
        <Tooltip formatter={formatTooltip} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#22C55E" />
        <Bar dataKey="expense" name="Expense" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
