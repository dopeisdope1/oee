import "server-only";
import { prisma } from "@/lib/prisma";

interface AuditEntry {
  userId: string;
  botId: string;
  guildId?: string | null;
  action: string;
  before?: unknown;
  after?: unknown;
}

/** Records who changed what, before/after, independent of the bot's own
 * functional logs. Called from every mutating API route (see section 6 of
 * the architecture doc) — never skipped, even when the underlying bot call
 * fails, so a failed attempt is still traceable. */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      botId: entry.botId,
      guildId: entry.guildId ?? null,
      action: entry.action,
      before: entry.before !== undefined ? JSON.stringify(entry.before) : null,
      after: entry.after !== undefined ? JSON.stringify(entry.after) : null,
    },
  });
}
