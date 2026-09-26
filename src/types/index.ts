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

export type StatMetric =
  | "guild_count"
  | "member_count"
  | "command_usage"
  | "error_count";

export interface StatPoint {
  metric: StatMetric;
  value: number;
  capturedAt: string;
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
