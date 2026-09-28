"use client";

import { Button } from "@/components/ui/button";

/** Shared confirmation modal for destructive/important actions — same
 * surface/border/shadow language as the command palette, so every modal in
 * the app looks like it belongs to the same product. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  danger = false,
  pending = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-dialog-title" className="text-sm font-semibold text-foreground">
          {title}
        </p>
        {description && <p className="mt-1.5 text-sm text-foreground-muted">{description}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button variant={danger ? "danger" : "primary"} size="sm" onClick={onConfirm} loading={pending}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
