"use client";

import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/select";
import type { BotSummary } from "@/types";

export function AuditFilter({ bots, activeBotId }: { bots: BotSummary[]; activeBotId?: string }) {
  const router = useRouter();
  return (
    <Select
      value={activeBotId ?? "all"}
      onChange={(e) => router.push(e.target.value === "all" ? "/activity" : `/activity?botId=${e.target.value}`)}
      className="w-auto"
      aria-label="Filtrer par bot"
    >
      <option value="all">Tous les bots</option>
      {bots.map((bot) => (
        <option key={bot.id} value={bot.id}>
          {bot.name}
        </option>
      ))}
    </Select>
  );
}
