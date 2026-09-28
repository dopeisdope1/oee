import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBotService } from "@/server/services/registry";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { safeCall } from "@/server/safe-call";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { CommandRulesPanel } from "./command-rules-panel";

export default async function CommandRulesPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string; commandId: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId, commandId } = await params;
  const { guildId } = await searchParams;
  const service = await getBotService(botId);
  const bot = await getBotSummary(botId);
  if (!service || !bot) notFound();

  if (!guildId) {
    return <ErrorState code="bad_response" />;
  }

  const capabilities = await service.getCapabilities();
  if (!capabilities.includes("commandRules")) {
    return (
      <EmptyState
        title="Pas encore disponible sur ce bot"
        description="Ce bot n'a pas encore implémenté les règles de permission par commande (rôles/utilisateurs/salons/cooldown)."
      />
    );
  }

  const [commandsResult, ruleResult, rolesResult, channelsResult] = await Promise.all([
    safeCall(() => service.getCommands(guildId)),
    safeCall(() => service.getCommandRule(commandId, guildId)),
    safeCall(() => service.getGuildRoles(guildId)),
    safeCall(() => service.getGuildChannels(guildId)),
  ]);

  const command = commandsResult.data?.find((c) => c.id === commandId);

  if (!ruleResult.data) {
    return <ErrorState code={ruleResult.error ?? "unknown"} />;
  }

  return (
    <div className="max-w-4xl space-y-4">
      <Link
        href={`/bots/${botId}/commands?guildId=${encodeURIComponent(guildId)}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux commandes
      </Link>

      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-foreground">
          /{command?.name ?? commandId}
        </h2>
        {command?.category && <Badge>{command.category}</Badge>}
      </div>
      {command?.description && <p className="text-sm text-foreground-muted">{command.description}</p>}

      <CommandRulesPanel
        botId={botId}
        guildId={guildId}
        commandId={commandId}
        initialRule={ruleResult.data}
        roles={rolesResult.data ?? []}
        channels={channelsResult.data ?? []}
      />
    </div>
  );
}
