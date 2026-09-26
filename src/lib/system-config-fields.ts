export type FieldType = "text" | "textarea" | "color" | "boolean";

export interface ConfigField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
}

/** Per-system config field layouts. Anything not listed here falls back to
 * a raw JSON editor — this is a starting set covering the systems named in
 * the brief (section 10); add more as real bots confirm their own config
 * shape. */
export const SYSTEM_CONFIG_FIELDS: Record<string, ConfigField[]> = {
  welcome: [
    { key: "channelId", label: "ID du salon", type: "text", placeholder: "123456789012345678" },
    { key: "title", label: "Titre de l'embed", type: "text", placeholder: "Bienvenue !" },
    { key: "message", label: "Message", type: "textarea", placeholder: "Bienvenue {user} sur {server} !" },
    { key: "color", label: "Couleur de l'embed", type: "color" },
    { key: "imageUrl", label: "URL image / GIF", type: "text" },
  ],
  goodbye: [
    { key: "channelId", label: "ID du salon", type: "text" },
    { key: "title", label: "Titre de l'embed", type: "text" },
    { key: "message", label: "Message", type: "textarea", placeholder: "{user} a quitté {server}." },
    { key: "color", label: "Couleur de l'embed", type: "color" },
    { key: "imageUrl", label: "URL image / GIF", type: "text" },
  ],
  automod: [
    { key: "bannedWords", label: "Mots interdits (séparés par des virgules)", type: "textarea" },
    { key: "blockLinks", label: "Bloquer les liens", type: "boolean" },
    { key: "blockInvites", label: "Bloquer les invitations Discord", type: "boolean" },
    { key: "logChannelId", label: "ID du salon de logs", type: "text" },
  ],
  server_logs: [{ key: "channelId", label: "ID du salon de logs", type: "text" }],
  autorole: [{ key: "roleId", label: "ID du rôle", type: "text" }],
  tickets: [
    { key: "categoryId", label: "ID de la catégorie de tickets", type: "text" },
    { key: "logChannelId", label: "ID du salon de logs", type: "text" },
    { key: "message", label: "Message du panneau", type: "textarea" },
  ],
  verification: [{ key: "roleId", label: "ID du rôle vérifié", type: "text" }],
  anti_link: [{ key: "allowedDomains", label: "Domaines autorisés (séparés par des virgules)", type: "textarea" }],
};

/** Systems with a message-style preview (title/message/color/image map to a
 * live embed preview). */
export const PREVIEWABLE_SYSTEMS = new Set(["welcome", "goodbye"]);
