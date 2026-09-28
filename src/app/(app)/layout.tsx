import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listBotSummaries } from "@/server/queries/bot-summaries";
import { listNotifications } from "@/server/queries/notifications";
import { SidebarProvider } from "@/components/layout/sidebar-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [bots, notifications] = await Promise.all([listBotSummaries(), listNotifications()]);

  return (
    <SidebarProvider>
      <CommandPalette bots={bots} />
      <div className="flex h-dvh">
        <Sidebar bots={bots} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            user={{ name: session.user.name ?? null, image: session.user.image ?? null }}
            notifications={notifications}
          />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
