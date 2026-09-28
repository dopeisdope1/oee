"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings as SettingsIcon, PanelLeftClose, PanelLeftOpen, Bot as BotIcon, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { StatusBadge } from "@/components/ui/status-badge";
import { BOT_NAV_ITEMS, BOT_NAV_GROUP_DOTS } from "@/lib/bot-nav";
import { BotAvatar } from "@/components/bots/bot-avatar";
import type { BotSummary } from "@/types";

export function Sidebar({ bots }: { bots: BotSummary[] }) {
  const pathname = usePathname();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const botMatch = pathname.match(/^\/bots\/([^/]+)/);
  const activeBotId = botMatch?.[1];
  const activeBot = bots.find((b) => b.id === activeBotId);

  const content = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <span className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="icon-circle size-6">
              <BotIcon className="size-3.5" />
            </span>
            <span className="text-gradient">Bot Panel</span>
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          className="hidden rounded-md p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground lg:block"
          aria-label={collapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <NavLink href="/dashboard" icon={LayoutDashboard} active={pathname === "/dashboard"} collapsed={collapsed}>
          Tableau de bord
        </NavLink>
        <NavLink href="/activity" icon={History} active={pathname === "/activity"} collapsed={collapsed}>
          Activité
        </NavLink>

        {!collapsed && (
          <p className="mt-4 mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
            Mes bots
          </p>
        )}
        <div className="space-y-0.5">
          {bots.map((bot) => (
            <Link
              key={bot.id}
              href={`/bots/${bot.id}/overview`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                bot.id === activeBotId
                  ? "bg-accent/15 text-foreground"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <BotAvatar name={bot.name} avatarUrl={bot.avatarUrl} size={6} />
              {!collapsed && (
                <span className="flex flex-1 items-center justify-between gap-2 truncate">
                  <span className="truncate">{bot.name}</span>
                  <StatusBadge state={bot.status.state} showLabel={false} className="shrink-0" />
                </span>
              )}
            </Link>
          ))}
        </div>

        {activeBot &&
          Object.entries(
            BOT_NAV_ITEMS.reduce<Record<string, typeof BOT_NAV_ITEMS>>((acc, item) => {
              (acc[item.group] ??= []).push(item);
              return acc;
            }, {})
          ).map(([group, items]) => (
            <div key={group} className="mt-4">
              <p
                className={cn(
                  "mb-1 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle",
                  collapsed && "sr-only"
                )}
              >
                <span className={cn("size-1.5 rounded-full", BOT_NAV_GROUP_DOTS[group])} />
                {group}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => {
                  const href = `/bots/${activeBot.id}/${item.segment}`;
                  return (
                    <NavLink
                      key={item.segment}
                      href={href}
                      icon={item.icon}
                      active={pathname.startsWith(href)}
                      collapsed={collapsed}
                    >
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

        <div className="mt-4 border-t border-border pt-3">
          <NavLink href="/settings" icon={SettingsIcon} active={pathname === "/settings"} collapsed={collapsed}>
            Paramètres du panneau
          </NavLink>
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-border bg-surface transition-[width] duration-150 lg:block",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-surface">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  active,
  collapsed,
  children,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-accent/15 text-accent"
          : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{children}</span>}
    </Link>
  );
}

export { BotIcon };
