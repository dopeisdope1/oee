import { notFound } from "next/navigation";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { StatusBadge } from "@/components/ui/status-badge";

export default async function BotLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ botId: string }>;
}) {
  const { botId } = await params;
  const bot = await getBotSummary(botId);
  if (!bot) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-semibold">
          {bot.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="text-base font-semibold text-foreground">{bot.name}</h1>
          <StatusBadge state={bot.status.state} />
        </div>
      </div>
      {children}
    </div>
  );
}
