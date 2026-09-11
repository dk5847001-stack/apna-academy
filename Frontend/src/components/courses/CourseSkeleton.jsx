import {
  Box,
  Skeleton,
} from "@mui/material";

export default function CourseSkeleton() {
  return (
    <Box
      component="article"
      className="
        group relative flex h-full flex-col overflow-hidden
        rounded-[1.75rem]
        border border-white/10
        bg-white/[0.035]
        shadow-2xl shadow-black/20
        backdrop-blur-xl
      "
    >
      {/* =========================================================
          THUMBNAIL
      ========================================================= */}
      <Skeleton
        variant="rectangular"
        animation="wave"
        className="
          !h-auto
          !aspect-video
          !w-full
          !transform-none
          !bg-white/[0.07]
        "
      />

      {/* =========================================================
          CONTENT
      ========================================================= */}
      <div className="p-5">

        {/* =======================================================
            LEVEL + LANGUAGE
        ======================================================= */}
        <div className="flex gap-2">
          <Skeleton
            variant="rounded"
            animation="wave"
            width={92}
            height={26}
            className="!bg-white/[0.07]"
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            width={68}
            height={26}
            className="!bg-white/[0.07]"
          />
        </div>

        {/* =======================================================
            TITLE
        ======================================================= */}
        <div className="mt-4 space-y-2">

          <Skeleton
            variant="rounded"
            animation="wave"
            height={24}
            width="82%"
            className="!bg-white/[0.07]"
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            height={24}
            width="62%"
            className="!bg-white/[0.07]"
          />

        </div>

        {/* =======================================================
            DESCRIPTION
        ======================================================= */}
        <div className="mt-4 space-y-2">

          <Skeleton
            variant="rounded"
            animation="wave"
            height={12}
            width="100%"
            className="!bg-white/[0.07]"
          />

          <Skeleton
            variant="rounded"
            animation="wave"
            height={12}
            width="84%"
            className="!bg-white/[0.07]"
          />

        </div>

        {/* =======================================================
            INSTRUCTOR
        ======================================================= */}
        <div className="mt-5 flex items-center gap-3">

          <Skeleton
            variant="circular"
            animation="wave"
            width={40}
            height={40}
            className="!bg-white/[0.07]"
          />

          <div className="space-y-2">

            <Skeleton
              variant="rounded"
              animation="wave"
              width={62}
              height={10}
              className="!bg-white/[0.07]"
            />

            <Skeleton
              variant="rounded"
              animation="wave"
              width={112}
              height={14}
              className="!bg-white/[0.07]"
            />

          </div>

        </div>

        {/* =======================================================
            COURSE STATS
        ======================================================= */}
        <div
          className="
            mt-5
            rounded-2xl
            border border-white/10
            bg-black/10
            px-3
            py-4
          "
        >
          <div className="grid grid-cols-3">

            {/* Modules */}
            <div className="flex items-center gap-2 px-1">

              <Skeleton
                variant="rounded"
                animation="wave"
                width={18}
                height={18}
                className="!bg-white/[0.07]"
              />

              <div className="space-y-2">
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={28}
                  height={14}
                  className="!bg-white/[0.07]"
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={48}
                  height={9}
                  className="!bg-white/[0.07]"
                />
              </div>

            </div>

            {/* Videos */}
            <div className="flex items-center gap-2 border-x border-white/10 px-3">

              <Skeleton
                variant="rounded"
                animation="wave"
                width={18}
                height={18}
                className="!bg-white/[0.07]"
              />

              <div className="space-y-2">
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={28}
                  height={14}
                  className="!bg-white/[0.07]"
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={44}
                  height={9}
                  className="!bg-white/[0.07]"
                />
              </div>

            </div>

            {/* Duration */}
            <div className="flex items-center gap-2 px-3">

              <Skeleton
                variant="rounded"
                animation="wave"
                width={18}
                height={18}
                className="!bg-white/[0.07]"
              />

              <div className="space-y-2">
                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={30}
                  height={14}
                  className="!bg-white/[0.07]"
                />

                <Skeleton
                  variant="rounded"
                  animation="wave"
                  width={50}
                  height={9}
                  className="!bg-white/[0.07]"
                />
              </div>

            </div>

          </div>
        </div>

        {/* =======================================================
            DIVIDER
        ======================================================= */}
        <div className="mt-5 border-t border-white/10" />

        {/* =======================================================
            PRICE + BUTTON
        ======================================================= */}
        <div className="mt-5 flex items-end justify-between gap-4">

          <div className="space-y-2">

            <Skeleton
              variant="rounded"
              animation="wave"
              width={78}
              height={10}
              className="!bg-white/[0.07]"
            />

            <Skeleton
              variant="rounded"
              animation="wave"
              width={82}
              height={22}
              className="!bg-white/[0.07]"
            />

          </div>

          <Skeleton
            variant="rounded"
            animation="wave"
            width={120}
            height={42}
            className="!bg-white/[0.07]"
          />

        </div>

      </div>
    </Box>
  );
}