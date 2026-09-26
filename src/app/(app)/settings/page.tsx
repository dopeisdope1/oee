import { auth } from "@/auth";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default async function GlobalSettingsPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Paramètres</h1>
        <p className="text-sm text-foreground-muted">Paramètres de compte et de sécurité pour tout le panneau.</p>
      </div>

      <Card>
        <CardTitle>Compte</CardTitle>
        <CardDescription>Connecté via Discord OAuth2.</CardDescription>
        <div className="mt-4 flex items-center gap-3">
          {session?.user?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.user.image} alt="" className="size-10 rounded-full" />
          ) : (
            <span className="flex size-10 items-center justify-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
              {(session?.user?.name ?? "?").slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <p className="text-sm font-medium text-foreground">{session?.user?.name ?? "Inconnu"}</p>
            <p className="text-xs text-foreground-subtle">{session?.user?.email ?? "Aucun e-mail enregistré"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Sécurité</CardTitle>
        <CardDescription>
          L&apos;accès à ce panneau est contrôlé par la variable
          d&apos;environnement{" "}
          <code className="text-xs">ALLOWED_DISCORD_IDS</code>, et non par un
          paramètre ici — personne ne peut donc s&apos;accorder l&apos;accès
          depuis le panneau. Modifie-la sur le serveur et redémarre pour
          changer qui peut se connecter.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Apparence</CardTitle>
        <CardDescription>
          Mode sombre uniquement pour l&apos;instant. Un thème clair n&apos;est pas encore implémenté.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Aucun canal de notification n&apos;est configuré pour l&apos;instant — ce
          panneau n&apos;envoie ni e-mails, ni webhooks, ni notifications push de lui-même.
        </CardDescription>
      </Card>
    </div>
  );
}
