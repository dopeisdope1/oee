import { AlertTriangle, Plug, ShieldAlert, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ErrorKind =
  | "not_configured"
  | "not_capable"
  | "offline"
  | "unauthorized"
  | "network_error"
  | "bad_response"
  | "unknown";

const COPY: Record<ErrorKind, { icon: LucideIcon; title: string; description: string }> = {
  not_configured: {
    icon: Plug,
    title: "Bot pas encore configuré",
    description:
      "Ce bot n'a pas d'URL/clé d'API définie. Ajoute BOT_n_API_URL et BOT_n_API_KEY à l'environnement du panneau, puis relance le seed.",
  },
  not_capable: {
    icon: Plug,
    title: "Pas encore disponible sur ce bot",
    description:
      "L'API de ce bot n'implémente pas encore cette fonctionnalité. Ajoute l'endpoint correspondant (voir le document d'architecture) pour l'activer ici.",
  },
  offline: {
    icon: WifiOff,
    title: "Bot injoignable",
    description: "Impossible de joindre l'API de ce bot. Il est peut-être hors ligne ou le VPS est injoignable depuis le panneau.",
  },
  unauthorized: {
    icon: ShieldAlert,
    title: "Rejeté par le bot",
    description: "L'API du bot a rejeté les identifiants du panneau. Vérifie que BOT_n_API_KEY correspond des deux côtés.",
  },
  network_error: {
    icon: WifiOff,
    title: "Erreur réseau",
    description: "La requête vers le bot a échoué avant d'obtenir une réponse.",
  },
  bad_response: {
    icon: AlertTriangle,
    title: "Réponse inattendue",
    description: "Le bot a répondu, mais pas dans le format attendu par le panneau.",
  },
  unknown: {
    icon: AlertTriangle,
    title: "Une erreur est survenue",
    description: "Une erreur inattendue s'est produite.",
  },
};

export function errorCopy(kind: string | undefined): (typeof COPY)[ErrorKind] {
  return COPY[(kind as ErrorKind) ?? "unknown"] ?? COPY.unknown;
}
