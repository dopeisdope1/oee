import { notFound } from "next/navigation";
import Link from "next/link";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { listGuilds as listCachedGuilds } from "@/server/repositories/guilds";
import { GuildTabs } from "@/components/bots/guild-tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageSquare, Server } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function MessagesPage({
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

  // Same approach as the Statistics page: a bot without the "messages"
  // capability gets one honest empty state, and a bot that declares its own
  // templates (GET /messages) shows exactly those instead of a fixed list.
  const capabilities = await safeCall(() => service.getCapabilities());
  if (!(capabilities.data?.includes("messages") ?? false)) {
    return (
      <Card>
        <EmptyState
          icon={MessageSquare}
          title="Aucun message modifiable pour ce bot"
          description="Ce bot n'envoie aucun message configurable depuis le panel."
        />
      </Card>
    );
  }

  const templates = service.getAvailableMessages
    ? await safeCall(() => service.getAvailableMessages!())
    : { data: null, error: "unknown" as const };
  if (!templates.data) {
    return (
      <Card>
        <ErrorState code={templates.error ?? "unknown"} />
      </Card>
    );
  }

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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Messages</h2>
        <p className="mt-0.5 text-sm text-foreground-muted">Modifie les messages envoyés automatiquement par ce bot.</p>
      </div>

      <GuildTabs botId={botId} section="messages" guilds={guilds} activeGuildId={activeGuildId} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.data.map((def) => (
          <Card key={def.key}>
            <CardHeader>
              <div>
                <CardTitle>{def.label}</CardTitle>
                <CardDescription>{def.description}</CardDescription>
              </div>
            </CardHeader>
            <Link
              href={`/bots/${botId}/messages/${def.key}?guildId=${encodeURIComponent(activeGuildId)}`}
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "mt-4 w-full")}
            >
              Modifier
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
