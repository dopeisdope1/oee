/** Fields of a MessageTemplate a bot can actually use. */
export type MessageField =
  | "title"
  | "description"
  | "color"
  | "imageUrl"
  | "thumbnailUrl"
  | "footer"
  | "buttons";

/** A message-template key the panel offers an editor for.
 *
 * A bot may declare its own templates via GET /messages (see
 * getAvailableMessages); `fields` then lists what it really uses — e.g. a
 * plain-text DM declares only ["description"], so the editor doesn't offer a
 * title or color the bot would silently ignore. Null/absent = full embed. */
export interface MessageKeyDefinition {
  key: string;
  label: string;
  description: string;
  fields?: MessageField[] | null;
}

/** Fallback catalog for bots that don't implement GET /messages: the panel
 * shows what it knows how to edit, and any given bot may or may not have
 * that key implemented yet (surfaced per-key via the normal not_capable
 * error state, not guessed). */

export const MESSAGE_TEMPLATE_DEFINITIONS: MessageKeyDefinition[] = [
  { key: "welcome", label: "Message de bienvenue", description: "Envoyé quand un membre rejoint." },
  { key: "goodbye", label: "Message d'au revoir", description: "Envoyé quand un membre quitte." },
  { key: "rules", label: "Règlement", description: "Publié dans le salon des règles." },
  { key: "announcement", label: "Modèle d'annonce", description: "Modèle réutilisable pour les annonces." },
];
