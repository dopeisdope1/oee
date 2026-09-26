import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { listGuilds as listCachedGuilds } from "@/server/repositories/guilds";
import { listSystemDefinitions } from "@/server/repositories/systems";
import { GuildTabs } from "@/components/bots/guild-tabs";
import { SystemCard } from "@/components/bots/system-card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import type { SystemState } from "@/types";

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

  const systemsResult = await safeCall(() => service.getSystems(activeGuildId));
  let systems: SystemState[] = [];
  let fallbackNotice = false;

  if (systemsResult.data) {
    systems = systemsResult.data;
  } else if (systemsResult.error === "not_capable") {
    const defs = await listSystemDefinitions(botId);
    systems = defs.map((def) => ({
      ...def,
      enabled: false,
      config: {},
      updatedAt: null,
      available: false,
    }));
    fallbackNotice = true;
  }

  return (
    <div className="space-y-4">
      <GuildTabs botId={botId} section="systems" guilds={guilds} activeGuildId={activeGuildId} />

      {systemsResult.error && !fallbackNotice ? (
        <ErrorState code={systemsResult.error} />
      ) : systems.length === 0 ? (
        <EmptyState title="Aucun système configuré pour ce bot pour l'instant" />
      ) : (
        <>
          {fallbackNotice && (
            <p className="text-sm text-foreground-subtle">
              Ce bot n&apos;a pas encore implémenté l&apos;API Systèmes — affichage
              du catalogue de départ, tous désactivés, pour que tu voies ce qui est prévu.
            </p>
          )}
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
