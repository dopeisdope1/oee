import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Guild } from "@/types";

export function GuildTabs({
  botId,
  section,
  guilds,
  activeGuildId,
}: {
  botId: string;
  section: string;
  guilds: Guild[];
  activeGuildId: string | undefined;
}) {
  if (guilds.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-border pb-3">
      {guilds.map((guild) => {
        const active = guild.id === activeGuildId;
        return (
          <Link
            key={guild.id}
            href={`/bots/${botId}/${section}?guildId=${encodeURIComponent(guild.id)}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent/15 text-accent"
                : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            )}
          >
            {guild.name}
          </Link>
        );
      })}
    </div>
  );
}
