import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { Guild } from "@/types";

export function ServerCard({ botId, guild }: { botId: string; guild: Guild }) {
  return (
    <Link href={`/bots/${botId}/servers/${guild.id}`}>
      <Card className="transition-colors hover:bg-surface-hover">
        <div className="flex items-center gap-3">
          {guild.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={guild.iconUrl} alt="" className="size-10 shrink-0 rounded-full" />
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold">
              {guild.name.slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{guild.name}</p>
            <p className="text-xs text-foreground-subtle">
              {guild.memberCount != null ? `${guild.memberCount} members` : "Member count unavailable"}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
