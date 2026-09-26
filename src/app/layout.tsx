import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-provider";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Bot Panel",
  description: "Tableau de bord central pour gérer tes bots Discord.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased" data-theme="dark">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
