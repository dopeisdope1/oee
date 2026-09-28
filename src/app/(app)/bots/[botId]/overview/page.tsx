import { getBotService } from "@/server/services/registry";
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

  const [statusResult, capabilities] = await Promise.all([
    safeCall(() => service.getStatus()),
    safeCall(() => service.getCapabilities()),
  ]);

  if (statusResult.data) {
    // Refresh the cache the sidebar/dashboard read from — best-effort.
    void writeStatusCache(botId, statusResult.data).catch(() => {});
  }

  const hasStatistics = capabilities.data?.includes("statistics") ?? false;
  const hasSystems = capabilities.data?.includes("systems") ?? false;

  // Counted live from the bot, across every server it's in — the panel's own
  // SystemConfig table only knows about toggles made through the panel, so
  // it missed anything enabled with the bot's own commands.
  const activeSystems = hasSystems
    ? await safeCall(async () => {
        const guilds = await service.getGuilds();
        const perGuild = await Promise.all(guilds.map((g) => service.getSystems(g.id)));
        return perGuild.flat().filter((s) => s.enabled).length;
      })
    : null;

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
      <div>
        <h2 className="text-base font-semibold text-foreground">Tableau de bord</h2>
        <p className="mt-0.5 text-sm text-foreground-muted">État en direct et activité de ce bot.</p>
      </div>

      {!statusResult.data ? (
        <ErrorState code={statusResult.error ?? "unknown"} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat icon={Clock} label="Disponibilité" value={formatUptime(statusResult.data.uptimeSeconds)} />
          <Stat icon={Gauge} label="Latence" value={statusResult.data.latencyMs != null ? `${statusResult.data.latencyMs} ms` : "—"} />
          <Stat icon={Server} label="Serveurs" value={statusResult.data.guildCount ?? "—"} />
          <Stat icon={Activity} label="Systèmes actifs" value={activeSystems?.data ?? "—"} />
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
            title="Pas encore de statistiques pour ce bot"
            description="Ce bot n'a pas encore implémenté l'API de statistiques."
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
