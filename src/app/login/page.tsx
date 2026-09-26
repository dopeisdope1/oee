import { AlertTriangle } from "lucide-react";
import { signInWithDiscordAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "That Discord account isn't allowed to access this panel. Ask whoever runs it to add your Discord user ID to ALLOWED_DISCORD_IDS.",
  Configuration:
    "The panel's Discord login isn't configured yet (DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET / AUTH_SECRET).",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const params = await searchParams;
  const errorParam = Array.isArray(params.error) ? params.error[0] : params.error;
  const configured = Boolean(
    process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
  );

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-6 text-center">
        <h1 className="text-lg font-semibold text-foreground">Sign in</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          This panel is only for the Discord accounts it&apos;s been configured to allow.
        </p>

        {!configured ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-4 text-left">
            <AlertTriangle className="size-5 text-warning" />
            <p className="text-sm text-foreground">
              Discord login isn&apos;t configured yet. Set{" "}
              <code className="text-xs">DISCORD_CLIENT_ID</code>,{" "}
              <code className="text-xs">DISCORD_CLIENT_SECRET</code> and{" "}
              <code className="text-xs">AUTH_SECRET</code> in the environment.
            </p>
          </div>
        ) : (
          <form action={signInWithDiscordAction} className="mt-6">
            <Button type="submit" className="w-full">
              Sign in with Discord
            </Button>
          </form>
        )}

        {errorParam && (
          <p className="mt-4 text-sm text-danger">
            {ERROR_MESSAGES[errorParam] ?? "Something went wrong signing you in."}
          </p>
        )}
      </div>
    </div>
  );
}
