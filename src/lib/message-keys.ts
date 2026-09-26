/** Well-known message-template keys the panel offers an editor for.
 *
 * The bot API contract (architecture doc section 5) has no "list templates"
 * endpoint — a bot only exposes GET/PATCH for a template by key. So the
 * panel maintains this small starter catalog itself, the same honest-fallback
 * approach used for Systems (see systems.ts / the Systems page): the panel
 * shows what it knows how to edit, and any given bot may or may not have
 * that key implemented yet (surfaced per-key via the normal not_capable
 * error state, not guessed). */
export interface MessageKeyDefinition {
  key: string;
  label: string;
  description: string;
}

export const MESSAGE_TEMPLATE_DEFINITIONS: MessageKeyDefinition[] = [
  { key: "welcome", label: "Message de bienvenue", description: "Envoyé quand un membre rejoint." },
  { key: "goodbye", label: "Message d'au revoir", description: "Envoyé quand un membre quitte." },
  { key: "rules", label: "Règlement", description: "Publié dans le salon des règles." },
  { key: "announcement", label: "Modèle d'annonce", description: "Modèle réutilisable pour les annonces." },
];
