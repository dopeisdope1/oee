import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { BotSummary } from "@/types";

export function BotCard({ bot }: { bot: BotSummary }) {
  return (
    <Link href={`/bots/${bot.id}/overview`}>
      <Card className="transition-colors hover:bg-surface-hover">
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold">
            {bot.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{bot.name}</p>
            <StatusBadge state={bot.status.state} />
          </div>
        </div>

        {!bot.configured ? (
          <p className="mt-4 text-xs text-foreground-subtle">
            Pas encore configuré — ajoute son URL d&apos;API et sa clé pour voir les données en direct.
          </p>
        ) : (
          <dl className="mt-4 grid grid-cols-2 gap-3">
            <Stat label="Serveurs" value={bot.status.guildCount} />
            <Stat label="Commandes" value={bot.commandCount} />
            <Stat label="Systèmes actifs" value={bot.activeSystemCount} />
            <Stat
              label="Disponibilité"
              value={
                bot.status.uptimeSeconds != null
                  ? formatUptime(bot.status.uptimeSeconds)
                  : null
              }
            />
          </dl>
        )}
      </Card>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: number | string | null }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-foreground-subtle">{label}</dt>
      <dd className="text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
