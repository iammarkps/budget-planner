"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface TransactionParsingSkeletonProps {
  inputText: string;
  loadingMessage: string;
}

export function TransactionParsingSkeleton({
  inputText,
  loadingMessage,
}: TransactionParsingSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Optimistic echo of user input */}
      <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
        <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
          Processing
        </p>
        <p className="text-sm italic text-foreground/80">&ldquo;{inputText}&rdquo;</p>
      </div>

      {/* Skeleton parsed result */}
      <div className="rounded-md border p-3 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase">
          {loadingMessage}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {/* Type badge skeleton */}
          <Skeleton className="h-5 w-16 rounded-full" />
          {/* Amount skeleton */}
          <Skeleton className="h-5 w-24" />
          {/* Merchant skeleton */}
          <Skeleton className="h-4 w-20" />
          {/* Category skeleton */}
          <Skeleton className="h-5 w-16 rounded-full" />
          {/* Date skeleton */}
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      {/* Skeleton account/category selectors */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>

      {/* Skeleton buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
}
