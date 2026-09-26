"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import type { StatPoint } from "@/types";

// Categorical slot 1 (blue) from the palette validated for this dark
// surface — see the dataviz skill's references/palette.md.
const SERIES_COLOR = "#3987e5";

export function StatChart({
  title,
  data,
  unit,
}: {
  title: string;
  data: StatPoint[];
  unit?: string;
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title={`Aucune donnée « ${title.toLowerCase()} » pour l'instant`}
        description="Ce graphique se remplira dès que le bot commencera à remonter cette métrique."
      />
    );
  }

  const points = data.map((p) => ({
    date: new Date(p.capturedAt).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    value: p.value,
  }));

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-foreground">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={points} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="#232838" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#656a7d"
            tick={{ fill: "#9297ab", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#656a7d"
            tick={{ fill: "#9297ab", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              background: "#131620",
              border: "1px solid #232838",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e8e9ee" }}
            formatter={(value) => [`${value}${unit ?? ""}`, title]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={SERIES_COLOR}
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
