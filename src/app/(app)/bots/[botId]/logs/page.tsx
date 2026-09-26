import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { LogTable } from "@/components/bots/log-table";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollText } from "lucide-react";
import type { LogFilters, LogLevel, LogType } from "@/types";

const TYPES: LogType[] = ["command", "error", "event", "config_change", "startup", "shutdown"];
const LEVELS: LogLevel[] = ["info", "warn", "error"];

export default async function LogsPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{
    type?: string;
    level?: string;
    search?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const { botId } = await params;
  const sp = await searchParams;
  const service = await getBotService(botId);
  if (!service) notFound();

  const filters: LogFilters = {
    type: TYPES.includes(sp.type as LogType) ? (sp.type as LogType) : undefined,
    level: LEVELS.includes(sp.level as LogLevel) ? (sp.level as LogLevel) : undefined,
    search: sp.search || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    limit: 100,
  };

  const result = await safeCall(() => service.getLogs(filters));

  return (
    <div className="space-y-4">
      <form className="flex flex-wrap items-end gap-2" method="get">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground-muted">
            Recherche
          </label>
          <input
            type="text"
            name="search"
            defaultValue={sp.search ?? ""}
            placeholder="Rechercher des messages..."
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Type</label>
          <select
            name="type"
            defaultValue={sp.type ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Tous</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Niveau</label>
          <select
            name="level"
            defaultValue={sp.level ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="">Tous</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Du</label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground-muted">Au</label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <button
          type="submit"
          className="h-9 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-foreground hover:bg-surface-hover"
        >
          Filtrer
        </button>
      </form>

      {!result.data ? (
        <ErrorState code={result.error ?? "unknown"} />
      ) : result.data.length === 0 ? (
        <EmptyState icon={ScrollText} title="Aucune entrée de journal ne correspond à ces filtres" />
      ) : (
        <LogTable entries={result.data} />
      )}
    </div>
  );
}
