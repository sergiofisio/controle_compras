import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingPurchases() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-10 w-48" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    </div>
  );
}
