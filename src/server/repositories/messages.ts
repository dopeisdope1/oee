import "server-only";
import { prisma } from "@/lib/prisma";
import type { MessageTemplate } from "@/types";

// A compound-unique index with a nullable column doesn't reliably enforce
// uniqueness across databases (NULL <> NULL in SQL). We use "" internally as
// the "bot-wide default" sentinel instead of null, and only translate at
// this module's boundary — everything outside sees guildId: string | null,
// matching the architecture doc's MessageTemplate shape.
const DEFAULT_SENTINEL = "";
const toDb = (guildId: string | null) => guildId ?? DEFAULT_SENTINEL;
const fromDb = (guildId: string) =>
  guildId === DEFAULT_SENTINEL ? null : guildId;

export async function getMessageTemplate(
  botId: string,
  key: string,
  guildId: string | null
): Promise<MessageTemplate | null> {
  const template = await prisma.messageTemplate.findUnique({
    where: { botId_guildId_key: { botId, guildId: toDb(guildId), key } },
  });
  if (!template) return null;
  return toDTO(template);
}

export async function upsertMessageTemplate(
  botId: string,
  key: string,
  guildId: string | null,
  patch: Partial<MessageTemplate>
): Promise<MessageTemplate> {
  const data = {
    title: patch.title,
    description: patch.description,
    color: patch.color,
    imageUrl: patch.imageUrl,
    thumbnailUrl: patch.thumbnailUrl,
    footer: patch.footer,
    buttons: patch.buttons ? JSON.stringify(patch.buttons) : undefined,
  };
  const dbGuildId = toDb(guildId);
  const template = await prisma.messageTemplate.upsert({
    where: { botId_guildId_key: { botId, guildId: dbGuildId, key } },
    create: { botId, guildId: dbGuildId, key, ...data },
    update: data,
  });
  return toDTO(template);
}

function toDTO(template: {
  key: string;
  guildId: string;
  title: string | null;
  description: string | null;
  color: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  footer: string | null;
  buttons: string;
  updatedAt: Date;
}): MessageTemplate {
  return {
    key: template.key,
    guildId: fromDb(template.guildId),
    title: template.title,
    description: template.description,
    color: template.color,
    imageUrl: template.imageUrl,
    thumbnailUrl: template.thumbnailUrl,
    footer: template.footer,
    buttons: safeParseButtons(template.buttons),
    updatedAt: template.updatedAt.toISOString(),
  };
}

function safeParseButtons(
  json: string
): MessageTemplate["buttons"] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
