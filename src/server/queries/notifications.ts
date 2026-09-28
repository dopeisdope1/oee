import "server-only";
import { prisma } from "@/lib/prisma";
import type { BotSummary } from "@/types";

export interface NotificationItem {
  id: string;
  severity: "warning" | "danger";
  title: string;
  description: string;
  href: string;
  createdAt: string;
}

/**
 * Real signals only — a bot's cached status (already tracked for the
 * sidebar/dashboard) and its own recent error-level log entries (pushed via
 * the events webhook, see README's "bot API contract"). Never a synthetic
 * "everything's fine" or a fabricated count.
 *
 * Takes `bots` from the caller instead of fetching its own copy: the app
 * layout already loads listBotSummaries() for the sidebar on every
 * navigation — a second identical query here would just double that cost
 * for no reason.
 */
export async function listNotifications(bots: BotSummary[]): Promise<NotificationItem[]> {
  const offline: NotificationItem[] = bots
    .filter((b) => b.configured && (b.status.state === "offline" || b.status.state === "unknown"))
    .map((b) => ({
      id: `bot-offline-${b.id}`,
      severity: "danger",
      title: `${b.name} hors ligne`,
      description: b.status.lastCheckedAt
        ? `Dernière vérification réussie il y a un moment.`
        : "Jamais signalé en ligne depuis que ce bot a été configuré.",
      href: `/bots/${b.id}/overview`,
      createdAt: b.status.lastCheckedAt ?? new Date(0).toISOString(),
    }));

  const errorLogs = await prisma.logEntry.findMany({
    where: { level: "error" },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { bot: { select: { name: true } } },
  });

  const errors: NotificationItem[] = errorLogs.map((e) => ({
    id: `log-${e.id}`,
    severity: "warning",
    title: `Erreur — ${e.bot.name}`,
    description: e.message,
    href: `/bots/${e.botId}/logs`,
    createdAt: e.createdAt.toISOString(),
  }));

  return [...offline, ...errors].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
