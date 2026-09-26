import "server-only";
import { prisma } from "@/lib/prisma";
import type { LogEntry } from "@/types";

export interface ActivityItem extends LogEntry {
  botId: string;
  botName: string;
}

/** Recent log entries across every bot, for the global dashboard's
 * "Recent activity" feed. DB-only, same as bot-summaries — never a live
 * call to any bot. */
export async function listRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const entries = await prisma.logEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { bot: { select: { name: true } } },
  });

  return entries.map((e) => ({
    id: e.id,
    botId: e.botId,
    botName: e.bot.name,
    guildId: e.guildId,
    level: e.level as LogEntry["level"],
    type: e.type as LogEntry["type"],
    message: e.message,
    metadata: safeParse(e.metadata),
    createdAt: e.createdAt.toISOString(),
  }));
}

function safeParse(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
