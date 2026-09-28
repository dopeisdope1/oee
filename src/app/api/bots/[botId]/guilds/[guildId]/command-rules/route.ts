import { NextResponse } from "next/server";
import { getBotService } from "@/server/services/registry";
import { requireUserId, withBotErrors } from "@/server/api-helpers";

/** Every command's rule for this guild in one call — powers the Roles page. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ botId: string; guildId: string }> }
) {
  const { botId, guildId } = await params;

  const auth = await requireUserId();
  if ("error" in auth) return auth.error;

  const service = await getBotService(botId);
  if (!service) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  return withBotErrors(() => service.getAllCommandRules(guildId));
}
