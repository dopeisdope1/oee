import "server-only";
import { prisma } from "@/lib/prisma";
import type { LogEntry, LogFilters } from "@/types";

export async function insertLogEntry(
  botId: string,
  entry: Omit<LogEntry, "id" | "createdAt"> & { createdAt?: string }
): Promise<void> {
  await prisma.logEntry.create({
    data: {
      botId,
      guildId: entry.guildId,
      level: entry.level,
      type: entry.type,
      message: entry.message,
      metadata: JSON.stringify(entry.metadata ?? {}),
      createdAt: entry.createdAt ? new Date(entry.createdAt) : undefined,
    },
  });
}

export async function queryLogs(
  botId: string,
  filters: LogFilters
): Promise<LogEntry[]> {
  const entries = await prisma.logEntry.findMany({
    where: {
      botId,
      guildId: filters.guildId,
      type: filters.type,
      level: filters.level,
      message: filters.search
        ? { contains: filters.search }
        : undefined,
      createdAt: {
        gte: filters.from ? new Date(filters.from) : undefined,
        lte: filters.to ? new Date(filters.to) : undefined,
      },
    },
    orderBy: { createdAt: "desc" },
    take: filters.limit ?? 100,
  });

  return entries.map((e) => ({
    id: e.id,
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
