import {
  LayoutGrid,
  SlashSquare,
  ToggleLeft,
  Server,
  Users,
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
  group: string;
}

// Grouped the same way across every bot — a bot with a capability missing
// (e.g. no "statistics") still shows the item, just with an honest "not
// available yet" state on that page, same principle as the rest of the
// panel: never hide a section, never fake what's inside it.
export const BOT_NAV_ITEMS: BotNavItem[] = [
  { label: "Tableau de bord", segment: "overview", icon: LayoutGrid, group: "Vue d'ensemble" },
  { label: "Serveurs", segment: "servers", icon: Server, group: "Vue d'ensemble" },
  { label: "Commandes", segment: "commands", icon: SlashSquare, group: "Gestion" },
  { label: "Rôles", segment: "roles", icon: Users, group: "Gestion" },
  { label: "Systèmes", segment: "systems", icon: ToggleLeft, group: "Gestion" },
  { label: "Messages", segment: "messages", icon: MessageSquare, group: "Gestion" },
  { label: "Journaux", segment: "logs", icon: ScrollText, group: "Suivi" },
  { label: "Statistiques", segment: "statistics", icon: BarChart3, group: "Suivi" },
  { label: "Paramètres", segment: "settings", icon: SettingsIcon, group: "Configuration" },
];

export const BOT_NAV_GROUP_DOTS: Record<string, string> = {
  "Vue d'ensemble": "bg-accent",
  Gestion: "bg-info",
  Suivi: "bg-accent-2",
  Configuration: "bg-foreground-subtle",
};
