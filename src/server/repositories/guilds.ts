import "server-only";
import { prisma } from "@/lib/prisma";
import type { Guild as GuildDTO, GuildConfig } from "@/types";

export async function listGuilds(botId: string): Promise<GuildDTO[]> {
  const guilds = await prisma.guild.findMany({
    where: { botId },
    orderBy: { name: "asc" },
  });
  return guilds.map(toGuildDTO);
}

export async function getGuild(
  botId: string,
  guildId: string
): Promise<GuildDTO | null> {
  const guild = await prisma.guild.findFirst({ where: { botId, id: guildId } });
  return guild ? toGuildDTO(guild) : null;
}

/** Mirrors a guild the bot reported into the panel's light cache. */
export async function upsertGuild(
  botId: string,
  guild: GuildDTO
): Promise<void> {
  await prisma.guild.upsert({
    where: { id: guild.id },
    create: {
      id: guild.id,
      botId,
      name: guild.name,
      iconUrl: guild.iconUrl,
      memberCount: guild.memberCount,
      ownerDiscordId: guild.ownerDiscordId,
      addedAt: guild.addedAt ? new Date(guild.addedAt) : null,
    },
    update: {
      name: guild.name,
      iconUrl: guild.iconUrl,
      memberCount: guild.memberCount,
      ownerDiscordId: guild.ownerDiscordId,
    },
  });
}

export async function getGuildConfig(
  guildId: string
): Promise<GuildConfig | null> {
  const config = await prisma.guildConfig.findUnique({ where: { guildId } });
  if (!config) return null;
  return {
    guildId: config.guildId,
    prefix: config.prefix,
    updatedAt: config.updatedAt.toISOString(),
  };
}

export async function upsertGuildConfig(
  botId: string,
  guildId: string,
  patch: Partial<Pick<GuildConfig, "prefix">>,
  updatedById: string | null
): Promise<GuildConfig> {
  const config = await prisma.guildConfig.upsert({
    where: { guildId },
    create: { botId, guildId, prefix: patch.prefix ?? null, updatedById },
    update: { prefix: patch.prefix, updatedById },
  });
  return {
    guildId: config.guildId,
    prefix: config.prefix,
    updatedAt: config.updatedAt.toISOString(),
  };
}

function toGuildDTO(guild: {
  id: string;
  name: string;
  iconUrl: string | null;
  memberCount: number | null;
  ownerDiscordId: string | null;
  addedAt: Date | null;
}): GuildDTO {
  return {
    id: guild.id,
    name: guild.name,
    iconUrl: guild.iconUrl,
    memberCount: guild.memberCount,
    ownerDiscordId: guild.ownerDiscordId,
    addedAt: guild.addedAt ? guild.addedAt.toISOString() : null,
  };
}
