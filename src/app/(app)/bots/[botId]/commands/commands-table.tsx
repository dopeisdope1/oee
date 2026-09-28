"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import type { Command } from "@/types";

export function CommandsTable({
  botId,
  guildId,
  commands,
}: {
  botId: string;
  guildId: string;
  commands: Command[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
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
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || c.category === category;
    return matchesQuery && matchesCategory;
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
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher des commandes..."
            className="pl-9"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "all" ? "Toutes les catégories" : cat}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-subtle">
              <th className="px-4 py-2.5 font-medium">Commande</th>
              <th className="px-4 py-2.5 font-medium">Catégorie</th>
              <th className="px-4 py-2.5 font-medium">Permissions</th>
              <th className="px-4 py-2.5 font-medium text-right">Activée</th>
              <th className="px-4 py-2.5 font-medium text-right">Règles</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((command) => (
              <tr key={command.id} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5">
                  <p className="font-medium text-foreground">/{command.name}</p>
                  {command.description && (
                    <p className="text-xs text-foreground-subtle">{command.description}</p>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  {command.category && <Badge>{command.category}</Badge>}
                </td>
                <td className="px-4 py-2.5 text-foreground-subtle">
                  {command.permissions ?? "—"}
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
    </div>
  );
}
