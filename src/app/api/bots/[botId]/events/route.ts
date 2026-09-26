import { z } from "zod";
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { getBotRecord, writeStatusCache } from "@/server/repositories/bots";
import { insertLogEntry } from "@/server/repositories/logs";
import { insertStatSnapshot } from "@/server/repositories/stats";
import { prisma } from "@/lib/prisma";

/**
 * Bots push events here instead of the panel polling them. Each bot signs
 * its own request body with HMAC-SHA256 using the same shared secret the
 * panel uses to call that bot's API (env var named by Bot.apiKeyRef) — see
 * .env.example. This route is excluded from session auth in proxy.ts since
 * bots have no browser session; the signature is the auth here.
 *
 * Body shape: { type: "status" | "log" | "stat", data: {...} }
 */
const eventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("status"),
    data: z.object({
      state: z.enum(["online", "connecting", "offline", "unknown"]),
      latencyMs: z.number().nullable().optional(),
      uptimeSeconds: z.number().nullable().optional(),
      guildCount: z.number().nullable().optional(),
    }),
  }),
  z.object({
    type: z.literal("log"),
    data: z.object({
      guildId: z.string().nullable().optional(),
      level: z.enum(["info", "warn", "error"]),
      logType: z.enum([
        "command",
        "error",
        "event",
        "config_change",
        "startup",
        "shutdown",
      ]),
      message: z.string(),
      metadata: z.record(z.string(), z.unknown()).optional(),
      createdAt: z.string().optional(),
    }),
  }),
  z.object({
    type: z.literal("stat"),
    data: z.object({
      guildId: z.string().nullable().optional(),
      metric: z.enum(["guild_count", "member_count", "command_usage", "error_count"]),
      value: z.number(),
      capturedAt: z.string().optional(),
    }),
  }),
]);

function verifySignature(secret: string, rawBody: string, signature: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params;

  const bot = await getBotRecord(botId);
  if (!bot) return NextResponse.json({ error: "Unknown bot" }, { status: 404 });

  const secret = process.env[bot.apiKeyRef];
  if (!secret) {
    return NextResponse.json(
      { error: "Bot has no API key configured on the panel side" },
      { status: 409 }
    );
  }

  const signature = req.headers.get("x-signature");
  const rawBody = await req.text();
  if (!signature || !verifySignature(secret, rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const result = eventSchema.safeParse(json);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid event payload", issues: result.error.issues },
      { status: 400 }
    );
  }

  const event = result.data;

  switch (event.type) {
    case "status": {
      await writeStatusCache(botId, {
        state: event.data.state,
        latencyMs: event.data.latencyMs ?? null,
        uptimeSeconds: event.data.uptimeSeconds ?? null,
        guildCount: event.data.guildCount ?? null,
      });
      break;
    }
    case "log": {
      const { guildId, logType, ...rest } = event.data;
      await insertLogEntryTolerant(botId, guildId ?? null, {
        ...rest,
        type: logType,
        guildId: guildId ?? null,
        metadata: rest.metadata ?? {},
      });
      break;
    }
    case "stat": {
      await insertStatSnapshot(
        botId,
        event.data.guildId ?? null,
        event.data.metric,
        event.data.value,
        event.data.capturedAt
      );
      break;
    }
  }

  return NextResponse.json({ ok: true });
}

/** LogEntry.guildId is FK'd to Guild — a bot may report an event for a guild
 * the panel hasn't mirrored yet. Rather than dropping the event or failing
 * the whole request, we fall back to recording it without a guild link. */
async function insertLogEntryTolerant(
  botId: string,
  guildId: string | null,
  entry: Parameters<typeof insertLogEntry>[1]
) {
  try {
    await insertLogEntry(botId, entry);
  } catch {
    if (guildId) {
      const exists = await prisma.guild.findUnique({ where: { id: guildId } });
      if (!exists) {
        await insertLogEntry(botId, { ...entry, guildId: null });
        return;
      }
    }
    throw new Error("Failed to record log entry from webhook");
  }
}
