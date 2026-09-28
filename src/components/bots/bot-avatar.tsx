// Literal Tailwind classes, keyed by size — Tailwind's scanner only picks
// up class names that appear as complete literal strings in source, so a
// computed `size-${n}` string would silently produce no CSS at all.
const SIZE_CLASSES = {
  6: "size-6",
  9: "size-9",
  10: "size-10",
} as const;

/** Real Discord avatar when the bot record has one (BOT_n_AVATAR_URL),
 * initials fallback otherwise — used everywhere a bot is shown (sidebar,
 * dashboard cards, bot header) so the same bot looks the same everywhere. */
export function BotAvatar({
  name,
  avatarUrl,
  size = 9,
}: {
  name: string;
  avatarUrl: string | null;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const sizeClass = SIZE_CLASSES[size];
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt="" className={`${sizeClass} shrink-0 rounded-full object-cover`} />
    );
  }
  return (
    <span
      className={`flex ${sizeClass} shrink-0 items-center justify-center rounded-full text-white`}
      style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }}
    >
      <span className="text-[11px] font-semibold">{name.slice(0, 2).toUpperCase()}</span>
    </span>
  );
}
