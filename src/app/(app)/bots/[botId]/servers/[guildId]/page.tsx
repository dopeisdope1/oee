import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { GuildConfigForm } from "./guild-config-form";

export default async function ServerDetailPage({
  params,
}: {
  params: Promise<{ botId: string; guildId: string }>;
}) {
  const { botId, guildId } = await params;
  const service = await getBotService(botId);
  if (!service) notFound();

  const [guildsResult, configResult] = await Promise.all([
    safeCall(() => service.getGuilds()),
    safeCall(() => service.getGuildConfig(guildId)),
  ]);

  const guild = guildsResult.data?.find((g) => g.id === guildId);

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {guild?.name ?? guildId}
        </h2>
        {guild?.memberCount != null && (
          <p className="text-sm text-foreground-muted">{guild.memberCount} members</p>
        )}
      </div>

      <Card>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Specific to this server only — changes here never affect any other server this bot is in.
        </CardDescription>

        <div className="mt-4">
          {!configResult.data ? (
            <ErrorState code={configResult.error ?? "unknown"} />
          ) : (
            <GuildConfigForm
              botId={botId}
              guildId={guildId}
              initialPrefix={configResult.data.prefix ?? ""}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
