import { z } from "zod";
import { NextResponse } from "next/server";
import { getBotService } from "@/server/services/registry";
import { upsertGuild } from "@/server/repositories/guilds";
import { setCommandOverride } from "@/server/repositories/commands";
import { recordAudit } from "@/server/repositories/audit";
import { requireUserId, parseBody, withBotErrors } from "@/server/api-helpers";

const patchSchema = z.object({ enabled: z.boolean() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  const { botId, commandId } = await params;
  const guildId = new URL(req.url).searchParams.get("guildId") ?? undefined;

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await parseBody(req, patchSchema);
  if ("error" in body) return body.error;

  const service = await getBotService(botId);
  if (!service) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  return withBotErrors(async () => {
    if (guildId) {
      const guilds = await service.getGuilds().catch(() => []);
      const guild = guilds.find((g) => g.id === guildId);
      if (guild) await upsertGuild(botId, guild);
    }

    await service.setCommandEnabled(commandId, body.data.enabled, guildId);
    if (guildId) {
      await setCommandOverride(commandId, guildId, body.data.enabled);
    }
    await recordAudit({
      userId: auth.userId,
      botId,
      guildId: guildId ?? null,
      action: "command.toggle",
      after: { commandId, enabled: body.data.enabled },
    });
    return { ok: true };
  });
}
