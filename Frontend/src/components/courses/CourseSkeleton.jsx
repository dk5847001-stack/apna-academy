import { Box, Skeleton } from "@mui/material";

export default function CourseSkeleton() {
  return (
    <Box
      component="article"
      aria-label="Loading course"
      className="
        flex h-full flex-col overflow-hidden
        rounded-3xl
        border border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* Thumbnail */}
      <Skeleton
        variant="rectangular"
        animation="wave"
        className="
          !aspect-video
          !h-auto
          !w-full
          !bg-slate-100
        "
      />

      {/* Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Category / Level */}
        <div className="flex items-center gap-2">
          <Skeleton
            variant="rounded"
            animation="wave"
            width={78}
            height={24}
            className="!rounded-full !bg-slate-100"
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            width={62}
            height={24}
            className="!rounded-full !bg-slate-100"
          />
        </div>

        {/* Title */}
        <div className="mt-4 space-y-2">
          <Skeleton
            variant="rounded"
            animation="wave"
            height={20}
            width="88%"
            className="!bg-slate-100"
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            height={20}
            width="64%"
            className="!bg-slate-100"
          />
        </div>

        {/* Description */}
        <div className="mt-3 space-y-2">
          <Skeleton
            variant="rounded"
            animation="wave"
            height={12}
            width="100%"
            className="!bg-slate-100"
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            height={12}
            width="78%"
            className="!bg-slate-100"
          />
        </div>

        {/* Instructor */}
        <div className="mt-4 flex items-center gap-3">
          <Skeleton
            variant="circular"
            animation="wave"
            width={36}
            height={36}
            className="!bg-slate-100"
          />

          <div className="space-y-2">
            <Skeleton
              variant="rounded"
              animation="wave"
              width={60}
              height={9}
              className="!bg-slate-100"
            />

            <Skeleton
              variant="rounded"
              animation="wave"
              width={105}
              height={13}
              className="!bg-slate-100"
            />
          </div>
        </div>

        {/* Course Stats */}
        <div
          className="
            mt-4
            rounded-2xl
            border border-slate-100
            bg-slate-50
            px-3 py-3
          "
        >
          <div className="grid grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className={`
                  flex items-center gap-2 px-1
                  ${item === 1 ? "border-x border-slate-200 px-2" : ""}
                `}
              >
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={18}
                  height={18}
                  className="!bg-slate-200"
                />

                <div className="min-w-0 space-y-1.5">
                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={28}
                    height={12}
                    className="!bg-slate-200"
                  />

                  <Skeleton
                    variant="rounded"
                    animation="wave"
                    width={44}
                    height={8}
                    className="!bg-slate-200"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-end justify-between gap-3">
            <div className="space-y-2">
              <Skeleton
                variant="rounded"
                animation="wave"
                width={58}
                height={9}
                className="!bg-slate-100"
              />

              <Skeleton
                variant="rounded"
                animation="wave"
                width={76}
                height={20}
                className="!bg-slate-100"
              />
            </div>

            <Skeleton
              variant="rounded"
              animation="wave"
              width={104}
              height={40}
              className="!rounded-xl !bg-slate-100"
            />
          </div>
        </div>
      </div>
    </Box>
  );
}