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
        <CardTitle>Identité</CardTitle>
        <CardDescription>
          La façon dont ce bot est étiqueté dans le panneau. Cela ne modifie
          pas le vrai profil Discord du bot — il n&apos;y a pas encore d&apos;API pour ça.
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
        <CardTitle>Connexion</CardTitle>
        <CardDescription>
          {summary.configured
            ? "Ce bot a une URL d'API configurée."
            : "Aucune URL d'API configurée pour ce bot — définis BOT_n_API_URL dans l'environnement du panneau."}
        </CardDescription>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-subtle">URL de base de l&apos;API</dt>
            <dd className="truncate text-foreground">{record.apiBaseUrl || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-subtle">Variable d&apos;environnement de la clé d&apos;API</dt>
            <dd className="text-foreground">
              <code className="text-xs">{record.apiKeyRef}</code>
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-foreground-subtle">Statut</dt>
            <dd className="text-foreground">{summary.status.state}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-foreground-subtle">
          La clé d&apos;API elle-même n&apos;est jamais affichée ici — elle est lue
          depuis l&apos;environnement du serveur et n&apos;est jamais envoyée au navigateur.
        </p>
      </Card>

      <Card>
        <CardTitle>Intégrations</CardTitle>
        <CardDescription>
          Aucune intégration supplémentaire configurée pour ce bot pour l&apos;instant.
        </CardDescription>
      </Card>
    </div>
  );
}
