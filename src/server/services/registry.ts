import "server-only";
import { getBotRecord } from "@/server/repositories/bots";
import { HttpBotAdapter } from "./http-bot-adapter";
import type { DiscordBotService } from "./discord-bot-service";

// One adapter instance per bot, reused across requests within this process
// so we're not constructing a new HTTP client on every call. Safe because
// HttpBotAdapter holds no per-request state beyond its own bot's config.
const cache = new Map<string, DiscordBotService>();

/**
 * The only way any route or server component should obtain a bot
 * integration. Looks the bot up (so an unknown botId fails before any
 * network call is attempted), then returns a cached adapter for it.
 *
 * Returns null if botId doesn't correspond to a known bot — callers should
 * treat that as 404, not attempt a request.
 */
export async function getBotService(
  botId: string
): Promise<DiscordBotService | null> {
  if (cache.has(botId)) return cache.get(botId)!;

  const bot = await getBotRecord(botId);
  if (!bot) return null;

  const adapter = new HttpBotAdapter(bot);
  cache.set(botId, adapter);
  return adapter;
}

/** Drops a cached adapter, e.g. after the bot's config row changes. */
export function invalidateBotService(botId: string) {
  cache.delete(botId);
}
