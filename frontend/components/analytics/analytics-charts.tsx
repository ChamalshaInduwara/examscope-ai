"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type QuestionTypeItem = {
  name: string;
  count: number;
};

type QuestionsByYearItem = {
  year: number;
  count: number;
};

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
];

export function QuestionTypeChart({
  data,
}: {
  data: QuestionTypeItem[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          No question-type data is available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={90}
            label
          >
            {data.map((item, index) => (
              <Cell
                key={item.name}
                fill={
                  PIE_COLORS[
                    index % PIE_COLORS.length
                  ]
                }
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function QuestionsByYearChart({
  data,
}: {
  data: QuestionsByYearItem[];
}) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          No yearly question data is available yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="year"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip />

          <Bar
            dataKey="count"
            fill="var(--chart-1)"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}