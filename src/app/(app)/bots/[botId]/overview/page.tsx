import { getBotService } from "@/server/services/registry";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { writeStatusCache } from "@/server/repositories/bots";
import { safeCall } from "@/server/safe-call";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { StatChart } from "@/components/bots/stat-chart";
import { Activity, BarChart3, Clock, Gauge, Server } from "lucide-react";
import { notFound } from "next/navigation";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export default async function BotOverviewPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const service = await getBotService(botId);
  if (!service) notFound();

  const [statusResult, summary, capabilities] = await Promise.all([
    safeCall(() => service.getStatus()),
    getBotSummary(botId),
    safeCall(() => service.getCapabilities()),
  ]);

  if (statusResult.data) {
    // Refresh the cache the sidebar/dashboard read from — best-effort.
    void writeStatusCache(botId, statusResult.data).catch(() => {});
  }

  const hasStatistics = capabilities.data?.includes("statistics") ?? false;

  // Mirrors the Statistics page: ask the bot which metrics it actually
  // reports (falls back to the standard, never-implemented 4 when a bot
  // declares "statistics" without a real metric list) instead of always
  // requesting "guild_count"/"command_usage", which no bot tracks — that
  // used to show two error cards on every single bot's overview.
  const metrics = hasStatistics && service.getAvailableMetrics
    ? await safeCall(() => service.getAvailableMetrics!())
    : { data: null, error: "unknown" as const };

  const range = { from: daysAgo(30), to: new Date().toISOString() };
  const topMetrics = metrics.data?.slice(0, 2) ?? [];
  const charts = await Promise.all(
    topMetrics.map((m) => safeCall(() => service.getStatistics(m.metric, range)))
  );

  return (
    <div className="space-y-6">
      {!statusResult.data ? (
        <ErrorState code={statusResult.error ?? "unknown"} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={Clock} label="Uptime" value={formatUptime(statusResult.data.uptimeSeconds)} />
          <Stat icon={Gauge} label="Latency" value={statusResult.data.latencyMs != null ? `${statusResult.data.latencyMs} ms` : "—"} />
          <Stat icon={Server} label="Servers" value={statusResult.data.guildCount ?? "—"} />
          <Stat icon={Activity} label="Active systems" value={summary?.activeSystemCount ?? "—"} />
        </div>
      )}

      {topMetrics.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {topMetrics.map((m, i) => (
            <Card key={m.metric}>
              {!charts[i].data ? (
                <ErrorState code={charts[i].error ?? "unknown"} />
              ) : (
                <StatChart title={m.title} data={charts[i].data!} unit={m.unit} />
              )}
            </Card>
          ))}
        </div>
      )}

      {!hasStatistics && (
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No statistics for this bot yet"
            description="This bot hasn't implemented the statistics API yet."
          />
        </Card>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="flex items-start gap-3">
      <span className="icon-circle size-9 shrink-0">
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-foreground-subtle">{label}</p>
        <p className="mt-0.5 text-xl font-semibold text-foreground">{value}</p>
      </div>
    </Card>
  );
}

function formatUptime(seconds: number | null): string {
  if (seconds == null) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
