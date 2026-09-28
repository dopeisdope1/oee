// Shared types used across the service layer, API routes and UI.
// These describe the panel's own view of a bot's data — the shape every
// bot adapter (real or otherwise) must normalize its responses into.

export type BotState = "online" | "connecting" | "offline" | "unknown";

export interface BotStatus {
  state: BotState;
  latencyMs: number | null;
  uptimeSeconds: number | null;
  guildCount: number | null;
  lastCheckedAt: string | null; // ISO date, null if never successfully checked
}

export interface BotSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  configured: boolean; // false if no apiBaseUrl has been set for this bot yet
  status: BotStatus;
  commandCount: number | null;
  activeSystemCount: number | null;
}

export interface Guild {
  id: string;
  name: string;
  iconUrl: string | null;
  memberCount: number | null;
  ownerDiscordId: string | null;
  addedAt: string | null;
}

export interface GuildConfig {
  guildId: string;
  prefix: string | null;
  updatedAt: string | null;
}

export interface SystemDefinition {
  key: string;
  label: string;
  description: string;
  icon: string;
  category: string | null;
}

export interface SystemState extends SystemDefinition {
  enabled: boolean;
  config: Record<string, unknown>;
  updatedAt: string | null;
  /** false if this bot has not implemented this system's endpoints yet */
  available: boolean;
}

export interface Command {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  permissions: string | null;
  enabledGlobally: boolean;
  /** per-guild override, only present when a guildId was supplied to the query */
  enabledForGuild?: boolean;
}

export interface GuildRole {
  id: string;
  name: string;
  color: string; // hex, e.g. "#5865f2"
  position: number;
  managed: boolean; // true = bot/integration role, can't be manually assigned
  memberCount: number;
}

export type GuildChannelType = number; // raw discord.js ChannelType

export interface GuildChannel {
  id: string;
  name: string;
  type: GuildChannelType;
  parentId: string | null;
}

/**
 * Per-command, per-guild permission rule — the bot's own utils/
 * commandRules.js is the single source of truth (see architecture doc §5b);
 * this type mirrors it exactly, never a second schema.
 */
export interface CommandRule {
  allowedRoles: string[];
  deniedRoles: string[];
  allowedUsers: string[];
  deniedUsers: string[];
  allowedChannels: string[];
  deniedChannels: string[];
  cooldownSeconds: number | null;
  updatedAt: string | null;
}

/** One (add/remove) action against a CommandRule's list fields, or a cooldown/reset action —
 * mirrors exactly the action vocabulary utils/apiServer.js accepts, never invents a new shape. */
export type CommandRuleAction =
  | { action: "toggleAllowedRole" | "toggleDeniedRole" | "toggleAllowedUser" | "toggleDeniedUser" | "toggleAllowedChannel" | "toggleDeniedChannel"; id: string }
  | { action: "setCooldown"; seconds: number | null }
  | { action: "reset" };

export interface MessageTemplate {
  key: string;
  guildId: string | null;
  title: string | null;
  description: string | null;
  color: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  footer: string | null;
  buttons: { label: string; url?: string; customId?: string }[];
  updatedAt: string | null;
}

export type LogLevel = "info" | "warn" | "error";
export type LogType =
  | "command"
  | "error"
  | "event"
  | "config_change"
  | "startup"
  | "shutdown";

export interface LogEntry {
  id: string;
  guildId: string | null;
  level: LogLevel;
  type: LogType;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LogFilters {
  guildId?: string;
  type?: LogType;
  level?: LogLevel;
  search?: string;
  from?: string;
  to?: string;
  limit?: number;
}

// Known, built-in metrics stay auto-completable, but the union stays open
// (the `string & {}` trick) so a bot can declare its own real metrics via
// GET /statistics/metrics without the panel's type needing to know about
// them in advance — see StatMetricDefinition and getAvailableMetrics.
export type StatMetric =
  | "guild_count"
  | "member_count"
  | "command_usage"
  | "error_count"
  | (string & {});

export interface StatPoint {
  metric: StatMetric;
  value: number;
  capturedAt: string;
}

/** One metric a bot declares it can report, with a human label for the UI. */
export interface StatMetricDefinition {
  metric: StatMetric;
  title: string;
  unit?: string;
}

export interface DateRange {
  from: string;
  to: string;
}

/**
 * One entry per DiscordBotService method a bot adapter actually implements.
 * The UI consults this before rendering a section, instead of guessing from
 * a failed request, so a bot that hasn't been wired up for e.g. statistics
 * shows an honest "not available yet" instead of an error or fake chart.
 */
export type Capability =
  | "status"
  | "guilds"
  | "guildConfig"
  | "commands"
  | "commandRules"
  | "roles"
  | "channels"
  | "systems"
  | "messages"
  | "logs"
  | "statistics"
  | "restart";

export interface BotRecord {
  id: string;
  name: string;
  avatarUrl: string | null;
  apiBaseUrl: string;
  apiKeyRef: string;
}
