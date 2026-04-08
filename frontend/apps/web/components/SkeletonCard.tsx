"use client";

export function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse">
      <div className="aspect-[4/3] bg-white/[0.04]" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded-lg w-full" />
        <div className="h-3 bg-white/[0.04] rounded-lg w-2/3" />
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="h-5 bg-white/[0.06] rounded-lg w-20" />
          <div className="h-8 bg-white/[0.04] rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex items-center gap-4 p-5 border-b border-white/[0.03] animate-pulse">
      <div className="w-11 h-11 rounded-xl bg-white/[0.05] flex-shrink-0" />
      <div className="flex-grow space-y-2">
        <div className="h-4 bg-white/[0.06] rounded w-1/2" />
        <div className="h-3 bg-white/[0.03] rounded w-1/3" />
      </div>
      <div className="h-4 bg-white/[0.06] rounded w-16" />
    </div>
  );
}

export function SkeletonLibraryCard() {
  return (
    <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/[0.02] animate-pulse flex flex-col">
      <div className="h-48 bg-white/[0.04]" />
      <div className="p-6 space-y-4 flex-grow">
        <div className="h-5 bg-white/[0.06] rounded-lg w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded-lg w-full" />
        <div className="h-3 bg-white/[0.04] rounded-lg w-2/3" />
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="h-10 bg-white/[0.05] rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
