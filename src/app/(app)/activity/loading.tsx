import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-2 h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <div className="space-y-1 rounded-xl border border-border p-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
