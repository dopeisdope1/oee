import "server-only";
import { prisma } from "@/lib/prisma";
import type { SystemDefinition, SystemState } from "@/types";

export async function listSystemDefinitions(
  botId: string
): Promise<SystemDefinition[]> {
  const defs = await prisma.systemDefinition.findMany({
    where: { botId },
    orderBy: { label: "asc" },
  });
  return defs.map((d) => ({
    key: d.key,
    label: d.label,
    description: d.description,
    icon: d.icon,
    category: d.category,
  }));
}

export async function seedSystemDefinition(
  botId: string,
  def: SystemDefinition
): Promise<void> {
  await prisma.systemDefinition.upsert({
    where: { botId_key: { botId, key: def.key } },
    create: { botId, ...def },
    update: { ...def },
  });
}

/** Merges the bot's declared systems with this guild's saved state. A
 * system with no saved row yet is reported disabled, not omitted — the
 * catalog entry always exists once seeded for the bot. */
export async function getSystemStates(
  botId: string,
  guildId: string
): Promise<Omit<SystemState, "available">[]> {
  const [definitions, configs] = await Promise.all([
    listSystemDefinitions(botId),
    prisma.systemConfig.findMany({ where: { botId, guildId } }),
  ]);

  const byKey = new Map(configs.map((c) => [c.systemKey, c]));

  return definitions.map((def) => {
    const saved = byKey.get(def.key);
    return {
      ...def,
      enabled: saved?.enabled ?? false,
      config: saved ? safeParse(saved.config) : {},
      updatedAt: saved ? saved.updatedAt.toISOString() : null,
    };
  });
}

export async function upsertSystemConfig(
  botId: string,
  guildId: string,
  systemKey: string,
  patch: { enabled?: boolean; config?: Record<string, unknown> },
  updatedById: string | null
): Promise<Omit<SystemState, "available">> {
  const existing = await prisma.systemConfig.findUnique({
    where: { guildId_systemKey: { guildId, systemKey } },
  });
  const mergedConfig = {
    ...(existing ? safeParse(existing.config) : {}),
    ...(patch.config ?? {}),
  };

  const saved = await prisma.systemConfig.upsert({
    where: { guildId_systemKey: { guildId, systemKey } },
    create: {
      botId,
      guildId,
      systemKey,
      enabled: patch.enabled ?? false,
      config: JSON.stringify(mergedConfig),
      updatedById,
    },
    update: {
      enabled: patch.enabled ?? existing?.enabled ?? false,
      config: JSON.stringify(mergedConfig),
      updatedById,
    },
  });

  const def = await prisma.systemDefinition.findUnique({
    where: { botId_key: { botId, key: systemKey } },
  });

  return {
    key: systemKey,
    label: def?.label ?? systemKey,
    description: def?.description ?? "",
    icon: def?.icon ?? "settings",
    category: def?.category ?? null,
    enabled: saved.enabled,
    config: safeParse(saved.config),
    updatedAt: saved.updatedAt.toISOString(),
  };
}

function safeParse(json: string): Record<string, unknown> {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}
