"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LivePreviewPanel } from "@/components/bots/live-preview-panel";
import type { MessageTemplate } from "@/types";
import type { MessageField } from "@/lib/message-keys";

export function MessageTemplateForm({
  botId,
  guildId,
  templateKey,
  botName,
  initialTemplate,
  fields,
}: {
  botId: string;
  guildId: string;
  templateKey: string;
  botName: string;
  initialTemplate: MessageTemplate;
  /** Fields the bot really uses (null = full embed) — see MessageKeyDefinition. */
  fields: MessageField[] | null;
}) {
  const has = (field: MessageField) => !fields || fields.includes(field);
  // Only a description, no embed fields: the bot sends it as plain text.
  const plainText = !!fields && !fields.some((f) => f !== "description");
  const [title, setTitle] = useState(initialTemplate.title ?? "");
  const [description, setDescription] = useState(initialTemplate.description ?? "");
  const [color, setColor] = useState(initialTemplate.color ?? "#8b5cf6");
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
            // Only what the bot uses — never overwrite a field it doesn't own.
            body: JSON.stringify(
              Object.fromEntries(
                Object.entries({
                  title: title || null,
                  description: description || null,
                  color: color || null,
                  imageUrl: imageUrl || null,
                  thumbnailUrl: thumbnailUrl || null,
                  footer: footer || null,
                  buttons,
                }).filter(([field]) => has(field as MessageField))
              )
            ),
          }
        );
        if (!res.ok) throw new Error();
        show("Modifications enregistrées");
      } catch {
        show("Échec de l'enregistrement — le bot est peut-être hors ligne", "error");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        {has("title") && (
        <div>
          <Label htmlFor="title">Titre</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        )}
        {has("description") && (
        <div>
          <Label htmlFor="description">{plainText ? "Texte" : "Description"}</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        )}
        {has("color") && (
        <div>
          <Label htmlFor="color">Couleur de l&apos;embed</Label>
          <Input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>
        )}
        {has("imageUrl") && (
        <div>
          <Label htmlFor="imageUrl">URL de l&apos;image</Label>
          <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </div>
        )}
        {has("thumbnailUrl") && (
        <div>
          <Label htmlFor="thumbnailUrl">URL de la miniature</Label>
          <Input
            id="thumbnailUrl"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>
        )}
        {has("footer") && (
        <div>
          <Label htmlFor="footer">Pied de page</Label>
          <Input id="footer" value={footer} onChange={(e) => setFooter(e.target.value)} />
        </div>
        )}

        {has("buttons") && (
        <div>
          <Label>Boutons</Label>
          <div className="space-y-2">
            {buttons.map((btn, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder="Libellé"
                  value={btn.label}
                  onChange={(e) => updateButton(i, { label: e.target.value })}
                />
                <Input
                  placeholder="URL (optionnelle)"
                  value={btn.url ?? ""}
                  onChange={(e) => updateButton(i, { url: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => removeButton(i)}
                  aria-label="Supprimer le bouton"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm" type="button" onClick={addButton}>
              <Plus className="size-4" /> Ajouter un bouton
            </Button>
          </div>
        </div>
        )}

        <Button onClick={save} loading={pending}>
          Enregistrer les modifications
        </Button>
      </div>

      <LivePreviewPanel
        data={{
          botName,
          ...(plainText
            ? { content: description }
            : {
                title: has("title") ? title || null : null,
                description: description || null,
                color: has("color") ? color || null : null,
                imageUrl: has("imageUrl") ? imageUrl || null : null,
                thumbnailUrl: has("thumbnailUrl") ? thumbnailUrl || null : null,
                footer: has("footer") ? footer || null : null,
                buttons: has("buttons") ? buttons : [],
              }),
        }}
      />
    </div>
  );
}
