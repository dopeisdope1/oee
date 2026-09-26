import { z } from "zod";
import { NextResponse } from "next/server";
import { getBotService } from "@/server/services/registry";
import { upsertGuild, upsertGuildConfig } from "@/server/repositories/guilds";
import { recordAudit } from "@/server/repositories/audit";
import { requireUserId, parseBody, withBotErrors } from "@/server/api-helpers";

const patchSchema = z.object({ prefix: z.string().max(10).nullable() });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string; guildId: string }> }
) {
  const { botId, guildId } = await params;

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await parseBody(req, patchSchema);
  if ("error" in body) return body.error;

  const service = await getBotService(botId);
  if (!service) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  return withBotErrors(async () => {
    // Ensure the Guild row exists (FK target for GuildConfig) — a direct
    // link to this page skips the servers list page's own mirroring.
    const guilds = await service.getGuilds().catch(() => []);
    const guild = guilds.find((g) => g.id === guildId);
    if (guild) await upsertGuild(botId, guild);

    const before = await service.getGuildConfig(guildId).catch(() => null);
    const updated = await service.updateGuildConfig(guildId, { prefix: body.data.prefix });
    await upsertGuildConfig(botId, guildId, updated, auth.userId);
    await recordAudit({
      userId: auth.userId,
      botId,
      guildId,
      action: "guild_config.update",
      before,
      after: updated,
    });
    return updated;
  });
}
