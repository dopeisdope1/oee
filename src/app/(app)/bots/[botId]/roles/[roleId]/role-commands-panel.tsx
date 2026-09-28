"use client";

import { useState, useTransition } from "react";
import { Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Command, CommandRule, CommandRuleAction } from "@/types";

const EMPTY_RULE: CommandRule = {
  allowedRoles: [],
  deniedRoles: [],
  allowedUsers: [],
  deniedUsers: [],
  allowedChannels: [],
  deniedChannels: [],
  cooldownSeconds: null,
  updatedAt: null,
};

type Status = "allowed" | "denied" | "neutral";

export function RoleCommandsPanel({
  botId,
  guildId,
  roleId,
  commands,
  initialRules,
}: {
  botId: string;
  guildId: string;
  roleId: string;
  commands: Command[];
  initialRules: Record<string, CommandRule>;
}) {
  const [rules, setRules] = useState(initialRules);
  const [query, setQuery] = useState("");
  const [pendingId, startTransition] = useTransition();
  const { show } = useToast();

  function statusFor(commandId: string): Status {
    const rule = rules[commandId] ?? EMPTY_RULE;
    if (rule.allowedRoles.includes(roleId)) return "allowed";
    if (rule.deniedRoles.includes(roleId)) return "denied";
    return "neutral";
  }

  /**
   * Passer de "allowed" à "denied" (ou l'inverse) demande DEUX bascules côté
   * bot : commandRules.js vérifie allowedRoles avant deniedRoles (voir
   * resolveRoleOrUser), donc un rôle encore présent dans allowedRoles
   * resterait autorisé même après avoir été ajouté à deniedRoles. Les deux
   * appels sont enchaînés séquentiellement sous UNE seule transition/un seul
   * instantané de restauration, pour ne jamais laisser un échec partiel
   * afficher un état optimiste différent de la réalité côté bot.
   */
  function setStatus(commandId: string, next: Status) {
    const currentRule = rules[commandId] ?? EMPTY_RULE;
    const current = statusFor(commandId);
    if (current === next) return;

    const actions: CommandRuleAction[] = [];
    if (current === "allowed") actions.push({ action: "toggleAllowedRole", id: roleId });
    if (current === "denied") actions.push({ action: "toggleDeniedRole", id: roleId });
    if (next === "allowed") actions.push({ action: "toggleAllowedRole", id: roleId });
    if (next === "denied") actions.push({ action: "toggleDeniedRole", id: roleId });

    const optimisticRule: CommandRule = {
      ...currentRule,
      allowedRoles:
        next === "allowed"
          ? [...currentRule.allowedRoles.filter((id) => id !== roleId), roleId]
          : currentRule.allowedRoles.filter((id) => id !== roleId),
      deniedRoles:
        next === "denied"
          ? [...currentRule.deniedRoles.filter((id) => id !== roleId), roleId]
          : currentRule.deniedRoles.filter((id) => id !== roleId),
    };

    const previousRules = rules;
    setRules((r) => ({ ...r, [commandId]: optimisticRule }));

    startTransition(async () => {
      try {
        let latest = currentRule;
        for (const action of actions) {
          const res = await fetch(
            `/api/bots/${botId}/commands/${commandId}/rules?guildId=${encodeURIComponent(guildId)}`,
            { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) }
          );
          if (!res.ok) throw new Error();
          latest = (await res.json()) as CommandRule;
        }
        setRules((r) => ({ ...r, [commandId]: latest }));
        show("Modifications enregistrées");
      } catch {
        setRules(previousRules);
        show("Échec de l'enregistrement — le bot est peut-être hors ligne", "error");
      }
    });
  }

  const filtered = commands.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-3">
      <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une commande..." />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-80 text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-subtle">
              <th className="px-4 py-2.5 font-medium">Commande</th>
              <th className="px-4 py-2.5 font-medium text-right">Accès</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((command) => {
              const status = statusFor(command.id);
              return (
                <tr key={command.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5 font-medium text-foreground">/{command.name}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant={status === "allowed" ? "primary" : "secondary"}
                        onClick={() => setStatus(command.id, "allowed")}
                        disabled={pendingId}
                        aria-label={`Autoriser /${command.name}`}
                        className={status === "allowed" ? "bg-success text-white hover:bg-success/90" : ""}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setStatus(command.id, "neutral")}
                        disabled={pendingId}
                        aria-label={`Neutre pour /${command.name}`}
                        className={status === "neutral" ? "bg-foreground-subtle/20" : ""}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant={status === "denied" ? "danger" : "secondary"}
                        onClick={() => setStatus(command.id, "denied")}
                        disabled={pendingId}
                        aria-label={`Interdire /${command.name}`}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-foreground-subtle">
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
