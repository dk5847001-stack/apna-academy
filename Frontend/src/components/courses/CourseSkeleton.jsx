export default function CourseSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/10">
      {/* Thumbnail Skeleton */}
      <div className="aspect-video animate-pulse bg-white/10" />

      <div className="p-5">
        {/* Category / Level */}
        <div className="flex gap-2">
          <div className="h-6 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/10" />
        </div>

        {/* Title */}
        <div className="mt-4 space-y-2">
          <div className="h-6 w-4/5 animate-pulse rounded-lg bg-white/10" />
          <div className="h-6 w-3/5 animate-pulse rounded-lg bg-white/10" />
        </div>

        {/* Description */}
        <div className="mt-4 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/10" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
        </div>

        {/* Instructor */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />

          <div className="space-y-2">
            <div className="h-2.5 w-16 animate-pulse rounded bg-white/10" />
            <div className="h-3 w-28 animate-pulse rounded bg-white/10" />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4">
          <div className="space-y-2">
            <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-white/10" />
          </div>

          <div className="space-y-2 border-x border-white/10 px-2">
            <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-white/10" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-8 animate-pulse rounded bg-white/10" />
            <div className="h-2.5 w-14 animate-pulse rounded bg-white/10" />
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-5 flex items-end justify-between">
          <div className="space-y-2">
            <div className="h-2.5 w-20 animate-pulse rounded bg-white/10" />
            <div className="h-5 w-20 animate-pulse rounded bg-white/10" />
          </div>

          <div className="h-10 w-28 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}