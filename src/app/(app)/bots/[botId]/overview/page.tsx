import { getBotService } from "@/server/services/registry";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { writeStatusCache } from "@/server/repositories/bots";
import { safeCall } from "@/server/safe-call";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { StatChart } from "@/components/bots/stat-chart";
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

  const [statusResult, summary] = await Promise.all([
    safeCall(() => service.getStatus()),
    getBotSummary(botId),
  ]);

  if (statusResult.data) {
    // Refresh the cache the sidebar/dashboard read from — best-effort.
    void writeStatusCache(botId, statusResult.data).catch(() => {});
  }

  const range = { from: daysAgo(30), to: new Date().toISOString() };
  const [guildGrowth, commandUsage] = await Promise.all([
    safeCall(() => service.getStatistics("guild_count", range)),
    safeCall(() => service.getStatistics("command_usage", range)),
  ]);

  return (
    <div className="space-y-6">
      {!statusResult.data ? (
        <ErrorState code={statusResult.error ?? "unknown"} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Uptime" value={formatUptime(statusResult.data.uptimeSeconds)} />
          <Stat label="Latency" value={statusResult.data.latencyMs != null ? `${statusResult.data.latencyMs} ms` : "—"} />
          <Stat label="Servers" value={statusResult.data.guildCount ?? "—"} />
          <Stat label="Active systems" value={summary?.activeSystemCount ?? "—"} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          {!guildGrowth.data ? (
            <ErrorState code={guildGrowth.error ?? "unknown"} />
          ) : (
            <StatChart title="Server growth" data={guildGrowth.data} />
          )}
        </Card>
        <Card>
          {!commandUsage.data ? (
            <ErrorState code={commandUsage.error ?? "unknown"} />
          ) : (
            <StatChart title="Command usage" data={commandUsage.data} />
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-foreground-subtle">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
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
