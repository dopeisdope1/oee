import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Guild } from "@/types";

export function ServerCard({ botId, guild }: { botId: string; guild: Guild }) {
  return (
    <Link href={`/bots/${botId}/servers/${guild.id}`} className="group block">
      <Card className="flex items-center gap-3 transition-colors group-hover:bg-surface-hover">
        {guild.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={guild.iconUrl} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
          >
            {guild.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{guild.name}</p>
          <p className="text-xs text-foreground-subtle">
            {guild.memberCount != null ? `${guild.memberCount} membres` : "Nombre de membres indisponible"}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-foreground-subtle transition-transform group-hover:translate-x-0.5" />
      </Card>
    </Link>
  );
}
