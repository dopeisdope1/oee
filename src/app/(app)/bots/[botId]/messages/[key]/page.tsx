import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { safeCall } from "@/server/safe-call";
import { ErrorState } from "@/components/ui/error-state";
import { Card } from "@/components/ui/card";
import { MessageTemplateForm } from "./message-template-form";

export default async function MessageTemplatePage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string; key: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId, key } = await params;
  const { guildId } = await searchParams;
  const service = await getBotService(botId);
  const bot = await getBotSummary(botId);
  if (!service || !bot) notFound();

  if (!guildId) {
    return <ErrorState code="bad_response" />;
  }

  const [templates, result] = await Promise.all([
    service.getAvailableMessages
      ? safeCall(() => service.getAvailableMessages!())
      : Promise.resolve({ data: null }),
    safeCall(() => service.getMessageTemplate(key, guildId)),
  ]);
  const def = templates.data?.find((d) => d.key === key);

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          {def?.label ?? key}
        </h2>
        {def?.description && (
          <p className="mt-1 text-sm text-foreground-subtle">{def.description}</p>
        )}
      </div>

      <Card>
        {!result.data ? (
          <ErrorState code={result.error ?? "unknown"} />
        ) : (
          <MessageTemplateForm
            botId={botId}
            guildId={guildId}
            templateKey={key}
            botName={bot.name}
            initialTemplate={result.data}
            fields={def?.fields ?? null}
          />
        )}
      </Card>
    </div>
  );
}
