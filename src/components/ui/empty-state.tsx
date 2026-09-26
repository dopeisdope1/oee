import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { ReactNode } from "react";

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-12 text-center">
      <Icon className="size-8 text-foreground-subtle" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="max-w-sm text-sm text-foreground-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
