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
import { Server } from "lucide-react";
import { cn } from "@/lib/utils";
import { MESSAGE_TEMPLATE_DEFINITIONS } from "@/lib/message-keys";

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
      <GuildTabs botId={botId} section="messages" guilds={guilds} activeGuildId={activeGuildId} />

      <p className="text-sm text-foreground-subtle">
        Modifie les modèles de message et d&apos;embed envoyés par ce bot. La
        disponibilité est vérifiée par modèle — un bot qui n&apos;a pas encore
        implémenté une clé donnée te le dira honnêtement quand tu l&apos;ouvriras.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MESSAGE_TEMPLATE_DEFINITIONS.map((def) => (
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
