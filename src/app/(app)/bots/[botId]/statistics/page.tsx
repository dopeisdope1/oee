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

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-foreground">Statistiques</h2>
        <p className="mt-0.5 text-sm text-foreground-muted">Tendances réelles rapportées par ce bot.</p>
      </div>
      <div className="flex gap-1 rounded-lg border border-border p-0.5">
        {[7, 30, 90].map((d) => (
          <a
            key={d}
            href={`/bots/${botId}/statistics?range=${d}`}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              days === d
                ? "bg-accent/15 text-accent"
                : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {d}j
          </a>
        ))}
      </div>
    </div>
  );

  if (!hasStatistics) {
    return (
      <div className="space-y-4">
        {header}
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
        {header}
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
      {header}

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
