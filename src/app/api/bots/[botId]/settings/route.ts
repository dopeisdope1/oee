import { z } from "zod";
import { NextResponse } from "next/server";
import { updateBotIdentity } from "@/server/repositories/bots";
import { recordAudit } from "@/server/repositories/audit";
import { requireUserId, parseBody } from "@/server/api-helpers";

const patchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const body = await parseBody(req, patchSchema);
  if ("error" in body) return body.error;

  try {
    const updated = await updateBotIdentity(botId, body.data);
    await recordAudit({
      userId: auth.userId,
      botId,
      action: "bot.identity.update",
      after: body.data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Unknown bot" }, { status: 404 });
  }
}
