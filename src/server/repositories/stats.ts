import "server-only";
import { prisma } from "@/lib/prisma";
import type { DateRange, StatMetric, StatPoint } from "@/types";

export async function insertStatSnapshot(
  botId: string,
  guildId: string | null,
  metric: StatMetric,
  value: number,
  capturedAt?: string
): Promise<void> {
  await prisma.statSnapshot.create({
    data: {
      botId,
      guildId,
      metric,
      value,
      capturedAt: capturedAt ? new Date(capturedAt) : undefined,
    },
  });
}

export async function queryStats(
  botId: string,
  metric: string,
  range: DateRange,
  guildId?: string
): Promise<StatPoint[]> {
  const points = await prisma.statSnapshot.findMany({
    where: {
      botId,
      metric,
      guildId,
      capturedAt: { gte: new Date(range.from), lte: new Date(range.to) },
    },
    orderBy: { capturedAt: "asc" },
  });
  return points.map((p) => ({
    metric: p.metric as StatMetric,
    value: p.value,
    capturedAt: p.capturedAt.toISOString(),
  }));
}
