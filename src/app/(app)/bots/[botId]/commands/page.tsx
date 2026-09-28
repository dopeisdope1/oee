import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { listGuilds as listCachedGuilds } from "@/server/repositories/guilds";
import { GuildTabs } from "@/components/bots/guild-tabs";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Server } from "lucide-react";
import { CommandsTable } from "./commands-table";

export default async function CommandsPage({
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

  const header = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Commandes</h2>
      <p className="mt-0.5 text-sm text-foreground-muted">
        Active, restreint ou configure chaque commande, serveur par serveur.
      </p>
    </div>
  );

  const liveGuilds = await safeCall(() => service.getGuilds());
  const guilds = liveGuilds.data ?? (await listCachedGuilds(botId));

  if (guilds.length === 0) {
    return (
      <div className="space-y-4">
        {header}
        {liveGuilds.error ? (
          <ErrorState code={liveGuilds.error} />
        ) : (
          <EmptyState icon={Server} title="Ce bot n'est encore sur aucun serveur" />
        )}
      </div>
    );
  }

  const activeGuildId = requestedGuildId ?? guilds[0].id;

  const capabilities = await safeCall(() => service.getCapabilities());
  const hasRules = capabilities.data?.includes("commandRules") ?? false;

  const [commandsResult, rulesResult] = await Promise.all([
    safeCall(() => service.getCommands(activeGuildId)),
    hasRules ? safeCall(() => service.getAllCommandRules(activeGuildId)) : Promise.resolve({ data: null, error: undefined }),
  ]);
  const commands = commandsResult.data;

  return (
    <div className="space-y-4">
      {header}

      <GuildTabs botId={botId} section="commands" guilds={guilds} activeGuildId={activeGuildId} />

      {!commands ? (
        <ErrorState code={commandsResult.error ?? "unknown"} />
      ) : commands.length === 0 ? (
        <EmptyState title="Aucune commande signalée par ce bot pour l'instant" />
      ) : (
        <CommandsTable
          botId={botId}
          guildId={activeGuildId}
          commands={commands}
          rules={rulesResult.data ?? undefined}
        />
      )}
    </div>
  );
}
