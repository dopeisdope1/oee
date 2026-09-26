import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { listGuilds as listCachedGuilds } from "@/server/repositories/guilds";
import { GuildTabs } from "@/components/bots/guild-tabs";
import { SystemCard } from "@/components/bots/system-card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Server, ToggleLeft } from "lucide-react";

export default async function SystemsPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId } = await params;
  const { guildId: requestedGuildId } = await searchParams;
  const service = await getBotService(botId);
  if (!service) notFound();

  const liveGuilds = await safeCall(() => service.getGuilds());
  const guilds = liveGuilds.data ?? (await listCachedGuilds(botId));

  if (guilds.length === 0) {
    return liveGuilds.error ? (
      <ErrorState code={liveGuilds.error} />
    ) : (
      <EmptyState icon={Server} title="Ce bot n'est encore sur aucun serveur" />
    );
  }

  const activeGuildId = requestedGuildId ?? guilds[0].id;

  // A bot without the Systems API simply has nothing to toggle — say so,
  // rather than showing a catalog of systems it doesn't have.
  const systemsResult = await safeCall(() => service.getSystems(activeGuildId));
  const systems = systemsResult.data ?? [];

  return (
    <div className="space-y-4">
      <GuildTabs botId={botId} section="systems" guilds={guilds} activeGuildId={activeGuildId} />

      {systemsResult.error === "not_capable" ? (
        <EmptyState
          icon={ToggleLeft}
          title="Aucun système activable pour ce bot"
          description="Ce bot n'a aucune fonction à activer ou désactiver par serveur."
        />
      ) : systemsResult.error ? (
        <ErrorState code={systemsResult.error} />
      ) : systems.length === 0 ? (
        <EmptyState title="Aucun système configuré pour ce bot pour l'instant" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {systems.map((system) => (
              <SystemCard
                key={system.key}
                botId={botId}
                guildId={activeGuildId}
                system={system}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
