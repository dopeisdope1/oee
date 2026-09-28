import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { ErrorState } from "@/components/ui/error-state";
import { RoleCommandsPanel } from "./role-commands-panel";

export default async function RoleCommandsPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string; roleId: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId, roleId } = await params;
  const { guildId } = await searchParams;
  const service = await getBotService(botId);
  if (!service) notFound();

  if (!guildId) {
    return <ErrorState code="bad_response" />;
  }

  const [rolesResult, commandsResult, rulesResult] = await Promise.all([
    safeCall(() => service.getGuildRoles(guildId)),
    safeCall(() => service.getCommands(guildId)),
    safeCall(() => service.getAllCommandRules(guildId)),
  ]);

  const role = rolesResult.data?.find((r) => r.id === roleId);

  if (!commandsResult.data || !rulesResult.data) {
    return <ErrorState code={commandsResult.error ?? rulesResult.error ?? "unknown"} />;
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Link
        href={`/bots/${botId}/roles?guildId=${encodeURIComponent(guildId)}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground-muted hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Retour aux rôles
      </Link>

      <div className="flex items-center gap-2">
        {role && (
          <span
            className="size-2.5 rounded-full border border-border"
            style={{ backgroundColor: role.color === "#000000" ? "#99a1af" : role.color }}
          />
        )}
        <h2 className="text-base font-semibold text-foreground">{role?.name ?? roleId}</h2>
      </div>
      <p className="text-sm text-foreground-muted">
        Commandes auxquelles ce rôle est explicitement autorisé ou interdit — même règle que la page « Commandes », vue depuis le rôle.
      </p>

      <RoleCommandsPanel
        botId={botId}
        guildId={guildId}
        roleId={roleId}
        commands={commandsResult.data}
        initialRules={rulesResult.data}
      />
    </div>
  );
}
