import { z } from "zod";
import { NextResponse } from "next/server";
import { getBotService } from "@/server/services/registry";
import { recordAudit } from "@/server/repositories/audit";
import { requireUserId, parseBody, withBotErrors } from "@/server/api-helpers";

// "Permissions & règles" — GET/PATCH proxy to the bot's own utils/
// commandRules.js (its GET/PATCH /commands/:name/rules?guildId=). The panel
// never stores its own copy of a rule: this route is a thin, audited pass-
// through, same principle as the command enable/disable route right next
// to it (that one's comment explains why — the bot is always the live
// source of truth, never a cached DB row).
const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.enum([
      "toggleAllowedRole",
      "toggleDeniedRole",
      "toggleAllowedUser",
      "toggleDeniedUser",
      "toggleAllowedChannel",
      "toggleDeniedChannel",
    ]),
    id: z.string().min(1),
  }),
  z.object({ action: z.literal("setCooldown"), seconds: z.number().int().min(0).max(86_400).nullable() }),
  z.object({ action: z.literal("reset") }),
]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  const { botId, commandId } = await params;
  const guildId = new URL(req.url).searchParams.get("guildId");
  if (!guildId) {
    return NextResponse.json({ error: "guildId query param is required" }, { status: 400 });
  }

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const service = await getBotService(botId);
  if (!service) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  return withBotErrors(() => service.getCommandRule(commandId, guildId));
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string; commandId: string }> }
) {
  const { botId, commandId } = await params;
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
    const updated = await service.updateCommandRule(commandId, guildId, body.data);
    await recordAudit({
      userId: auth.userId,
      botId,
      guildId,
      action: `command.${commandId}.rules.${body.data.action}`,
      after: body.data,
    });
    return updated;
  });
}
