"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { getSystemIcon } from "@/lib/system-icons";
import { cn } from "@/lib/utils";
import type { SystemState } from "@/types";

export function SystemCard({
  botId,
  guildId,
  system,
}: {
  botId: string;
  guildId: string;
  system: SystemState;
}) {
  const [enabled, setEnabled] = useState(system.enabled);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();
  // Looked up from a static icon registry (lib/system-icons.tsx), not
  // created — this is a stable reference to an existing component, not a
  // new component type per render, so the "no components created during
  // render" rule's concern doesn't apply here.
  const Icon = useMemo(() => getSystemIcon(system.icon), [system.icon]);

  function toggle(next: boolean) {
    const previous = enabled;
    setEnabled(next); // optimistic — reverted below on failure
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/bots/${botId}/systems/${system.key}?guildId=${encodeURIComponent(guildId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: next }),
          }
        );
        if (!res.ok) throw new Error();
        show("Modifications enregistrées");
      } catch {
        setEnabled(previous);
        show("Échec de l'enregistrement — le bot est peut-être hors ligne", "error");
      }
    });
  }

  return (
    <Card
      className={cn(
        "transition-shadow duration-150",
        !system.available && "opacity-60",
        enabled && system.available && "border-accent/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={cn("icon-circle size-8", enabled && system.available ? "bg-accent/16 text-accent" : "bg-surface-hover text-foreground-muted")}>
            {/* eslint-disable-next-line react-hooks/static-components -- stable lookup from a static registry, not a dynamically created component */}
            <Icon className="size-4" />
          </span>
          <p className="text-sm font-semibold text-foreground">{system.label}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={toggle}
          disabled={pending || !system.available}
          aria-label={`Toggle ${system.label}`}
        />
      </div>

      <p className="mt-2 text-sm text-foreground-muted">{system.description}</p>

      <div className="mt-4 flex items-center justify-between">
        {system.available ? (
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", enabled ? "text-success" : "text-foreground-subtle")}>
            <span className={cn("size-1.5 rounded-full", enabled ? "bg-success" : "bg-foreground-subtle")} />
            {enabled ? "Activé" : "Désactivé"}
          </span>
        ) : (
          <Badge>Pas encore disponible sur ce bot</Badge>
        )}
        {system.available ? (
          <Link
            href={`/bots/${botId}/systems/${system.key}?guildId=${encodeURIComponent(guildId)}`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
          >
            Configurer
          </Link>
        ) : (
          <span className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "opacity-50 pointer-events-none")}>
            Configurer
          </span>
        )}
      </div>
    </Card>
  );
}
