import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export type BadgeTone = "neutral" | "accent" | "info" | "success" | "warning" | "danger";

const TONE_STYLES: Record<BadgeTone, string> = {
  neutral: "border-border bg-background text-foreground-muted",
  accent: "border-transparent bg-accent/15 text-accent",
  info: "border-transparent bg-info/15 text-info",
  success: "border-transparent bg-success/15 text-success",
  warning: "border-transparent bg-warning/15 text-warning",
  danger: "border-transparent bg-danger/15 text-danger",
};

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_STYLES[tone],
        className
      )}
      {...props}
    />
  );
}
