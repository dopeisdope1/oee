import { Skeleton } from "@/components/ui/skeleton";

// Generic fallback for any (app) page without its own loading.tsx.
export default function AppLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}
