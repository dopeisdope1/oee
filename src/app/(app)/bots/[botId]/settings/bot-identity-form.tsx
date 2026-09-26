"use client";

import { useState, useTransition } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function BotIdentityForm({
  botId,
  initialName,
  initialAvatarUrl,
}: {
  botId: string;
  initialName: string;
  initialAvatarUrl: string | null;
}) {
  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? "");
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bots/${botId}/settings`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, avatarUrl: avatarUrl || null }),
        });
        if (!res.ok) throw new Error();
        show("Changes saved");
      } catch {
        show("Couldn't save changes", "error");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Display name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <Input
          id="avatarUrl"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>
      <Button onClick={save} loading={pending}>
        Save changes
      </Button>
    </div>
  );
}
