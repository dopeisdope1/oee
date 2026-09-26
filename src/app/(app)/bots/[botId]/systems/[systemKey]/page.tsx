import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { safeCall } from "@/server/safe-call";
import { ErrorState } from "@/components/ui/error-state";
import { Card } from "@/components/ui/card";
import { SystemConfigForm } from "./system-config-form";

export default async function SystemConfigPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string; systemKey: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId, systemKey } = await params;
  const { guildId } = await searchParams;
  const service = await getBotService(botId);
  const bot = await getBotSummary(botId);
  if (!service || !bot) notFound();

  if (!guildId) {
    return <ErrorState code="bad_response" />;
  }

  const result = await safeCall(async () => {
    const systems = await service.getSystems(guildId);
    const system = systems.find((s) => s.key === systemKey);
    if (!system) throw new Error("system not found in bot response");
    return system;
  });

  return (
    <div className="max-w-3xl space-y-4">
      <h2 className="text-sm font-semibold text-foreground">
        Configurer : {result.data?.label ?? systemKey}
      </h2>

      <Card>
        {!result.data ? (
          <ErrorState code={result.error ?? "unknown"} />
        ) : (
          <SystemConfigForm
            botId={botId}
            guildId={guildId}
            systemKey={systemKey}
            botName={bot.name}
            initialEnabled={result.data.enabled}
            initialConfig={result.data.config}
          />
        )}
      </Card>
    </div>
  );
}
