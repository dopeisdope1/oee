import { errorCopy } from "@/lib/error-messages";

export function ErrorState({ code }: { code?: string }) {
  const { icon: Icon, title, description } = errorCopy(code);
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-danger/30 bg-danger/5 py-12 text-center">
      <Icon className="size-8 text-danger" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-foreground-muted">{description}</p>
      </div>
    </div>
  );
}
