import { Badge, type BadgeTone } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/types";

const LEVEL_DOT: Record<LogEntry["level"], string> = {
  info: "bg-info",
  warn: "bg-warning",
  error: "bg-danger",
};

const LEVEL_TONE: Record<LogEntry["level"], BadgeTone> = {
  info: "info",
  warn: "warning",
  error: "danger",
};

function relativeTime(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 5) return "à l'instant";
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.round(hours / 24);
  return `il y a ${days}j`;
}

/** A live-feed style list — mirrors an activity log, not a spreadsheet: one
 * colored status dot and a right-aligned type badge + relative time per
 * row, so a long list of real moderation/config events scans at a glance. */
export function LogTable({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-hover"
        >
          <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", LEVEL_DOT[entry.level])} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-foreground">{entry.message}</p>
            {entry.guildId && (
              <p className="mt-0.5 truncate text-xs text-foreground-subtle">
                Serveur {entry.guildId}
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <Badge tone={LEVEL_TONE[entry.level]}>{entry.type}</Badge>
            <span className="text-xs text-foreground-subtle">{relativeTime(entry.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
