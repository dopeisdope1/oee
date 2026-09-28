import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { BotAvatar } from "@/components/bots/bot-avatar";
import { cn } from "@/lib/utils";
import type { BotSummary } from "@/types";

// A deterministic accent per bot (from its id) so the 4 cards read as 4
// distinct products at a glance, without inventing per-bot branding data.
const ACCENT_BARS = ["bg-accent", "bg-info", "bg-success", "bg-accent-2"];

export function BotCard({ bot, index = 0 }: { bot: BotSummary; index?: number }) {
  return (
    <Link href={`/bots/${bot.id}/overview`} className="group block">
      <Card className="relative overflow-hidden p-0 transition-all duration-150 group-hover:border-border group-hover:shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_16px_32px_-16px_rgba(0,0,0,0.7)]">
        <span
          className={cn("absolute inset-x-0 top-0 h-0.5", ACCENT_BARS[index % ACCENT_BARS.length])}
          aria-hidden
        />
        <div className="p-5">
          <div className="flex items-center gap-3">
            <BotAvatar name={bot.name} avatarUrl={bot.avatarUrl} size={10} />
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
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-2.5 text-xs font-medium text-foreground-subtle transition-colors group-hover:text-accent">
          Gérer ce bot
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
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
