"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Users, Hash, Clock, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Command, CommandRule } from "@/types";

type StatusFilter = "all" | "enabled" | "disabled";

export function CommandsTable({
  botId,
  guildId,
  commands,
  rules,
}: {
  botId: string;
  guildId: string;
  commands: Command[];
  rules?: Record<string, CommandRule>;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(commands.map((c) => [c.id, c.enabledForGuild ?? c.enabledGlobally]))
  );
  const [, startTransition] = useTransition();
  const { show } = useToast();

  const categories = useMemo(
    () => ["all", ...new Set(commands.map((c) => c.category).filter((c): c is string => !!c))],
    [commands]
  );

  const filtered = commands.filter((c) => {
    const matchesQuery =
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.description?.toLowerCase().includes(query.toLowerCase()) ?? false);
    const matchesCategory = category === "all" || c.category === category;
    const enabled = states[c.id];
    const matchesStatus = status === "all" || (status === "enabled") === enabled;
    return matchesQuery && matchesCategory && matchesStatus;
  });

  function toggle(command: Command, next: boolean) {
    const previous = states[command.id];
    setStates((s) => ({ ...s, [command.id]: next }));
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/bots/${botId}/commands/${command.id}?guildId=${encodeURIComponent(guildId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled: next }),
          }
        );
        if (!res.ok) throw new Error();
        show("Modifications enregistrées");
      } catch {
        setStates((s) => ({ ...s, [command.id]: previous }));
        show("Échec de l'enregistrement — le bot est peut-être hors ligne", "error");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une commande..."
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-auto min-w-40"
          aria-label="Filtrer par catégorie"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "Toutes les catégories" : cat}
            </option>
          ))}
        </Select>
        <div className="flex rounded-lg border border-border p-0.5 text-xs font-medium">
          {(["all", "enabled", "disabled"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-md px-2.5 py-1.5 transition-colors",
                status === s ? "bg-accent/15 text-accent" : "text-foreground-muted hover:text-foreground"
              )}
            >
              {s === "all" ? "Toutes" : s === "enabled" ? "Activées" : "Désactivées"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-foreground-subtle">
        {filtered.length} commande{filtered.length !== 1 ? "s" : ""} sur {commands.length}
      </p>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-subtle">
              <th className="px-4 py-2.5 font-medium">Commande</th>
              <th className="px-4 py-2.5 font-medium">Catégorie</th>
              <th className="px-4 py-2.5 font-medium">Restrictions</th>
              <th className="px-4 py-2.5 font-medium text-right">Activée</th>
              <th className="px-4 py-2.5 font-medium text-right">Règles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((command) => (
              <tr key={command.id} className="border-b border-border last:border-0 hover:bg-surface-hover/60">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">/{command.name}</p>
                  {command.description && (
                    <p className="max-w-xs truncate text-xs text-foreground-subtle">{command.description}</p>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {command.category && <Badge>{command.category}</Badge>}
                </td>
                <td className="px-4 py-2.5">
                  <RuleSummary rule={rules?.[command.name]} permissions={command.permissions} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Switch
                    checked={states[command.id]}
                    onCheckedChange={(v) => toggle(command, v)}
                    aria-label={`Toggle /${command.name}`}
                  />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/bots/${botId}/commands/${command.id}?guildId=${encodeURIComponent(guildId)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Configurer
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-foreground-subtle">
                  Aucune commande ne correspond à ta recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile: card list — a wide table doesn't fit a phone, so this is a
          different layout, not a shrunk version of the table above. */}
      <div className="space-y-2 sm:hidden">
        {filtered.length === 0 && (
          <Card className="py-8 text-center text-sm text-foreground-subtle">
            Aucune commande ne correspond à ta recherche.
          </Card>
        )}
        {filtered.map((command) => (
          <Card key={command.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">/{command.name}</p>
                {command.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-foreground-subtle">{command.description}</p>
                )}
              </div>
              <Switch
                checked={states[command.id]}
                onCheckedChange={(v) => toggle(command, v)}
                aria-label={`Toggle /${command.name}`}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {command.category && <Badge>{command.category}</Badge>}
              <RuleSummary rule={rules?.[command.name]} permissions={command.permissions} compact />
            </div>

            <Link
              href={`/bots/${botId}/commands/${command.id}?guildId=${encodeURIComponent(guildId)}`}
              className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border text-xs font-medium text-foreground-muted active:bg-surface-hover"
            >
              <SlidersHorizontal className="size-3.5" />
              Configurer les permissions
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** Compact glance at a command's restrictions — role/user/channel counts and
 * cooldown, read straight from commandRules.js's own fields, never
 * recomputed. Falls back to the bot's static `permissions` label when the
 * bot doesn't expose per-guild rules (commandRules capability absent). */
function RuleSummary({
  rule,
  permissions,
  compact = false,
}: {
  rule: CommandRule | undefined;
  permissions: string | null;
  compact?: boolean;
}) {
  if (!rule) {
    return <span className="text-xs text-foreground-subtle">{permissions ?? "Aucune restriction"}</span>;
  }

  const roleCount = rule.allowedRoles.length + rule.deniedRoles.length;
  const userCount = rule.allowedUsers.length + rule.deniedUsers.length;
  const channelCount = rule.allowedChannels.length + rule.deniedChannels.length;
  const hasAny = roleCount || userCount || channelCount || rule.cooldownSeconds;

  if (!hasAny) {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-foreground-subtle", compact && "text-[11px]")}>
        <ShieldCheck className="size-3.5" />
        Aucune restriction
      </span>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {roleCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[11px] text-foreground-muted">
          <Users className="size-3" />
          {roleCount}
        </span>
      )}
      {userCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[11px] text-foreground-muted">
          <ShieldCheck className="size-3" />
          {userCount}
        </span>
      )}
      {channelCount > 0 && (
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[11px] text-foreground-muted">
          <Hash className="size-3" />
          {channelCount}
        </span>
      )}
      {rule.cooldownSeconds ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-border px-1.5 py-0.5 text-[11px] text-foreground-muted">
          <Clock className="size-3" />
          {rule.cooldownSeconds}s
        </span>
      ) : null}
    </div>
  );
}
