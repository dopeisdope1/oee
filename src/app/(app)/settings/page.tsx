import { auth } from "@/auth";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";

export default async function GlobalSettingsPage() {
  const session = await auth();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-foreground-muted">Panel-wide account and security settings.</p>
      </div>

      <Card>
        <CardTitle>Account</CardTitle>
        <CardDescription>Signed in via Discord OAuth2.</CardDescription>
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
            <p className="text-sm font-medium text-foreground">{session?.user?.name ?? "Unknown"}</p>
            <p className="text-xs text-foreground-subtle">{session?.user?.email ?? "No email on file"}</p>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Security</CardTitle>
        <CardDescription>
          Access to this panel is controlled by the{" "}
          <code className="text-xs">ALLOWED_DISCORD_IDS</code> environment
          variable, not by a setting here — so no one can grant themselves
          access from inside the panel. Edit it on the server and restart to
          change who can sign in.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Dark mode only, for now. A light theme isn&apos;t implemented yet.
        </CardDescription>
      </Card>

      <Card>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          No notification channel is configured yet — this panel doesn&apos;t send
          emails, webhooks, or push alerts on its own.
        </CardDescription>
      </Card>
    </div>
  );
}
