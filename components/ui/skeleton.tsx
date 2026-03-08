import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-neutral-200", className)}
      {...props}
    />
  );
}

// Business card skeleton – matches the listRow variant used on the search page
function BusinessCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-2xl border border-neutral-100 shadow-sm">
      {/* Left: image + profile info (~1/3) */}
      <div className="flex sm:flex-col gap-3 sm:w-[32%] min-w-0">
        <Skeleton className="w-40 sm:w-56 aspect-video  flex-shrink-0" />
        <div className="flex-1 min-w-0 sm:flex-none space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-8 ml-1" />
          </div>
        </div>
      </div>

      {/* Right: availability strip placeholder (~2/3) */}
      <div className="flex-1 min-w-0 border-t sm:border-t-0 sm:border-l border-neutral-100 pt-3 sm:pt-0 sm:pl-4">
        {/* Week navigation placeholder */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
        {/* Day column headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-3 w-full mx-auto" />
              <Skeleton className="h-2.5 w-3/4 mx-auto" />
            </div>
          ))}
        </div>
        {/* Time slot rows */}
        {[1, 2, 3].map((row) => (
          <div key={row} className="grid grid-cols-7 gap-1 mb-1.5">
            {[1, 2, 3, 4, 5, 6, 7].map((col) => (
              <Skeleton
                key={col}
                className="h-6 w-full rounded-lg"
              />
            ))}
          </div>
        ))}
        {/* "See more slots" link placeholder */}
        <div className="flex justify-center mt-2">
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
    </div>
  );
}

// Service item skeleton
function ServiceItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border ">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="text-right space-y-2">
        <Skeleton className="h-6 w-16 ml-auto" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

// Review card skeleton
function ReviewCardSkeleton() {
  return (
    <div className="border-b pb-4">
      <div className="flex items-center gap-3 mb-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4 mt-2" />
    </div>
  );
}

// Booking card skeleton
function BookingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="flex">
        <Skeleton className="w-24 h-32" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  BusinessCardSkeleton,
  ServiceItemSkeleton,
  ReviewCardSkeleton,
  BookingCardSkeleton
};
