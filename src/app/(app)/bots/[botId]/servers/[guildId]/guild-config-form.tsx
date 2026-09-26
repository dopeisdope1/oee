"use client";

import { useState, useTransition } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function GuildConfigForm({
  botId,
  guildId,
  initialPrefix,
}: {
  botId: string;
  guildId: string;
  initialPrefix: string;
}) {
  const [prefix, setPrefix] = useState(initialPrefix);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bots/${botId}/guilds/${guildId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prefix }),
        });
        if (!res.ok) throw new Error();
        show("Modifications enregistrées");
      } catch {
        show("Échec de l'enregistrement — le bot est peut-être hors ligne", "error");
      }
    });
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="prefix">Préfixe de commande</Label>
        <Input
          id="prefix"
          value={prefix}
          onChange={(e) => setPrefix(e.target.value)}
          placeholder="!"
          className="max-w-[120px]"
        />
      </div>
      <Button onClick={save} loading={pending} size="sm">
        Enregistrer
      </Button>
    </div>
  );
}
