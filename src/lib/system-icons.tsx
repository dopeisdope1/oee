import {
  Hand,
  DoorOpen,
  Shield,
  Scroll,
  Badge as BadgeIcon,
  Gift,
  BarChart,
  Ticket,
  Gavel,
  Info,
  ShieldAlert,
  ShieldX,
  Link2Off,
  CheckCircle,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const REGISTRY: Record<string, LucideIcon> = {
  hand: Hand,
  "door-open": DoorOpen,
  shield: Shield,
  scroll: Scroll,
  badge: BadgeIcon,
  gift: Gift,
  "bar-chart": BarChart,
  ticket: Ticket,
  gavel: Gavel,
  info: Info,
  "shield-alert": ShieldAlert,
  "shield-x": ShieldX,
  "link-2-off": Link2Off,
  "check-circle": CheckCircle,
  settings: Settings,
};

export function getSystemIcon(key: string): LucideIcon {
  return REGISTRY[key] ?? Settings;
}
