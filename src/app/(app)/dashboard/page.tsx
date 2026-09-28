import { listBotSummaries } from "@/server/queries/bot-summaries";
import { listRecentActivity } from "@/server/queries/activity";
import { listNotifications } from "@/server/queries/notifications";
import { BotCard } from "@/components/bots/bot-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity, Bot as BotIcon, Server, SlashSquare, Wifi, AlertTriangle, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const bots = await listBotSummaries();
  const [activity, alerts] = await Promise.all([
    listRecentActivity(8),
    listNotifications(bots),
  ]);

  const online = bots.filter((b) => b.status.state === "online").length;
  const totalServers = bots.reduce((sum, b) => sum + (b.status.guildCount ?? 0), 0);
  const totalCommands = bots.reduce((sum, b) => sum + (b.commandCount ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Vue d&apos;ensemble</h1>
        <p className="mt-0.5 text-sm text-foreground-muted">Tes 4 bots, leur état et leur activité, en un coup d&apos;œil.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Bots gérés" value={bots.length} icon={BotIcon} />
        <SummaryStat
          label="En ligne"
          value={online}
          icon={Wifi}
          tone={online === bots.length ? "success" : online === 0 ? "danger" : "warning"}
        />
        <SummaryStat label="Serveurs couverts" value={totalServers} icon={Server} />
        <SummaryStat label="Commandes actives" value={totalCommands} icon={SlashSquare} />
      </div>

      {alerts.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <AlertTriangle className="size-4 text-warning" />
            Alertes
          </h2>
          <Card className="divide-y divide-border p-0">
            {alerts.slice(0, 4).map((a) => (
              <a
                key={a.id}
                href={a.href}
                className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface-hover"
              >
                {a.severity === "danger" ? (
                  <WifiOff className="size-4 shrink-0 text-danger" />
                ) : (
                  <AlertTriangle className="size-4 shrink-0 text-warning" />
                )}
                <div className="min-w-0">
                  <p className="truncate text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-foreground-subtle">{a.description}</p>
                </div>
              </a>
            ))}
          </Card>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Tes bots</h2>
        {bots.length === 0 ? (
          <EmptyState
            title="Aucun bot configuré pour l'instant"
            description="Ajoute BOT_1_NAME (ainsi que son URL/clé d'API) à l'environnement du panneau puis relance le seed pour le voir ici."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bots.map((bot, i) => (
              <BotCard key={bot.id} bot={bot} index={i} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Activité récente</h2>
        {activity.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Aucune activité pour l'instant"
            description="Dès que tes bots signaleront des événements, ils apparaîtront ici."
          />
        ) : (
          <Card className="divide-y divide-border p-0">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate text-foreground">{item.message}</p>
                  <p className="text-xs text-foreground-subtle">{item.botName}</p>
                </div>
                <span className="shrink-0 text-xs text-foreground-subtle">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

const STAT_TONE: Record<string, string> = {
  success: "text-success bg-success/12",
  warning: "text-warning bg-warning/12",
  danger: "text-danger bg-danger/12",
  neutral: "text-accent bg-accent/12",
};

function SummaryStat({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: "success" | "warning" | "danger" | "neutral";
}) {
  return (
    <Card>
      <div className={cn("icon-circle size-8", STAT_TONE[tone])}>
        <Icon className="size-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-foreground-subtle">{label}</p>
    </Card>
  );
}
