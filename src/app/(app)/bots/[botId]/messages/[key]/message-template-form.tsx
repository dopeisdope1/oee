"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LivePreviewPanel } from "@/components/bots/live-preview-panel";
import type { MessageTemplate } from "@/types";

export function MessageTemplateForm({
  botId,
  guildId,
  templateKey,
  botName,
  initialTemplate,
}: {
  botId: string;
  guildId: string;
  templateKey: string;
  botName: string;
  initialTemplate: MessageTemplate;
}) {
  const [title, setTitle] = useState(initialTemplate.title ?? "");
  const [description, setDescription] = useState(initialTemplate.description ?? "");
  const [color, setColor] = useState(initialTemplate.color ?? "#6d5bff");
  const [imageUrl, setImageUrl] = useState(initialTemplate.imageUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initialTemplate.thumbnailUrl ?? "");
  const [footer, setFooter] = useState(initialTemplate.footer ?? "");
  const [buttons, setButtons] = useState(initialTemplate.buttons ?? []);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function addButton() {
    setButtons((b) => [...b, { label: "" }]);
  }

  function updateButton(index: number, patch: Partial<{ label: string; url?: string }>) {
    setButtons((b) => b.map((btn, i) => (i === index ? { ...btn, ...patch } : btn)));
  }

  function removeButton(index: number) {
    setButtons((b) => b.filter((_, i) => i !== index));
  }

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/bots/${botId}/messages/${templateKey}?guildId=${encodeURIComponent(guildId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: title || null,
              description: description || null,
              color: color || null,
              imageUrl: imageUrl || null,
              thumbnailUrl: thumbnailUrl || null,
              footer: footer || null,
              buttons,
            }),
          }
        );
        if (!res.ok) throw new Error();
        show("Changes saved");
      } catch {
        show("Couldn't save — bot may be offline", "error");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="color">Embed color</Label>
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
          <Input
            id="thumbnailUrl"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="footer">Footer</Label>
          <Input id="footer" value={footer} onChange={(e) => setFooter(e.target.value)} />
        </div>

        <div>
          <Label>Buttons</Label>
          <div className="space-y-2">
            {buttons.map((btn, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={btn.label}
                  onChange={(e) => updateButton(i, { label: e.target.value })}
                />
                <Input
                  placeholder="URL (optional)"
                  value={btn.url ?? ""}
                  onChange={(e) => updateButton(i, { url: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => removeButton(i)}
                  aria-label="Remove button"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" type="button" onClick={addButton}>
              <Plus className="size-4" /> Add button
            </Button>
          </div>
        </div>

        <Button onClick={save} loading={pending}>
          Save changes
        </Button>
      </div>

      <LivePreviewPanel
        data={{
          botName,
          title: title || null,
          description: description || null,
          color: color || null,
          imageUrl: imageUrl || null,
          thumbnailUrl: thumbnailUrl || null,
          footer: footer || null,
          buttons,
        }}
      />
    </div>
  );
}
