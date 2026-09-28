import { listAuditLog } from "@/server/queries/audit";
import { listBotSummaries } from "@/server/queries/bot-summaries";
import { EmptyState } from "@/components/ui/empty-state";
import { History } from "lucide-react";
import { AuditFilter } from "./audit-filter";

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ botId?: string }>;
}) {
  const { botId } = await searchParams;
  const [entries, bots] = await Promise.all([
    listAuditLog({ botId, limit: 150 }),
    listBotSummaries(),
  ]);

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Historique des modifications</h1>
          <p className="text-sm text-foreground-muted">
            Chaque changement de configuration fait depuis ce panneau — commandes, règles de permission, systèmes.
          </p>
        </div>
        <AuditFilter bots={bots} activeBotId={botId} />
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={History} title="Aucune modification enregistrée pour l'instant" />
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {entries.map((entry) => (
            <details key={entry.id} className="group px-4 py-3">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  {entry.userImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={entry.userImage} alt="" className="size-6 shrink-0 rounded-full" />
                  ) : (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent">
                      {(entry.userName ?? "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">
                      <span className="font-medium">{entry.userName ?? "Quelqu'un"}</span>{" "}
                      <span className="text-foreground-muted">a modifié</span>{" "}
                      <code className="text-xs text-accent">{entry.action}</code>
                    </p>
                    <p className="text-xs text-foreground-subtle">
                      {entry.botName}
                      {entry.guildId ? ` · serveur ${entry.guildId}` : ""}
                    </p>
                  </div>
                </div>
                <time className="shrink-0 text-xs text-foreground-subtle">
                  {new Date(entry.createdAt).toLocaleString("fr-FR")}
                </time>
              </summary>
              {(entry.before !== null || entry.after !== null) && (
                <div className="mt-3 grid gap-3 pl-8.5 sm:grid-cols-2">
                  {entry.before !== null && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-foreground-subtle">Avant</p>
                      <pre className="overflow-x-auto rounded-lg border border-border bg-background p-2 text-xs text-foreground-muted">
                        {JSON.stringify(entry.before, null, 2)}
                      </pre>
                    </div>
                  )}
                  {entry.after !== null && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-foreground-subtle">Après</p>
                      <pre className="overflow-x-auto rounded-lg border border-border bg-background p-2 text-xs text-foreground-muted">
                        {JSON.stringify(entry.after, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
