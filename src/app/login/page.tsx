import { AlertTriangle } from "lucide-react";
import { signInWithDiscordAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";

const ERROR_MESSAGES: Record<string, string> = {
  AccessDenied:
    "Ce compte Discord n'est pas autorisé à accéder à ce panneau. Demande à la personne qui le gère d'ajouter ton identifiant Discord à ALLOWED_DISCORD_IDS.",
  Configuration:
    "La connexion Discord du panneau n'est pas encore configurée (DISCORD_CLIENT_ID / DISCORD_CLIENT_SECRET / AUTH_SECRET).",
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
        <h1 className="text-lg font-semibold text-foreground">Connexion</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Ce panneau est réservé aux comptes Discord qu&apos;il a été configuré pour autoriser.
        </p>

        {!configured ? (
          <div className="mt-6 flex flex-col items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-4 text-left">
            <AlertTriangle className="size-5 text-warning" />
            <p className="text-sm text-foreground">
              La connexion Discord n&apos;est pas encore configurée. Définis{" "}
              <code className="text-xs">DISCORD_CLIENT_ID</code>,{" "}
              <code className="text-xs">DISCORD_CLIENT_SECRET</code> et{" "}
              <code className="text-xs">AUTH_SECRET</code> dans l&apos;environnement.
            </p>
          </div>
        ) : (
          <form action={signInWithDiscordAction} className="mt-6">
            <Button type="submit" className="w-full">
              Se connecter avec Discord
            </Button>
          </form>
        )}

        {errorParam && (
          <p className="mt-4 text-sm text-danger">
            {ERROR_MESSAGES[errorParam] ?? "Une erreur est survenue lors de la connexion."}
          </p>
        )}
      </div>
    </div>
  );
}
