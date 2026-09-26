import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StatChart } from "@/components/bots/stat-chart";
import { BarChart3 } from "lucide-react";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

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

  // Ask the bot's own capabilities first: if it hasn't wired up statistics
  // at all, show one honest empty state instead of a grid of per-metric
  // errors — and don't call getAvailableMetrics on a bot that doesn't
  // support it.
  const capabilities = await safeCall(() => service.getCapabilities());
  const hasStatistics = capabilities.data?.includes("statistics") ?? false;

  const rangePicker = (
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
  );

  if (!hasStatistics) {
    return (
      <div className="space-y-4">
        {rangePicker}
        <Card>
          <EmptyState
            icon={BarChart3}
            title="Pas encore de statistiques pour ce bot"
            description="Ce bot n'a pas encore implémenté l'API de statistiques."
          />
        </Card>
      </div>
    );
  }

  // getAvailableMetrics() falls back to the standard 4-metric list on its
  // own when a bot declares "statistics" but not the metrics endpoint —
  // real bots (like ones tracking their own message/join/leave counts)
  // report their real metric list instead.
  const metrics = service.getAvailableMetrics
    ? await safeCall(() => service.getAvailableMetrics!())
    : { data: null, error: "unknown" as const };

  if (!metrics.data) {
    return (
      <div className="space-y-4">
        {rangePicker}
        <Card>
          <ErrorState code={metrics.error ?? "unknown"} />
        </Card>
      </div>
    );
  }

  const results = await Promise.all(
    metrics.data.map((m) => safeCall(() => service.getStatistics(m.metric, range)))
  );

  return (
    <div className="space-y-4">
      {rangePicker}

      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.data.map((m, i) => {
          const data = results[i].data;
          return (
            <Card key={m.metric}>
              {!data ? (
                <ErrorState code={results[i].error ?? "unknown"} />
              ) : (
                <StatChart title={m.title} data={data} unit={m.unit} />
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
