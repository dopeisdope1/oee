import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { StatChart } from "@/components/bots/stat-chart";
import type { StatMetric } from "@/types";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const METRICS: { metric: StatMetric; title: string }[] = [
  { metric: "guild_count", title: "Servers" },
  { metric: "member_count", title: "Members" },
  { metric: "command_usage", title: "Command usage" },
  { metric: "error_count", title: "Errors" },
];

export default async function StatisticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ range?: string }>;
}) {
  const { botId } = await params;
  const { range: rangeParam } = await searchParams;
  const service = await getBotService(botId);
  if (!service) notFound();

  const days = rangeParam === "7" ? 7 : rangeParam === "90" ? 90 : 30;
  const range = { from: daysAgo(days), to: new Date().toISOString() };

  const results = await Promise.all(
    METRICS.map((m) => safeCall(() => service.getStatistics(m.metric, range)))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {[7, 30, 90].map((d) => (
          <a
            key={d}
            href={`/bots/${botId}/statistics?range=${d}`}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              days === d
                ? "bg-accent/15 text-accent"
                : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {d}d
          </a>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {METRICS.map((m, i) => {
          const data = results[i].data;
          return (
            <Card key={m.metric}>
              {!data ? (
                <ErrorState code={results[i].error ?? "unknown"} />
              ) : (
                <StatChart title={m.title} data={data} />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
