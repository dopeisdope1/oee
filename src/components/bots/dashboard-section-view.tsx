import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { listGuilds as listCachedGuilds } from "@/server/repositories/guilds";
import { GuildTabs } from "@/components/bots/guild-tabs";
import { SystemCard } from "@/components/bots/system-card";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import { getDashboardSection } from "@/lib/dashboard-sections";
import { CommandsTable } from "@/app/(app)/bots/[botId]/commands/commands-table";

/**
 * Shared body for the Modération/Sécurité/Tickets/Vocal pages: same
 * category-filtered view over the SAME systems/commands data the generic
 * Systems and Commands pages already fetch — never a parallel data source,
 * just a different lens on it (see src/lib/dashboard-sections.ts).
 */
export async function DashboardSectionView({
  botId,
  sectionKey,
  requestedGuildId,
}: {
  botId: string;
  sectionKey: string;
  requestedGuildId: string | undefined;
}) {
  const section = getDashboardSection(sectionKey);
  if (!section) return <ErrorState code="unknown" />;

  const service = await getBotService(botId);
  if (!service) return <ErrorState code="unknown" />;

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

  const [systemsResult, commandsResult] = await Promise.all([
    safeCall(() => service.getSystems(activeGuildId)),
    safeCall(() => service.getCommands(activeGuildId)),
  ]);

  const systems = (systemsResult.data ?? []).filter((s) => s.category && section.categories.includes(s.category));
  const commands = (commandsResult.data ?? []).filter((c) => c.category && section.categories.includes(c.category));

  const nothingAtAll = systems.length === 0 && commands.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">{section.label}</h2>
        <p className="mt-0.5 text-sm text-foreground-muted">{section.description}</p>
      </div>

      <GuildTabs botId={botId} section={sectionKey} guilds={guilds} activeGuildId={activeGuildId} />

      {nothingAtAll ? (
        <EmptyState
          title="Rien de ce côté sur ce bot"
          description="Ce bot n'a ni système ni commande rangés dans cette catégorie."
        />
      ) : (
        <>
          {systems.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Systèmes</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {systems.map((system) => (
                  <SystemCard key={system.key} botId={botId} guildId={activeGuildId} system={system} />
                ))}
              </div>
            </section>
          )}

          {commands.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Commandes</h3>
              <CommandsTable botId={botId} guildId={activeGuildId} commands={commands} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
