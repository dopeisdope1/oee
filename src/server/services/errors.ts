// Typed errors for the bot service layer. API routes and pages catch these
// specifically so the UI can show an honest, specific message instead of a
// generic failure — and never silently pretend an action succeeded.

export class BotServiceError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "not_configured"
      | "not_capable"
      | "offline"
      | "unauthorized"
      | "network_error"
      | "bad_response"
  ) {
    super(message);
    this.name = "BotServiceError";
  }
}

/** The Bot row has no apiBaseUrl / apiKeyRef set up yet — nothing to call. */
export class BotNotConfiguredError extends BotServiceError {
  constructor(botId: string) {
    super(`Bot "${botId}" has no API configured yet.`, "not_configured");
  }
}

/** This bot's adapter does not implement the requested capability yet. */
export class BotCapabilityMissingError extends BotServiceError {
  constructor(botId: string, capability: string) {
    super(
      `Bot "${botId}" does not expose "${capability}" yet.`,
      "not_capable"
    );
  }
}

/** The bot's API could not be reached at all (down, network, DNS, timeout). */
export class BotUnreachableError extends BotServiceError {
  constructor(botId: string, cause?: unknown) {
    super(`Bot "${botId}" is unreachable.`, "offline");
    if (cause instanceof Error) this.cause = cause;
  }
}

/** The bot's API rejected our shared-secret credential. */
export class BotUnauthorizedError extends BotServiceError {
  constructor(botId: string) {
    super(`Bot "${botId}" rejected the panel's credentials.`, "unauthorized");
  }
}

/** The bot responded, but not in the shape we expected. */
export class BotBadResponseError extends BotServiceError {
  constructor(botId: string, detail: string) {
    super(`Bot "${botId}" returned an unexpected response: ${detail}`, "bad_response");
  }
}
