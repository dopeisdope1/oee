import {
  LayoutGrid,
  SlashSquare,
  ToggleLeft,
  Server,
  MessageSquare,
  ScrollText,
  BarChart3,
  Settings as SettingsIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface BotNavItem {
  label: string;
  segment: string; // path segment under /bots/[botId]/...
  icon: LucideIcon;
}

export const BOT_NAV_ITEMS: BotNavItem[] = [
  { label: "Overview", segment: "overview", icon: LayoutGrid },
  { label: "Commands", segment: "commands", icon: SlashSquare },
  { label: "Systems", segment: "systems", icon: ToggleLeft },
  { label: "Servers", segment: "servers", icon: Server },
  { label: "Messages", segment: "messages", icon: MessageSquare },
  { label: "Logs", segment: "logs", icon: ScrollText },
  { label: "Statistics", segment: "statistics", icon: BarChart3 },
  { label: "Settings", segment: "settings", icon: SettingsIcon },
];
