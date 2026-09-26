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
    { key: "channelId", label: "Channel ID", type: "text", placeholder: "123456789012345678" },
    { key: "title", label: "Embed title", type: "text", placeholder: "Welcome!" },
    { key: "message", label: "Message", type: "textarea", placeholder: "Welcome {user} to {server}!" },
    { key: "color", label: "Embed color", type: "color" },
    { key: "imageUrl", label: "Image / GIF URL", type: "text" },
  ],
  goodbye: [
    { key: "channelId", label: "Channel ID", type: "text" },
    { key: "title", label: "Embed title", type: "text" },
    { key: "message", label: "Message", type: "textarea", placeholder: "{user} has left {server}." },
    { key: "color", label: "Embed color", type: "color" },
    { key: "imageUrl", label: "Image / GIF URL", type: "text" },
  ],
  automod: [
    { key: "bannedWords", label: "Banned words (comma-separated)", type: "textarea" },
    { key: "blockLinks", label: "Block links", type: "boolean" },
    { key: "blockInvites", label: "Block Discord invites", type: "boolean" },
    { key: "logChannelId", label: "Log channel ID", type: "text" },
  ],
  server_logs: [{ key: "channelId", label: "Log channel ID", type: "text" }],
  autorole: [{ key: "roleId", label: "Role ID", type: "text" }],
  tickets: [
    { key: "categoryId", label: "Ticket category ID", type: "text" },
    { key: "logChannelId", label: "Log channel ID", type: "text" },
    { key: "message", label: "Panel message", type: "textarea" },
  ],
  verification: [{ key: "roleId", label: "Verified role ID", type: "text" }],
  anti_link: [{ key: "allowedDomains", label: "Allowed domains (comma-separated)", type: "textarea" }],
};

/** Systems with a message-style preview (title/message/color/image map to a
 * live embed preview). */
export const PREVIEWABLE_SYSTEMS = new Set(["welcome", "goodbye"]);
