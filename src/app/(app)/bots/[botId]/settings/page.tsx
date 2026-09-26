import { notFound } from "next/navigation";
import { getBotRecord } from "@/server/repositories/bots";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { BotIdentityForm } from "./bot-identity-form";

export default async function BotSettingsPage({
  params,
}: {
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const [record, summary] = await Promise.all([
    getBotRecord(botId),
    getBotSummary(botId),
  ]);
  if (!record || !summary) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardTitle>Identity</CardTitle>
        <CardDescription>
          How this bot is labeled inside the panel. This doesn&apos;t change the
          bot&apos;s actual Discord profile — there&apos;s no API for that yet.
        </CardDescription>
        <div className="mt-4">
          <BotIdentityForm
            botId={botId}
            initialName={record.name}
            initialAvatarUrl={record.avatarUrl}
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Connection</CardTitle>
        <CardDescription>
          {summary.configured
            ? "This bot has an API URL configured."
            : "No API URL configured yet for this bot — set BOT_n_API_URL in the panel's environment."}
        </CardDescription>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-subtle">API base URL</dt>
            <dd className="truncate text-foreground">{record.apiBaseUrl || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-subtle">API key env var</dt>
            <dd className="text-foreground">
              <code className="text-xs">{record.apiKeyRef}</code>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-subtle">Status</dt>
            <dd className="text-foreground">{summary.status.state}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-foreground-subtle">
          The API key itself is never shown here — it&apos;s read from the server
          environment and never sent to the browser.
        </p>
      </Card>

      <Card>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          No additional integrations configured for this bot yet.
        </CardDescription>
      </Card>
    </div>
  );
}
