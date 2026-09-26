import { z } from "zod";
import { NextResponse } from "next/server";
import { getBotService } from "@/server/services/registry";
import { upsertGuild } from "@/server/repositories/guilds";
import { upsertSystemConfig } from "@/server/repositories/systems";
import { recordAudit } from "@/server/repositories/audit";
import { requireUserId, parseBody, withBotErrors } from "@/server/api-helpers";

const patchSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string; systemKey: string }> }
) {
  const { botId, systemKey } = await params;
  const guildId = new URL(req.url).searchParams.get("guildId");
  if (!guildId) {
    return NextResponse.json({ error: "guildId query param is required" }, { status: 400 });
  }

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await parseBody(req, patchSchema);
  if ("error" in body) return body.error;

  const service = await getBotService(botId);
  if (!service) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  return withBotErrors(async () => {
    const guilds = await service.getGuilds().catch(() => []);
    const guild = guilds.find((g) => g.id === guildId);
    if (guild) await upsertGuild(botId, guild);

    const updated = await service.updateSystemConfig(guildId, systemKey, body.data);
    await upsertSystemConfig(botId, guildId, systemKey, body.data, auth.userId);
    await recordAudit({
      userId: auth.userId,
      botId,
      guildId,
      action: `system.${systemKey}.update`,
      after: updated,
    });
    return updated;
  });
}
