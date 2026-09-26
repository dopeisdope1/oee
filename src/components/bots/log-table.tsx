import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/types";

const LEVEL_STYLES: Record<LogEntry["level"], string> = {
  info: "text-foreground-muted",
  warn: "text-warning",
  error: "text-danger",
};

export function LogTable({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-subtle">
            <th className="px-4 py-2.5 font-medium">Time</th>
            <th className="px-4 py-2.5 font-medium">Type</th>
            <th className="px-4 py-2.5 font-medium">Message</th>
            <th className="px-4 py-2.5 font-medium">Server</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-border last:border-0">
              <td className="whitespace-nowrap px-4 py-2.5 text-foreground-subtle">
                {new Date(entry.createdAt).toLocaleString()}
              </td>
              <td className="px-4 py-2.5">
                <Badge className={cn(LEVEL_STYLES[entry.level])}>{entry.type}</Badge>
              </td>
              <td className={cn("px-4 py-2.5", LEVEL_STYLES[entry.level])}>
                {entry.message}
              </td>
              <td className="px-4 py-2.5 text-foreground-subtle">
                {entry.guildId ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
