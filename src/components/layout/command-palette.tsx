"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, LayoutDashboard, History, Settings as SettingsIcon, Bot as BotIcon } from "lucide-react";
import { BOT_NAV_ITEMS } from "@/lib/bot-nav";
import type { BotSummary } from "@/types";

interface PaletteItem {
  id: string;
  label: string;
  group: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

/** Ctrl+K / Cmd+K — searches pages, bots, and every bot section (Commandes,
 * Rôles, Modération, Sécurité...) across all 4 bots. Pure client-side
 * filtering over the nav config already used by the sidebar — no new data
 * source, just a faster way to reach an existing page. */
export function CommandPalette({ bots }: { bots: BotSummary[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const items = useMemo<PaletteItem[]>(() => {
    const top: PaletteItem[] = [
      { id: "dashboard", label: "Tableau de bord", group: "Navigation", href: "/dashboard", icon: LayoutDashboard },
      { id: "activity", label: "Activité", group: "Navigation", href: "/activity", icon: History },
      { id: "settings", label: "Paramètres du panneau", group: "Navigation", href: "/settings", icon: SettingsIcon },
    ];
    const perBot: PaletteItem[] = bots.flatMap((bot) => [
      { id: `bot-${bot.id}`, label: bot.name, group: "Bots", href: `/bots/${bot.id}/overview`, icon: BotIcon },
      ...BOT_NAV_ITEMS.map((navItem) => ({
        id: `bot-${bot.id}-${navItem.segment}`,
        label: `${bot.name} · ${navItem.label}`,
        group: bot.name,
        href: `/bots/${bot.id}/${navItem.segment}`,
        icon: navItem.icon,
      })),
    ]);
    return [...top, ...perBot];
  }, [bots]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, 30);
    return items.filter((i) => i.label.toLowerCase().includes(q)).slice(0, 30);
  }, [items, query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          const next = !o;
          if (next) {
            setQuery("");
            setActiveIndex(0);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
          return next;
        });
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function go(item: PaletteItem) {
    setOpen(false);
    router.push(item.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      go(filtered[activeIndex]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Recherche rapide"
        className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-foreground-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Rechercher une page, un bot, une fonctionnalité..."
            aria-label="Rechercher"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-results"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground-subtle">Esc</kbd>
        </div>

        <div id="command-palette-results" role="listbox" className="max-h-80 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="p-4 text-center text-sm text-foreground-muted">Aucun résultat.</p>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  role="option"
                  aria-selected={index === activeIndex}
                  onClick={() => go(item)}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${
                    index === activeIndex ? "bg-accent/15 text-foreground" : "text-foreground-muted"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
