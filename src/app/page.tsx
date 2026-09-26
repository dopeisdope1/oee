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
          {session ? "Dashboard" : "Login"}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-6 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Manage all your Discord bots from one place.
        </h1>
        <p className="mt-4 max-w-xl text-foreground-muted">
          A single control panel for the Discord bots you already run — status,
          commands, systems, servers, messages, logs and statistics, per bot,
          without mixing anything up.
        </p>

        <Link
          href={session ? "/dashboard" : "/login"}
          className={cn(buttonVariants({ size: "lg" }), "mt-8")}
        >
          {session ? "Go to dashboard" : "Sign in with Discord"}
          <ArrowRight className="size-4" />
        </Link>

        <div className="mt-16 grid w-full gap-4 text-left sm:grid-cols-2">
          <Feature
            icon={LayoutDashboard}
            title="One dashboard, four bots"
            description="Switch between your bots without ever mixing their servers, commands or configuration."
          />
          <Feature
            icon={ToggleLeft}
            title="Systems you can toggle"
            description="Welcome messages, moderation, tickets and more — enabled per server, with live preview."
          />
          <Feature
            icon={ScrollText}
            title="Real logs, real statistics"
            description="What you see is what your bots report — never invented numbers or a fake 'online' status."
          />
          <Feature
            icon={ShieldCheck}
            title="Secrets stay on the server"
            description="Bot tokens and API keys never reach the browser. Every action is authenticated and audited."
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
