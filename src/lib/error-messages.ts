import { AlertTriangle, Plug, ShieldAlert, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ErrorKind =
  | "not_configured"
  | "not_capable"
  | "offline"
  | "unauthorized"
  | "network_error"
  | "bad_response"
  | "unknown";

const COPY: Record<ErrorKind, { icon: LucideIcon; title: string; description: string }> = {
  not_configured: {
    icon: Plug,
    title: "Bot not configured yet",
    description:
      "This bot has no API URL/key set. Add BOT_n_API_URL and BOT_n_API_KEY to the panel's environment, then reseed.",
  },
  not_capable: {
    icon: Plug,
    title: "Not available on this bot yet",
    description:
      "This bot's API doesn't implement this feature yet. Add the matching endpoint (see the architecture doc) to enable it here.",
  },
  offline: {
    icon: WifiOff,
    title: "Bot unreachable",
    description: "Couldn't reach this bot's API. It may be offline or the VPS may be unreachable from the panel.",
  },
  unauthorized: {
    icon: ShieldAlert,
    title: "Rejected by the bot",
    description: "The bot's API rejected the panel's credentials. Check that BOT_n_API_KEY matches on both sides.",
  },
  network_error: {
    icon: WifiOff,
    title: "Network error",
    description: "The request to the bot failed before getting a response.",
  },
  bad_response: {
    icon: AlertTriangle,
    title: "Unexpected response",
    description: "The bot responded, but not in the format the panel expected.",
  },
  unknown: {
    icon: AlertTriangle,
    title: "Something went wrong",
    description: "An unexpected error occurred.",
  },
};

export function errorCopy(kind: string | undefined): (typeof COPY)[ErrorKind] {
  return COPY[(kind as ErrorKind) ?? "unknown"] ?? COPY.unknown;
}
