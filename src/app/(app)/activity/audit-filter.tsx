"use client";

import { useRouter } from "next/navigation";
import type { BotSummary } from "@/types";

export function AuditFilter({ bots, activeBotId }: { bots: BotSummary[]; activeBotId?: string }) {
  const router = useRouter();
  return (
    <select
      value={activeBotId ?? "all"}
      onChange={(e) => router.push(e.target.value === "all" ? "/activity" : `/activity?botId=${e.target.value}`)}
      className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
    >
      <option value="all">Tous les bots</option>
      {bots.map((bot) => (
        <option key={bot.id} value={bot.id}>
          {bot.name}
        </option>
      ))}
    </select>
  );
}
