// Seeds the 4 bots (from env vars) and a starter Systems catalog.
//
// Run with: npm run db:seed
//
// This does NOT invent bot data (guilds, commands, statuses) — only the
// panel's own config rows: which bots exist and where to find their APIs.
// Guilds, commands and status are always fetched live through
// DiscordBotService; nothing here is presented to the UI as bot data.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface BotSeed {
  id: string;
  name: string;
  avatarUrl: string | null;
  apiBaseUrl: string;
  apiKeyRef: string;
}

// The same generic feature catalog is seeded for all 4 bots as a starting
// point — see architecture doc, open question #7: confirm per bot which of
// these (if any) actually exist before relying on it. Adjust freely; this
// is config, not bot code.
const DEFAULT_SYSTEMS = [
  { key: "welcome", label: "Welcome Message", icon: "hand", category: "Engagement", description: "Send a custom message when a member joins." },
  { key: "goodbye", label: "Goodbye Message", icon: "door-open", category: "Engagement", description: "Send a message when a member leaves." },
  { key: "automod", label: "Auto-Moderation", icon: "shield", category: "Moderation", description: "Automatically detect and act on banned words, spam and links." },
  { key: "server_logs", label: "Server Logs", icon: "scroll", category: "Moderation", description: "Log member joins, leaves, bans, message edits and deletes." },
  { key: "autorole", label: "Auto Role", icon: "badge", category: "Engagement", description: "Automatically give a role when a member joins." },
  { key: "giveaway", label: "Giveaway", icon: "gift", category: "Engagement", description: "Run giveaways with a giveaway command." },
  { key: "polls", label: "Polls", icon: "bar-chart", category: "Engagement", description: "Create polls for members to vote on." },
  { key: "tickets", label: "Support Tickets", icon: "ticket", category: "Support", description: "Let members open private support tickets." },
  { key: "moderation", label: "Moderation", icon: "gavel", category: "Moderation", description: "Ban, kick, mute and warn commands with logging." },
  { key: "server_info", label: "Server Info", icon: "info", category: "Utility", description: "Server, user and avatar info commands." },
  { key: "anti_spam", label: "Anti-Spam", icon: "shield-alert", category: "Security", description: "Rate-limit and act on repeated or flooding messages." },
  { key: "anti_raid", label: "Anti-Raid", icon: "shield-x", category: "Security", description: "Detect and slow down mass-join raids." },
  { key: "anti_link", label: "Anti-Link", icon: "link-2-off", category: "Security", description: "Block unapproved links from being posted." },
  { key: "verification", label: "Verification", icon: "check-circle", category: "Security", description: "Require members to verify before accessing the server." },
];

function botFromEnv(index: number): BotSeed | null {
  const prefix = `BOT_${index}_`;
  const name = process.env[`${prefix}NAME`];
  if (!name) return null; // no config for this slot — skip, don't invent one

  return {
    id: process.env[`${prefix}ID`] ?? `bot-${index}`,
    name,
    avatarUrl: process.env[`${prefix}AVATAR_URL`] ?? null,
    apiBaseUrl: process.env[`${prefix}API_URL`] ?? "",
    apiKeyRef: `${prefix}API_KEY`,
  };
}

async function main() {
  const bots = [1, 2, 3, 4].map(botFromEnv).filter((b): b is BotSeed => !!b);

  if (bots.length === 0) {
    console.warn(
      "No BOT_n_NAME env vars set — nothing to seed. Copy .env.example to " +
        ".env and fill in at least BOT_1_NAME (and ideally BOT_1_API_URL) " +
        "before seeding."
    );
    return;
  }

  for (const bot of bots) {
    await prisma.bot.upsert({
      where: { id: bot.id },
      create: bot,
      update: bot,
    });

    for (const system of DEFAULT_SYSTEMS) {
      await prisma.systemDefinition.upsert({
        where: { botId_key: { botId: bot.id, key: system.key } },
        create: { botId: bot.id, ...system },
        update: system,
      });
    }

    console.log(
      `Seeded ${bot.name} (${bot.id})${
        bot.apiBaseUrl ? "" : " — no API URL yet, will show as not configured"
      }`
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
