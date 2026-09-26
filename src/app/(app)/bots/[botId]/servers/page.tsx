import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { upsertGuild } from "@/server/repositories/guilds";
import { ServerCard } from "@/components/bots/server-card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";

export default async function ServersPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const service = await getBotService(botId);
  if (!service) notFound();

  const result = await safeCall(() => service.getGuilds());

  if (result.data) {
    void Promise.all(result.data.map((g) => upsertGuild(botId, g))).catch(() => {});
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-foreground">Serveurs</h2>

      {!result.data ? (
        <ErrorState code={result.error ?? "unknown"} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={Server} title="Ce bot n'est encore sur aucun serveur" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((guild) => (
            <ServerCard key={guild.id} botId={botId} guild={guild} />
          ))}
        </div>
      )}
    </div>
  );
}
