import { notFound } from "next/navigation";
import { getBotSummary } from "@/server/queries/bot-summaries";
import { StatusBadge } from "@/components/ui/status-badge";
import { BotAvatar } from "@/components/bots/bot-avatar";

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
        <BotAvatar name={bot.name} avatarUrl={bot.avatarUrl} size={9} />
        <div>
          <h1 className="text-base font-semibold text-foreground">{bot.name}</h1>
          <StatusBadge state={bot.status.state} />
        </div>
      </div>
      {children}
    </div>
  );
}
