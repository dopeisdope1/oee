import "server-only";
import { BotServiceError } from "@/server/services/errors";

export type SafeResult<T> = { data: T; error?: undefined } | { data?: undefined; error: string };

/** Wraps a DiscordBotService call so a page/route can render an honest
 * empty/error state instead of throwing — the error's `code` maps directly
 * to lib/error-messages.ts. */
export async function safeCall<T>(fn: () => Promise<T>): Promise<SafeResult<T>> {
  try {
    const data = await fn();
    return { data };
  } catch (err) {
    if (err instanceof BotServiceError) return { error: err.code };
    return { error: "unknown" };
  }
}
