import "server-only";
import { prisma } from "@/lib/prisma";
import { listBotRecords, getCachedStatus } from "@/server/repositories/bots";
import type { BotSummary } from "@/types";

/**
 * Fast, DB-only summaries for the sidebar/dashboard — deliberately never
 * calls a bot's live API (that would mean 4 outbound HTTP calls on every
 * navigation). Status comes from BotStatusCache, kept fresh by the events
 * webhook and/or a polling job (see architecture doc, section 5). A bot
 * that has never reported in shows "unknown", never a guessed "online".
 */
export async function listBotSummaries(): Promise<BotSummary[]> {
  const bots = await listBotRecords();

  return Promise.all(
    bots.map(async (bot): Promise<BotSummary> => {
      const [status, commandCount, activeSystemCount] = await Promise.all([
        getCachedStatus(bot.id),
        prisma.command.count({ where: { botId: bot.id } }),
        prisma.systemConfig.count({ where: { botId: bot.id, enabled: true } }),
      ]);

      return {
        id: bot.id,
        name: bot.name,
        avatarUrl: bot.avatarUrl,
        configured: Boolean(bot.apiBaseUrl),
        status,
        commandCount,
        activeSystemCount,
      };
    })
  );
}

export async function getBotSummary(botId: string): Promise<BotSummary | null> {
  const summaries = await listBotSummaries();
  return summaries.find((b) => b.id === botId) ?? null;
}
