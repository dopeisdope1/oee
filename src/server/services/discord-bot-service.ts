import type {
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

/**
 * The one interface every bot integration implements. No UI component and no
 * API route talks to a bot directly — they all go through this. If a bot's
 * own API changes shape later, only its adapter needs to change.
 *
 * See HttpBotAdapter for the default implementation, and getBotService for
 * how an instance is obtained for a given bot id.
 */
export interface DiscordBotService {
  readonly botId: string;

  /** Which of these methods this bot's API actually implements today. */
  getCapabilities(): Promise<Capability[]>;

  getStatus(): Promise<BotStatus>;
  getGuilds(): Promise<Guild[]>;
  getGuildConfig(guildId: string): Promise<GuildConfig>;
  updateGuildConfig(
    guildId: string,
    patch: Partial<Pick<GuildConfig, "prefix">>
  ): Promise<GuildConfig>;

  getCommands(guildId?: string): Promise<Command[]>;
  setCommandEnabled(
    commandId: string,
    enabled: boolean,
    guildId?: string
  ): Promise<void>;

  getSystems(guildId: string): Promise<SystemState[]>;
  updateSystemConfig(
    guildId: string,
    systemKey: string,
    patch: { enabled?: boolean; config?: Record<string, unknown> }
  ): Promise<SystemState>;

  getMessageTemplate(key: string, guildId?: string): Promise<MessageTemplate>;
  updateMessageTemplate(
    key: string,
    patch: Partial<MessageTemplate>,
    guildId?: string
  ): Promise<MessageTemplate>;

  getLogs(filters: LogFilters): Promise<LogEntry[]>;
  getStatistics(metric: string, range: DateRange): Promise<StatPoint[]>;

  restartBot?(): Promise<void>;
}
