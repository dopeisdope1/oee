import "server-only";
import { prisma } from "@/lib/prisma";

export interface AuditItem {
  id: string;
  userName: string | null;
  userImage: string | null;
  botId: string;
  botName: string;
  guildId: string | null;
  action: string;
  before: unknown;
  after: unknown;
  createdAt: string;
}

/** Every configuration change made through THIS panel — recordAudit() is
 * called from every mutating API route (command toggle, command rules,
 * system config, guild config, ...). Independent of a bot's own functional
 * logs (LogEntry) — this is "who changed what here", not "what the bot
 * did". */
export async function listAuditLog(opts: { botId?: string; limit?: number } = {}): Promise<AuditItem[]> {
  const entries = await prisma.auditLog.findMany({
    where: opts.botId ? { botId: opts.botId } : undefined,
    orderBy: { createdAt: "desc" },
    take: opts.limit ?? 100,
    include: { bot: { select: { name: true } }, user: { select: { name: true, image: true } } },
  });

  return entries.map((e) => ({
    id: e.id,
    userName: e.user.name,
    userImage: e.user.image,
    botId: e.botId,
    botName: e.bot.name,
    guildId: e.guildId,
    action: e.action,
    before: safeParse(e.before),
    after: safeParse(e.after),
    createdAt: e.createdAt.toISOString(),
  }));
}

function safeParse(json: string | null): unknown {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
