"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import type { CommandRule, CommandRuleAction, GuildChannel, GuildRole } from "@/types";

type ToggleField = "allowedRoles" | "deniedRoles" | "allowedUsers" | "deniedUsers" | "allowedChannels" | "deniedChannels";
type ToggleActionName = Extract<CommandRuleAction, { id: string }>["action"];
const TOGGLE_ACTION_BY_FIELD: Record<ToggleField, ToggleActionName> = {
  allowedRoles: "toggleAllowedRole",
  deniedRoles: "toggleDeniedRole",
  allowedUsers: "toggleAllowedUser",
  deniedUsers: "toggleDeniedUser",
  allowedChannels: "toggleAllowedChannel",
  deniedChannels: "toggleDeniedChannel",
};

const DISCORD_ID = /^\d{15,25}$/;
type Tone = "success" | "danger";

function RolePicker({
  field,
  tone,
  ids,
  roles,
  pending,
  onToggle,
}: {
  field: ToggleField;
  tone: Tone;
  ids: string[];
  roles: GuildRole[];
  pending: boolean;
  onToggle: (field: ToggleField, id: string) => void;
}) {
  const available = roles.filter((r) => !ids.includes(r.id));
  const nameOf = (id: string) => roles.find((r) => r.id === id)?.name ?? id;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ids.length === 0 && <p className="text-xs text-foreground-subtle">Aucun</p>}
        {ids.map((id) => (
          <Badge key={id} tone={tone} className="gap-1 pr-1">
            {nameOf(id)}
            <button onClick={() => onToggle(field, id)} className="rounded-full hover:bg-black/10" aria-label="Retirer">
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      {available.length > 0 && (
        <select
          value=""
          onChange={(e) => e.target.value && onToggle(field, e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          disabled={pending}
        >
          <option value="">+ Ajouter un rôle…</option>
          {available.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function ChannelPicker({
  field,
  tone,
  ids,
  channels,
  pending,
  onToggle,
}: {
  field: ToggleField;
  tone: Tone;
  ids: string[];
  channels: GuildChannel[];
  pending: boolean;
  onToggle: (field: ToggleField, id: string) => void;
}) {
  const available = channels.filter((c) => !ids.includes(c.id));
  const nameOf = (id: string) => {
    const c = channels.find((ch) => ch.id === id);
    return c ? `#${c.name}` : id;
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ids.length === 0 && <p className="text-xs text-foreground-subtle">Tous les salons</p>}
        {ids.map((id) => (
          <Badge key={id} tone={tone} className="gap-1 pr-1">
            {nameOf(id)}
            <button onClick={() => onToggle(field, id)} className="rounded-full hover:bg-black/10" aria-label="Retirer">
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      {available.length > 0 && (
        <select
          value=""
          onChange={(e) => e.target.value && onToggle(field, e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
          disabled={pending}
        >
          <option value="">+ Ajouter un salon…</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>
              #{c.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function UserPicker({
  field,
  tone,
  ids,
  pending,
  inputValue,
  onInputChange,
  onAdd,
  onToggle,
}: {
  field: ToggleField;
  tone: Tone;
  ids: string[];
  pending: boolean;
  inputValue: string;
  onInputChange: (field: ToggleField, value: string) => void;
  onAdd: (field: ToggleField) => void;
  onToggle: (field: ToggleField, id: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {ids.length === 0 && <p className="text-xs text-foreground-subtle">Aucun</p>}
        {ids.map((id) => (
          <Badge key={id} tone={tone} className="gap-1 pr-1 font-mono">
            {id}
            <button onClick={() => onToggle(field, id)} className="rounded-full hover:bg-black/10" aria-label="Retirer">
              <X className="size-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => onInputChange(field, e.target.value)}
          placeholder="ID Discord de l'utilisateur"
          className="font-mono text-xs"
        />
        <Button size="sm" variant="secondary" onClick={() => onAdd(field)} disabled={pending}>
          Ajouter
        </Button>
      </div>
    </div>
  );
}

export function CommandRulesPanel({
  botId,
  guildId,
  commandId,
  initialRule,
  roles,
  channels,
}: {
  botId: string;
  guildId: string;
  commandId: string;
  initialRule: CommandRule;
  roles: GuildRole[];
  channels: GuildChannel[];
}) {
  const [rule, setRule] = useState(initialRule);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [cooldownInput, setCooldownInput] = useState(String(initialRule.cooldownSeconds ?? ""));
  const [userInput, setUserInput] = useState<Record<ToggleField, string>>({
    allowedRoles: "",
    deniedRoles: "",
    allowedUsers: "",
    deniedUsers: "",
    allowedChannels: "",
    deniedChannels: "",
  });
  const { show } = useToast();

  function send(action: CommandRuleAction, optimistic: CommandRule) {
    const previous = rule;
    setRule(optimistic);
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/bots/${botId}/commands/${commandId}/rules?guildId=${encodeURIComponent(guildId)}`,
          { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) }
        );
        if (!res.ok) throw new Error();
        const updated = (await res.json()) as CommandRule;
        setRule(updated);
        show("Modifications enregistrées");
      } catch {
        setRule(previous);
        show("Échec de l'enregistrement — le bot est peut-être hors ligne", "error");
      }
    });
  }

  function toggle(field: ToggleField, id: string) {
    const list = rule[field];
    const present = list.includes(id);
    const nextList = present ? list.filter((x) => x !== id) : [...list, id];
    send({ action: TOGGLE_ACTION_BY_FIELD[field], id }, { ...rule, [field]: nextList });
  }

  function addUserId(field: ToggleField) {
    const id = userInput[field].trim();
    if (!DISCORD_ID.test(id)) {
      show("Identifiant Discord invalide (15 à 25 chiffres)", "error");
      return;
    }
    if (rule[field].includes(id)) {
      show("Déjà dans la liste");
      return;
    }
    toggle(field, id);
    setUserInput((s) => ({ ...s, [field]: "" }));
  }

  function saveCooldown() {
    const trimmed = cooldownInput.trim();
    const seconds = trimmed === "" ? null : Number(trimmed);
    if (seconds !== null && (!Number.isInteger(seconds) || seconds < 0)) {
      show("Durée invalide", "error");
      return;
    }
    send({ action: "setCooldown", seconds }, { ...rule, cooldownSeconds: seconds });
  }

  function resetAll() {
    setConfirmResetOpen(false);
    send(
      { action: "reset" },
      {
        allowedRoles: [],
        deniedRoles: [],
        allowedUsers: [],
        deniedUsers: [],
        allowedChannels: [],
        deniedChannels: [],
        cooldownSeconds: null,
        updatedAt: null,
      }
    );
    setCooldownInput("");
  }

  function onInputChange(field: ToggleField, value: string) {
    setUserInput((s) => ({ ...s, [field]: value }));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5">
          <h3 className="text-sm font-semibold text-success">Autorisations</h3>
          <div>
            <Label>Rôles autorisés</Label>
            <RolePicker field="allowedRoles" tone="success" ids={rule.allowedRoles} roles={roles} pending={pending} onToggle={toggle} />
          </div>
          <div>
            <Label>Utilisateurs autorisés</Label>
            <UserPicker
              field="allowedUsers"
              tone="success"
              ids={rule.allowedUsers}
              pending={pending}
              inputValue={userInput.allowedUsers}
              onInputChange={onInputChange}
              onAdd={addUserId}
              onToggle={toggle}
            />
          </div>
          <div>
            <Label>Salons autorisés</Label>
            <ChannelPicker field="allowedChannels" tone="success" ids={rule.allowedChannels} channels={channels} pending={pending} onToggle={toggle} />
          </div>
        </Card>

        <Card className="space-y-5">
          <h3 className="text-sm font-semibold text-danger">Interdictions</h3>
          <div>
            <Label>Rôles interdits</Label>
            <RolePicker field="deniedRoles" tone="danger" ids={rule.deniedRoles} roles={roles} pending={pending} onToggle={toggle} />
          </div>
          <div>
            <Label>Utilisateurs interdits</Label>
            <UserPicker
              field="deniedUsers"
              tone="danger"
              ids={rule.deniedUsers}
              pending={pending}
              inputValue={userInput.deniedUsers}
              onInputChange={onInputChange}
              onAdd={addUserId}
              onToggle={toggle}
            />
          </div>
          <div>
            <Label>Salons interdits</Label>
            <ChannelPicker field="deniedChannels" tone="danger" ids={rule.deniedChannels} channels={channels} pending={pending} onToggle={toggle} />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Cooldown</h3>
        <p className="mb-3 text-xs text-foreground-subtle">
          Délai minimum, en secondes, entre deux usages de cette commande par un même membre. Laisse vide pour aucun cooldown.
        </p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 max-w-40">
            <Label htmlFor="cooldown">Durée (secondes)</Label>
            <Input
              id="cooldown"
              type="number"
              min={0}
              value={cooldownInput}
              onChange={(e) => setCooldownInput(e.target.value)}
              placeholder="Aucun"
            />
          </div>
          <Button onClick={saveCooldown} loading={pending} size="md">
            Enregistrer
          </Button>
          {rule.cooldownSeconds !== null && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setCooldownInput("");
                send({ action: "setCooldown", seconds: null }, { ...rule, cooldownSeconds: null });
              }}
              disabled={pending}
            >
              Retirer le cooldown
            </Button>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border p-4">
        <div>
          <p className="text-sm font-medium text-foreground">Réinitialiser</p>
          <p className="text-xs text-foreground-subtle">
            Efface toutes les règles de cette commande pour ce serveur (rôles, utilisateurs, salons, cooldown).
          </p>
        </div>
        <Button variant="danger" onClick={() => setConfirmResetOpen(true)} disabled={pending}>
          Tout réinitialiser
        </Button>
      </div>

      {rule.updatedAt && (
        <p className="text-xs text-foreground-subtle">
          Dernière modification : {new Date(rule.updatedAt).toLocaleString("fr-FR")}
        </p>
      )}

      <ConfirmDialog
        open={confirmResetOpen}
        title="Réinitialiser cette commande ?"
        description="Efface les rôles, utilisateurs, salons autorisés/interdits et le cooldown pour ce serveur. Cette action ne peut pas être annulée."
        confirmLabel="Réinitialiser"
        danger
        pending={pending}
        onConfirm={resetAll}
        onCancel={() => setConfirmResetOpen(false)}
      />
    </div>
  );
}
