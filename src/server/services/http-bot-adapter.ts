import "server-only";
import type { DiscordBotService } from "./discord-bot-service";
import {
  BotBadResponseError,
  BotCapabilityMissingError,
  BotNotConfiguredError,
  BotUnauthorizedError,
  BotUnreachableError,
} from "./errors";
import type {
  BotRecord,
  BotStatus,
  Capability,
  Command,
  DateRange,
  Guild,
  GuildConfig,
  LogEntry,
  LogFilters,
  MessageTemplate,
  StatPoint,
  SystemState,
} from "@/types";

const REQUEST_TIMEOUT_MS = 8_000;

/** Every capability this adapter knows how to call, in the order declared
 * by the architecture doc's API contract (section 5). Used as the optimistic
 * fallback when a bot doesn't expose GET /capabilities yet — see
 * getCapabilities() below. */
const ALL_CAPABILITIES: Capability[] = [
  "status",
  "guilds",
  "guildConfig",
  "commands",
  "systems",
  "messages",
  "logs",
  "statistics",
  "restart",
];

/**
 * Default DiscordBotService implementation: talks to a bot's own small HTTP
 * API over the contract described in the architecture doc (GET/PATCH on
 * /status, /guilds, /commands, /systems, /messages, /logs, /statistics).
 *
 * Every 4xx/5xx and network failure is mapped to a typed error from
 * ./errors so callers (API routes, pages) can show an honest, specific
 * message instead of a generic failure or — worse — a fake success.
 */
export class HttpBotAdapter implements DiscordBotService {
  readonly botId: string;
  private readonly baseUrl: string;
  private readonly secret: string | undefined;
  private cachedCapabilities: Capability[] | null = null;

  constructor(private readonly bot: BotRecord) {
    this.botId = bot.id;
    this.baseUrl = bot.apiBaseUrl.replace(/\/$/, "");
    this.secret = process.env[bot.apiKeyRef];
  }

  private assertConfigured() {
    if (!this.baseUrl || !this.secret) {
      throw new BotNotConfiguredError(this.botId);
    }
  }

  private async request<T>(
    capability: Capability,
    path: string,
    init?: RequestInit
  ): Promise<T> {
    this.assertConfigured();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${this.secret}`,
          "Content-Type": "application/json",
          ...init?.headers,
        },
        cache: "no-store",
      });
    } catch (cause) {
      throw new BotUnreachableError(this.botId, cause);
    } finally {
      clearTimeout(timeout);
    }

    if (response.status === 401 || response.status === 403) {
      throw new BotUnauthorizedError(this.botId);
    }
    if (response.status === 404) {
      throw new BotCapabilityMissingError(this.botId, capability);
    }
    if (!response.ok) {
      throw new BotBadResponseError(
        this.botId,
        `HTTP ${response.status} from ${path}`
      );
    }
    if (response.status === 204) {
      return undefined as T;
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new BotBadResponseError(this.botId, `invalid JSON from ${path}`);
    }
  }

  /**
   * A bot may optionally expose GET /capabilities → { capabilities: string[] }
   * to declare what it has implemented. Most bots won't have this yet, so on
   * 404/network failure we fall back to assuming every capability *might*
   * work — the actual call will still fail honestly (as
   * BotCapabilityMissingError on a 404) if it doesn't. This means a bot
   * never needs the manifest endpoint just to be usable; it's an
   * optimization once one exists.
   */
  async getCapabilities(): Promise<Capability[]> {
    if (this.cachedCapabilities) return this.cachedCapabilities;
    try {
      const data = await this.request<{ capabilities: Capability[] }>(
        "status",
        "/capabilities"
      );
      this.cachedCapabilities = data.capabilities;
    } catch {
      this.cachedCapabilities = ALL_CAPABILITIES;
    }
    return this.cachedCapabilities;
  }

  async getStatus(): Promise<BotStatus> {
    return this.request<BotStatus>("status", "/status");
  }

  async getGuilds(): Promise<Guild[]> {
    return this.request<Guild[]>("guilds", "/guilds");
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig> {
    return this.request<GuildConfig>(
      "guildConfig",
      `/guilds/${encodeURIComponent(guildId)}/config`
    );
  }

  async updateGuildConfig(
    guildId: string,
    patch: Partial<Pick<GuildConfig, "prefix">>
  ): Promise<GuildConfig> {
    return this.request<GuildConfig>(
      "guildConfig",
      `/guilds/${encodeURIComponent(guildId)}/config`,
      { method: "PATCH", body: JSON.stringify(patch) }
    );
  }

  async getCommands(guildId?: string): Promise<Command[]> {
    const qs = guildId ? `?guildId=${encodeURIComponent(guildId)}` : "";
    return this.request<Command[]>("commands", `/commands${qs}`);
  }

  async setCommandEnabled(
    commandId: string,
    enabled: boolean,
    guildId?: string
  ): Promise<void> {
    await this.request<void>(
      "commands",
      `/commands/${encodeURIComponent(commandId)}`,
      { method: "PATCH", body: JSON.stringify({ enabled, guildId }) }
    );
  }

  async getSystems(guildId: string): Promise<SystemState[]> {
    // The bot's own payload only needs {key, label, description, icon,
    // category, enabled, config} — "available" is implicit (it's in the
    // list) and filled in here, not something the bot needs to know about.
    const raw = await this.request<Omit<SystemState, "available">[]>(
      "systems",
      `/systems/${encodeURIComponent(guildId)}`
    );
    return raw.map((item) => ({
      ...item,
      config: item.config ?? {},
      available: true,
    }));
  }

  async updateSystemConfig(
    guildId: string,
    systemKey: string,
    patch: { enabled?: boolean; config?: Record<string, unknown> }
  ): Promise<SystemState> {
    const saved = await this.request<Omit<SystemState, "available">>(
      "systems",
      `/systems/${encodeURIComponent(guildId)}/${encodeURIComponent(systemKey)}`,
      { method: "PATCH", body: JSON.stringify(patch) }
    );
    return { ...saved, config: saved.config ?? {}, available: true };
  }

  async getMessageTemplate(
    key: string,
    guildId?: string
  ): Promise<MessageTemplate> {
    const qs = guildId ? `?guildId=${encodeURIComponent(guildId)}` : "";
    return this.request<MessageTemplate>(
      "messages",
      `/messages/${encodeURIComponent(key)}${qs}`
    );
  }

  async updateMessageTemplate(
    key: string,
    patch: Partial<MessageTemplate>,
    guildId?: string
  ): Promise<MessageTemplate> {
    const qs = guildId ? `?guildId=${encodeURIComponent(guildId)}` : "";
    return this.request<MessageTemplate>(
      "messages",
      `/messages/${encodeURIComponent(key)}${qs}`,
      { method: "PATCH", body: JSON.stringify(patch) }
    );
  }

  async getLogs(filters: LogFilters): Promise<LogEntry[]> {
    const params = new URLSearchParams();
    if (filters.guildId) params.set("guildId", filters.guildId);
    if (filters.type) params.set("type", filters.type);
    if (filters.level) params.set("level", filters.level);
    if (filters.search) params.set("search", filters.search);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return this.request<LogEntry[]>("logs", `/logs${qs ? `?${qs}` : ""}`);
  }

  async getStatistics(metric: string, range: DateRange): Promise<StatPoint[]> {
    const params = new URLSearchParams({
      metric,
      from: range.from,
      to: range.to,
    });
    return this.request<StatPoint[]>(
      "statistics",
      `/statistics?${params.toString()}`
    );
  }

  async restartBot(): Promise<void> {
    await this.request<void>("restart", "/restart", { method: "POST" });
  }
}
