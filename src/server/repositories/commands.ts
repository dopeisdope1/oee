import "server-only";
import { prisma } from "@/lib/prisma";
import type { Command } from "@/types";

export async function listCommands(
  botId: string,
  guildId?: string
): Promise<Command[]> {
  // `include` always has the same shape (never a conditional object vs.
  // undefined) so Prisma can infer a single, non-union result type — a
  // conditional include here made `c.overrides` collapse to `unknown`.
  // Filtering on a guildId that can never match ("") when none was passed
  // is equivalent to not including overrides at all.
  const commands = await prisma.command.findMany({
    where: { botId },
    orderBy: { name: "asc" },
    include: { overrides: { where: { guildId: guildId ?? "" } } },
  });

  return commands.map((c) => {
    const override = c.overrides[0];
    return {
      id: c.id,
      name: c.name,
      category: c.category,
      description: c.description,
      permissions: c.permissions,
      enabledGlobally: c.enabledGlobally,
      ...(guildId
        ? { enabledForGuild: override?.enabled ?? c.enabledGlobally }
        : {}),
    };
  });
}

export async function seedCommand(
  botId: string,
  command: Omit<Command, "id" | "enabledForGuild">
): Promise<void> {
  await prisma.command.upsert({
    where: { botId_name: { botId, name: command.name } },
    create: { botId, ...command },
    update: { ...command },
  });
}

export async function setCommandOverride(
  commandId: string,
  guildId: string,
  enabled: boolean
): Promise<void> {
  await prisma.commandGuildOverride.upsert({
    where: { commandId_guildId: { commandId, guildId } },
    create: { commandId, guildId, enabled },
    update: { enabled },
  });
}
