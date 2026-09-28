import { notFound } from "next/navigation";
import { getBotService } from "@/server/services/registry";
import { DashboardSectionView } from "@/components/bots/dashboard-section-view";

export default async function SecurityPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId } = await params;
  const { guildId } = await searchParams;
  const service = await getBotService(botId);
  if (!service) notFound();

  return <DashboardSectionView botId={botId} sectionKey="security" requestedGuildId={guildId} />;
}
