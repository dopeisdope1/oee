import { Skeleton } from "@/components/ui/skeleton";

// Shown while any bot sub-page (Commandes, Rôles, Modération...) fetches
// live from the bot's own API — these calls can take a couple of seconds,
// never leave that gap silent.
export default function BotSectionLoading() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
