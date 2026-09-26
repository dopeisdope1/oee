import { cn } from "@/lib/utils";

export interface LivePreviewData {
  botName: string;
  botAvatarUrl?: string | null;
  content?: string;
  title?: string | null;
  description?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  footer?: string | null;
  buttons?: { label: string }[];
}

/**
 * A chat-bubble preview inspired by how a bot message reads in a text
 * channel — deliberately not a pixel copy of Discord's own chrome (no
 * Discord logo, no Discord-specific colors or typography).
 */
export function LivePreviewPanel({ data }: { data: LivePreviewData }) {
  const accent = data.color || "#6d5bff";

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
        Live preview
      </p>
      <div className="flex gap-3 rounded-lg bg-surface p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
          {data.botName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-semibold text-foreground">
            {data.botName}
            <span className="ml-1.5 rounded bg-accent/20 px-1 py-0.5 text-[10px] font-medium text-accent">
              APP
            </span>
          </p>

          {data.content && (
            <p className="text-sm text-foreground">{data.content}</p>
          )}

          {(data.title || data.description || data.imageUrl) && (
            <div
              className="max-w-md rounded-md border-l-4 bg-background p-3"
              style={{ borderColor: accent }}
            >
              <div className="flex gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  {data.title && (
                    <p className="text-sm font-semibold text-foreground">{data.title}</p>
                  )}
                  {data.description && (
                    <p className="whitespace-pre-wrap text-sm text-foreground-muted">
                      {data.description}
                    </p>
                  )}
                  {data.footer && (
                    <p className="pt-1 text-xs text-foreground-subtle">{data.footer}</p>
                  )}
                </div>
                {data.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={data.thumbnailUrl}
                    alt=""
                    className="size-16 shrink-0 rounded object-cover"
                  />
                )}
              </div>
              {data.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.imageUrl}
                  alt=""
                  className="mt-2 max-h-48 w-full rounded object-cover"
                />
              )}
            </div>
          )}

          {data.buttons && data.buttons.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {data.buttons.map((btn, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-md border border-border bg-surface-hover px-3 py-1 text-xs font-medium text-foreground"
                  )}
                >
                  {btn.label || "Button"}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
