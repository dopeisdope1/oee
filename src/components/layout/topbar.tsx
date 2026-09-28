"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, LogOut, ChevronDown, AlertTriangle, WifiOff, Search } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { signOutAction } from "@/server/actions/auth";
import { cn } from "@/lib/utils";
import type { NotificationItem } from "@/server/queries/notifications";

export function Topbar({
  user,
  notifications,
}: {
  user: { name: string | null; image: string | null };
  notifications: NotificationItem[];
}) {
  const { setMobileOpen } = useSidebar();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-4">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-md p-1.5 text-foreground-muted hover:bg-surface-hover hover:text-foreground lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex flex-1 items-center justify-end gap-2">
        <button
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }))}
          className="hidden items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground-subtle hover:bg-surface-hover hover:text-foreground sm:flex"
        >
          <Search className="size-3.5" />
          Rechercher
          <kbd className="rounded border border-border px-1 text-[10px]">Ctrl K</kbd>
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-md p-2 text-foreground-muted hover:bg-surface-hover hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="size-4.5" />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex size-2 rounded-full bg-danger" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-lg border border-border bg-surface p-2 shadow-lg">
              {notifications.length === 0 ? (
                <p className="p-2 text-sm text-foreground-muted">Aucune notification pour l&apos;instant.</p>
              ) : (
                <div className="max-h-96 space-y-1 overflow-y-auto">
                  {notifications.map((n) => (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setNotifOpen(false)}
                      className="flex items-start gap-2.5 rounded-md p-2 hover:bg-surface-hover"
                    >
                      {n.severity === "danger" ? (
                        <WifiOff className="mt-0.5 size-4 shrink-0 text-danger" />
                      ) : (
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                        <p className="truncate text-xs text-foreground-subtle">{n.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className={cn("flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface-hover")}
          >
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="size-6 rounded-full" />
            ) : (
              <span className="flex size-6 items-center justify-center rounded-full bg-accent/20 text-[10px] font-semibold text-accent">
                {(user.name ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="hidden max-w-32 truncate sm:inline">{user.name ?? "Compte"}</span>
            <ChevronDown className="size-3.5 text-foreground-subtle" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-lg border border-border bg-surface p-1 shadow-lg">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                >
                  <LogOut className="size-4" />
                  Se déconnecter
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
