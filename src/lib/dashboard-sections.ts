/**
 * Maps a dashboard section (Modération/Sécurité/Tickets/Vocal) to the
 * `Command.category` and `SystemDefinition.category` strings a bot actually
 * uses for it. These are NOT standardized across the 4 bots — each bot
 * names its own categories in its own PANEL_COMMANDS/SYSTEMS array (see
 * each bot's index.js) — so this is a display-only grouping computed from
 * what's already there, never a new category invented on the panel side.
 *
 * A category absent from a bot simply contributes nothing to that section
 * for that bot — no placeholder, no fake entry.
 */
export interface DashboardSection {
  key: string;
  label: string;
  description: string;
  /** Matches Command.category / SystemDefinition.category case-sensitively, as set by each bot. */
  categories: string[];
}

export const DASHBOARD_SECTIONS: DashboardSection[] = [
  {
    key: "moderation",
    label: "Modération",
    description: "Commandes et systèmes de modération : bans, kicks, mutes, avertissements, blacklist.",
    categories: ["Moderation", "Modération"],
  },
  {
    key: "security",
    label: "Sécurité",
    description: "Anti-nuke, anti-spam, anti-lien, mots interdits, protections personnelles et vérification.",
    categories: ["Sécurité", "Anti-nuke", "Automod", "Protection"],
  },
  {
    key: "tickets",
    label: "Tickets",
    description: "Système de tickets d'assistance.",
    categories: ["Support", "Tickets"],
  },
  {
    key: "voice",
    label: "Vocal",
    description: "Commandes et réglages liés aux salons vocaux.",
    categories: ["Voice", "Vocal"],
  },
];

export function getDashboardSection(key: string): DashboardSection | undefined {
  return DASHBOARD_SECTIONS.find((s) => s.key === key);
}
