"use client";

import { useState, useTransition } from "react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { LivePreviewPanel } from "@/components/bots/live-preview-panel";
import {
  SYSTEM_CONFIG_FIELDS,
  PREVIEWABLE_SYSTEMS,
} from "@/lib/system-config-fields";

export function SystemConfigForm({
  botId,
  guildId,
  systemKey,
  botName,
  initialEnabled,
  initialConfig,
}: {
  botId: string;
  guildId: string;
  systemKey: string;
  botName: string;
  initialEnabled: boolean;
  initialConfig: Record<string, unknown>;
}) {
  const fields = SYSTEM_CONFIG_FIELDS[systemKey];
  const [enabled, setEnabled] = useState(initialEnabled);
  const [values, setValues] = useState<Record<string, unknown>>(initialConfig);
  const [rawJson, setRawJson] = useState(() => JSON.stringify(initialConfig, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const { show } = useToast();

  function setField(key: string, value: unknown) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function save() {
    let config = values;
    if (!fields) {
      try {
        config = JSON.parse(rawJson);
        setJsonError(null);
      } catch {
        setJsonError("Invalid JSON");
        return;
      }
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/bots/${botId}/systems/${systemKey}?guildId=${encodeURIComponent(guildId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled, config }),
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
        <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
          <span className="text-sm font-medium text-foreground">Enabled</span>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {fields ? (
          fields.map((field) => (
            <div key={field.key}>
              {field.type === "boolean" ? (
                <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
                  <span className="text-sm text-foreground">{field.label}</span>
                  <Switch
                    checked={Boolean(values[field.key])}
                    onCheckedChange={(v) => setField(field.key, v)}
                  />
                </div>
              ) : (
                <>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      id={field.key}
                      value={(values[field.key] as string) ?? ""}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.key, e.target.value)}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type === "color" ? "color" : "text"}
                      value={(values[field.key] as string) ?? (field.type === "color" ? "#6d5bff" : "")}
                      placeholder={field.placeholder}
                      onChange={(e) => setField(field.key, e.target.value)}
                    />
                  )}
                </>
              )}
            </div>
          ))
        ) : (
          <div>
            <Label htmlFor="raw-config">Config (JSON)</Label>
            <Textarea
              id="raw-config"
              className="min-h-40 font-mono text-xs"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
            />
            {jsonError && <p className="mt-1 text-xs text-danger">{jsonError}</p>}
            <p className="mt-1 text-xs text-foreground-subtle">
              No dedicated form for this system yet — editing its raw config.
            </p>
          </div>
        )}

        <Button onClick={save} loading={pending}>
          Save changes
        </Button>
      </div>

      {PREVIEWABLE_SYSTEMS.has(systemKey) && (
        <LivePreviewPanel
          data={{
            botName,
            title: (values.title as string) || null,
            description: (values.message as string) || null,
            color: (values.color as string) || null,
            imageUrl: (values.imageUrl as string) || null,
          }}
        />
      )}
    </div>
  );
}
