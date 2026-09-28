import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { LogTable } from "@/components/bots/log-table";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
      <div>
        <h2 className="text-base font-semibold text-foreground">Journaux</h2>
        <p className="mt-0.5 text-sm text-foreground-muted">
          Événements récents remontés par ce bot — commandes, erreurs, changements de config.
        </p>
      </div>

      <Card>
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end" method="get">
          <div className="sm:col-span-2 lg:col-span-1">
            <Label htmlFor="search">Recherche</Label>
            <Input id="search" type="text" name="search" defaultValue={sp.search ?? ""} placeholder="Message..." />
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select id="type" name="type" defaultValue={sp.type ?? ""}>
              <option value="">Tous</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="level">Niveau</Label>
            <Select id="level" name="level" defaultValue={sp.level ?? ""}>
              <option value="">Tous</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="from">Du</Label>
            <Input id="from" type="date" name="from" defaultValue={sp.from ?? ""} />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="to">Au</Label>
              <Input id="to" type="date" name="to" defaultValue={sp.to ?? ""} />
            </div>
            <Button type="submit" variant="secondary">
              Filtrer
            </Button>
          </div>
        </form>
      </Card>

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
