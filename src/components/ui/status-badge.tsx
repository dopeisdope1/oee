import { cn } from "@/lib/utils";
import type { BotState } from "@/types";

const STATE_STYLES: Record<BotState, { dot: string; label: string; text: string }> = {
  online: { dot: "bg-success", text: "text-success", label: "En ligne" },
  connecting: { dot: "bg-warning", text: "text-warning", label: "Connexion..." },
  offline: { dot: "bg-danger", text: "text-danger", label: "Hors ligne" },
  unknown: { dot: "bg-foreground-subtle", text: "text-foreground-subtle", label: "Inconnu" },
};

export function StatusBadge({
  state,
  showLabel = true,
  className,
}: {
  state: BotState;
  showLabel?: boolean;
  className?: string;
}) {
  const style = STATE_STYLES[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        style.text,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {showLabel && style.label}
    </span>
  );
}
