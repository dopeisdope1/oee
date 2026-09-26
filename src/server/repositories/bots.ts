import "server-only";
import { prisma } from "@/lib/prisma";
import type { BotRecord, BotState, BotStatus } from "@/types";

export async function getBotRecord(botId: string): Promise<BotRecord | null> {
  const bot = await prisma.bot.findUnique({ where: { id: botId } });
  if (!bot) return null;
  return {
    id: bot.id,
    name: bot.name,
    avatarUrl: bot.avatarUrl,
    apiBaseUrl: bot.apiBaseUrl,
    apiKeyRef: bot.apiKeyRef,
  };
}

export async function listBotRecords(): Promise<BotRecord[]> {
  const bots = await prisma.bot.findMany({ orderBy: { id: "asc" } });
  return bots.map((bot) => ({
    id: bot.id,
    name: bot.name,
    avatarUrl: bot.avatarUrl,
    apiBaseUrl: bot.apiBaseUrl,
    apiKeyRef: bot.apiKeyRef,
  }));
}

/** Updates the panel's own record of a bot's display name/avatar. This does
 * not touch the bot's actual Discord profile — there's no API for that in
 * the bot contract — it only changes how the bot is labeled in this panel. */
export async function updateBotIdentity(
  botId: string,
  patch: { name?: string; avatarUrl?: string | null }
): Promise<BotRecord> {
  const bot = await prisma.bot.update({ where: { id: botId }, data: patch });
  return {
    id: bot.id,
    name: bot.name,
    avatarUrl: bot.avatarUrl,
    apiBaseUrl: bot.apiBaseUrl,
    apiKeyRef: bot.apiKeyRef,
  };
}

export async function getCachedStatus(botId: string): Promise<BotStatus> {
  const cached = await prisma.botStatusCache.findUnique({ where: { botId } });
  if (!cached) {
    return {
      state: "unknown",
      latencyMs: null,
      uptimeSeconds: null,
      guildCount: null,
      lastCheckedAt: null,
    };
  }
  return {
    state: cached.state as BotState,
    latencyMs: cached.latencyMs,
    uptimeSeconds: cached.uptimeSeconds,
    guildCount: cached.guildCount,
    lastCheckedAt: cached.lastCheckedAt.toISOString(),
  };
}

export async function writeStatusCache(
  botId: string,
  status: Omit<BotStatus, "lastCheckedAt">
): Promise<void> {
  await prisma.botStatusCache.upsert({
    where: { botId },
    create: { botId, ...status },
    update: { ...status },
  });
}
