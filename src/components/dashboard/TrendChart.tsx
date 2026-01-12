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

type TrendData = {
  month: string;
  income: number;
  expense: number;
};

type TrendChartProps = {
  data: TrendData[];
};

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
        <YAxis
          tickFormatter={(value) =>
            value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value
          }
        />
        <Tooltip
          formatter={(value) => `${(value as number).toLocaleString()} THB`}
        />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#22C55E" />
        <Bar dataKey="expense" name="Expense" fill="#EF4444" />
      </BarChart>
    </ResponsiveContainer>
  );
}
