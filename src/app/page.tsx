import Link from "next/link";
import { auth } from "@/auth";
import {
  LayoutDashboard,
  ShieldCheck,
  ToggleLeft,
  ScrollText,
  ArrowRight,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight">Bot Panel</span>
        <Link
          href={session ? "/dashboard" : "/login"}
          className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
        >
          {session ? "Tableau de bord" : "Connexion"}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Gère tous tes bots Discord depuis un seul endroit.
        </h1>
        <p className="mt-4 max-w-xl text-foreground-muted">
          Un panneau de contrôle unique pour les bots Discord que tu fais déjà
          tourner — statut, commandes, systèmes, serveurs, messages, journaux
          et statistiques, par bot, sans jamais tout mélanger.
        </p>

        <Link
          href={session ? "/dashboard" : "/login"}
          className={cn(buttonVariants({ size: "lg" }), "mt-8")}
        >
          {session ? "Accéder au tableau de bord" : "Se connecter avec Discord"}
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-2">
          <Feature
            icon={LayoutDashboard}
            title="Un tableau de bord, quatre bots"
            description="Passe d'un bot à l'autre sans jamais mélanger leurs serveurs, commandes ou configuration."
          />
          <Feature
            icon={ToggleLeft}
            title="Des systèmes que tu peux activer ou désactiver"
            description="Messages de bienvenue, modération, tickets et plus — activables par serveur, avec aperçu en direct."
          />
          <Feature
            icon={ScrollText}
            title="Vrais journaux, vraies statistiques"
            description="Ce que tu vois, c'est ce que tes bots rapportent — jamais de chiffres inventés ni de faux statut « en ligne »."
          />
          <Feature
            icon={ShieldCheck}
            title="Les secrets restent sur le serveur"
            description="Les tokens de bot et clés d'API n'atteignent jamais le navigateur. Chaque action est authentifiée et auditée."
          />
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <Icon className="size-5 text-accent" />
      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-foreground-muted">{description}</p>
    </div>
  );
}
