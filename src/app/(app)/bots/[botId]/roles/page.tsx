import { notFound } from "next/navigation";
import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { getBotService } from "@/server/services/registry";
import { safeCall } from "@/server/safe-call";
import { listGuilds as listCachedGuilds } from "@/server/repositories/guilds";
import { GuildTabs } from "@/components/bots/guild-tabs";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Card } from "@/components/ui/card";
import { Server } from "lucide-react";

export default async function RolesPage({
  params,
  searchParams,
}: {
  params: Promise<{ botId: string }>;
  searchParams: Promise<{ guildId?: string }>;
}) {
  const { botId } = await params;
  const { guildId: requestedGuildId } = await searchParams;
  const service = await getBotService(botId);
  if (!service) notFound();

  const liveGuilds = await safeCall(() => service.getGuilds());
  const guilds = liveGuilds.data ?? (await listCachedGuilds(botId));

  if (guilds.length === 0) {
    return liveGuilds.error ? (
      <ErrorState code={liveGuilds.error} />
    ) : (
      <EmptyState icon={Server} title="Ce bot n'est encore sur aucun serveur" />
    );
  }

  const activeGuildId = requestedGuildId ?? guilds[0].id;

  const capabilities = await service.getCapabilities();
  const header = (
    <div>
      <h2 className="text-base font-semibold text-foreground">Rôles</h2>
      <p className="mt-0.5 text-sm text-foreground-muted">
        Gère les commandes autorisées pour chaque rôle Discord de ce serveur.
      </p>
    </div>
  );

  if (!capabilities.includes("roles")) {
    return (
      <div className="space-y-4">
        {header}
        <GuildTabs botId={botId} section="roles" guilds={guilds} activeGuildId={activeGuildId} />
        <EmptyState title="Pas encore disponible sur ce bot" description="Ce bot n'expose pas encore la liste de ses rôles Discord." />
      </div>
    );
  }

  const rolesResult = await safeCall(() => service.getGuildRoles(activeGuildId));

  return (
    <div className="space-y-4">
      {header}
      <GuildTabs botId={botId} section="roles" guilds={guilds} activeGuildId={activeGuildId} />

      {!rolesResult.data ? (
        <ErrorState code={rolesResult.error ?? "unknown"} />
      ) : rolesResult.data.length === 0 ? (
        <EmptyState icon={Users} title="Aucun rôle sur ce serveur" />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-foreground-subtle">
                  <th className="px-4 py-2.5 font-medium">Rôle</th>
                  <th className="px-4 py-2.5 font-medium">Membres</th>
                  <th className="px-4 py-2.5 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {rolesResult.data.map((role) => (
                  <tr key={role.id} className="border-b border-border last:border-0 hover:bg-surface-hover/60">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full border border-border"
                          style={{ backgroundColor: role.color === "#000000" ? "#99a1af" : role.color }}
                        />
                        <span className="font-medium text-foreground">{role.name}</span>
                        {role.managed && <span className="text-xs text-foreground-subtle">(intégration)</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-foreground-subtle">{role.memberCount}</td>
                    <td className="px-4 py-2.5 text-right">
                      <Link
                        href={`/bots/${botId}/roles/${role.id}?guildId=${encodeURIComponent(activeGuildId)}`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Gérer les commandes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: card list */}
          <div className="space-y-2 sm:hidden">
            {rolesResult.data.map((role) => (
              <Link
                key={role.id}
                href={`/bots/${botId}/roles/${role.id}?guildId=${encodeURIComponent(activeGuildId)}`}
              >
                <Card className="flex items-center gap-3 p-4 active:bg-surface-hover">
                  <span
                    className="size-3 shrink-0 rounded-full border border-border"
                    style={{ backgroundColor: role.color === "#000000" ? "#99a1af" : role.color }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{role.name}</p>
                    <p className="text-xs text-foreground-subtle">
                      {role.memberCount} membre{role.memberCount !== 1 ? "s" : ""}
                      {role.managed ? " · intégration" : ""}
                    </p>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-foreground-subtle" />
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
