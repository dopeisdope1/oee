import { z } from "zod";
import { NextResponse } from "next/server";
import { getBotService } from "@/server/services/registry";
import { upsertMessageTemplate } from "@/server/repositories/messages";
import { recordAudit } from "@/server/repositories/audit";
import { requireUserId, parseBody, withBotErrors } from "@/server/api-helpers";

const patchSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  thumbnailUrl: z.string().nullable().optional(),
  footer: z.string().nullable().optional(),
  buttons: z
    .array(z.object({ label: z.string(), url: z.string().optional(), customId: z.string().optional() }))
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string; key: string }> }
) {
  const { botId, key } = await params;
  const guildId = new URL(req.url).searchParams.get("guildId") ?? undefined;

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await parseBody(req, patchSchema);
  if ("error" in body) return body.error;

  const service = await getBotService(botId);
  if (!service) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  return withBotErrors(async () => {
    const updated = await service.updateMessageTemplate(key, body.data, guildId);
    await upsertMessageTemplate(botId, key, guildId ?? null, updated);
    await recordAudit({
      userId: auth.userId,
      botId,
      guildId: guildId ?? null,
      action: `message.${key}.update`,
      after: updated,
    });
    return updated;
  });
}
