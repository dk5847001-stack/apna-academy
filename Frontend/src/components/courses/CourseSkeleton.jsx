import { Skeleton } from "@mui/material";

function StatSkeleton({ divider = false }) {
  return (
    <div
      className={divider
        ? "flex min-w-0 items-center justify-center gap-0.5 border-x border-slate-200 px-1 py-1.5"
        : "flex min-w-0 items-center justify-center gap-0.5 px-1 py-1.5"}
    >
      <Skeleton
        variant="rounded"
        animation="wave"
        className="!h-3 !w-3 !rounded !bg-slate-200"
      />
      <Skeleton
        variant="rounded"
        animation="wave"
        width={18}
        className="!h-[8px] !rounded !bg-slate-200 sm:!h-[9px]"
      />
    </div>
  );
}

export default function CourseSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="
        group
        flex
        h-full
        min-w-0
        flex-col
        overflow-hidden
        rounded-lg
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <div className="relative block aspect-[16/8] overflow-hidden bg-slate-100">
        <Skeleton
          variant="rectangular"
          animation="wave"
          className="!absolute !inset-0 !h-full !w-full !bg-slate-100"
        />
        <Skeleton
          variant="rounded"
          animation="wave"
          width="24%"
          className="!absolute !left-1.5 !top-1.5 !h-5 !rounded-full !bg-white/80"
        />
      </div>

      <div className="flex flex-1 flex-col px-2.5 py-2.5 sm:px-3 sm:py-3">
        <div className="mb-1.5 flex min-w-0 gap-1">
          <Skeleton
            variant="rounded"
            animation="wave"
            width={64}
            className="!h-[18px] !rounded-full !bg-blue-50 sm:!h-5"
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            width={52}
            className="!h-[18px] !rounded-full !bg-slate-50 sm:!h-5"
          />
        </div>

        <div className="min-h-[30px] sm:min-h-[36px]">
          <Skeleton
            variant="rounded"
            animation="wave"
            width="92%"
            className="!h-[11px] !rounded !bg-slate-100 sm:!h-[14px]"
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            width="68%"
            className="!mt-1 !h-[11px] !rounded !bg-slate-100 sm:!h-[14px]"
          />
        </div>

        <div className="mt-1 min-h-[26px] sm:min-h-8">
          <Skeleton
            variant="rounded"
            animation="wave"
            width="100%"
            className="!h-[8px] !rounded !bg-slate-100 sm:!h-[10px]"
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            width="76%"
            className="!mt-1 !h-[8px] !rounded !bg-slate-100 sm:!h-[10px]"
          />
        </div>

        <div className="mt-1.5 flex min-w-0 items-center gap-1">
          <Skeleton
            variant="circular"
            animation="wave"
            className="!h-5 !w-5 !shrink-0 !bg-blue-100 sm:!h-6 sm:!w-6"
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            width="34%"
            className="!h-[8px] !rounded !bg-slate-100 sm:!h-[9px]"
          />
        </div>

        <div className="mt-2 grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          <StatSkeleton />
          <StatSkeleton divider />
          <StatSkeleton />
        </div>

        <div className="mt-2 flex items-center justify-between gap-1.5 border-t border-slate-100 pt-2">
          <Skeleton
            variant="rounded"
            animation="wave"
            width={42}
            className="!h-3 !rounded !bg-slate-100 sm:!h-4"
          />
          <Skeleton
            variant="rounded"
            animation="wave"
            className="!h-7 !w-[54px] !shrink-0 !rounded-md !bg-blue-100 sm:!h-8 sm:!w-[64px]"
          />
        </div>
      </div>
    </article>
  );
}
