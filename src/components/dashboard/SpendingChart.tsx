"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type SpendingData = {
  name: string;
  amount: number;
};

type SpendingChartProps = {
  data: SpendingData[];
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
];

const formatLabel = ({
  name,
  percent,
}: {
  name?: string;
  percent?: number;
}) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`;

const formatTooltip = (value: number | undefined) =>
  `${(value ?? 0).toLocaleString()} THB`;

export default function SpendingChart({ data }: SpendingChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No spending data for this month
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="amount"
          nameKey="name"
          label={formatLabel}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={formatTooltip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
