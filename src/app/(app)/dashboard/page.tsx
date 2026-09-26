import { listBotSummaries } from "@/server/queries/bot-summaries";
import { listRecentActivity } from "@/server/queries/activity";
import { BotCard } from "@/components/bots/bot-card";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

export default async function DashboardPage() {
  const [bots, activity] = await Promise.all([
    listBotSummaries(),
    listRecentActivity(8),
  ]);

  const online = bots.filter((b) => b.status.state === "online").length;
  const totalServers = bots.reduce((sum, b) => sum + (b.status.guildCount ?? 0), 0);
  const totalCommands = bots.reduce((sum, b) => sum + (b.commandCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Vue d&apos;ensemble</h1>
        <p className="text-sm text-foreground-muted">Tous tes bots, en un coup d&apos;œil.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryStat label="Bots" value={bots.length} />
        <SummaryStat label="En ligne" value={online} />
        <SummaryStat label="Serveurs" value={totalServers} />
        <SummaryStat label="Commandes" value={totalCommands} />
      </div>

      {bots.length === 0 ? (
        <EmptyState
          title="Aucun bot configuré pour l'instant"
          description="Ajoute BOT_1_NAME (ainsi que son URL/clé d'API) à l'environnement du panneau puis relance le seed pour le voir ici."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}

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

function SummaryStat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-foreground-subtle">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}
