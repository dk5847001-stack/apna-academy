import { useMemo } from "react";

import {
  Avatar,
  Button,
  Chip,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  AutoAwesome,
  MenuBook,
  PlayArrow,
  Schedule,
  VideoLibrary,
} from "@mui/icons-material";

const COURSE_APP_URL =
  import.meta.env.VITE_COURSE_URL || "http://localhost:5174";

const FALLBACK_THUMBNAIL =
  "https://placehold.co/1280x720/e2e8f0/334155?text=ApnaAcademy";

/* =========================================================
   HELPERS
========================================================= */

function formatPrice(price) {
  if (
    price === undefined ||
    price === null ||
    price === ""
  ) {
    return "Free";
  }

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Free";
  }

  return `₹${numericPrice.toLocaleString("en-IN")}`;
}

function getInitial(name) {
  return (
    name?.trim()?.charAt(0)?.toUpperCase() || "A"
  );
}

function getLevelLabel(level) {
  if (!level) {
    return "All Levels";
  }

  return String(level)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function getCourseUrl(slug) {
  if (!slug) {
    return COURSE_APP_URL;
  }

  return `${COURSE_APP_URL}/courses/${slug}`;
}

/* =========================================================
   COURSE CARD
========================================================= */

export default function CourseCard({ course }) {
  const {
    title,
    slug,
    shortDescription,
    thumbnail,
    category,
    level,
    language,
    instructor,
    price,
    durationDays,
    totalModules,
    totalVideos,
    isFeatured,
  } = course || {};

  const courseUrl = useMemo(
    () => getCourseUrl(slug),
    [slug]
  );

  return (
    <article
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
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-blue-200
        hover:shadow-md
      "
    >
      {/* =====================================================
          THUMBNAIL
      ====================================================== */}

      <a
        href={courseUrl}
        aria-label={`View ${title || "course"}`}
        className="
          relative
          block
          aspect-[16/8]
          overflow-hidden
          bg-slate-100
        "
      >
        <img
          src={thumbnail || FALLBACK_THUMBNAIL}
          alt={
            title
              ? `${title} course thumbnail`
              : "ApnaAcademy course"
          }
          loading="lazy"
          decoding="async"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-300
            group-hover:scale-[1.02]
          "
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src =
              FALLBACK_THUMBNAIL;
          }}
        />

        {/* Light overlay */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/20
            to-transparent
          "
        />

        {/* Featured */}

        {isFeatured && (
          <div className="absolute left-1.5 top-1.5">
            <Chip
              icon={
                <AutoAwesome
                  sx={{
                    fontSize: 11,
                  }}
                />
              }
              label="Featured"
              size="small"
              className="
                !h-5
                !bg-white
                !px-0
                !text-[7px]
                !font-bold
                !text-slate-800
                !shadow-sm
              "
            />
          </div>
        )}

        {/* Category */}

        {category && !isFeatured && (
          <div className="absolute left-1.5 top-1.5">
            <Chip
              label={category}
              size="small"
              className="
                !h-5
                !max-w-[75%]
                !bg-white/95
                !px-0
                !text-[7px]
                !font-bold
                !text-slate-700
                !shadow-sm
              "
            />
          </div>
        )}

        {/* Play button */}

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            opacity-0
            transition-opacity
            duration-200
            group-hover:opacity-100
          "
        >
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              bg-white
              text-blue-600
              shadow-lg
            "
          >
            <PlayArrow
              sx={{
                fontSize: 18,
              }}
            />
          </div>
        </div>
      </a>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          px-2.5
          py-2.5
          sm:px-3
          sm:py-3
        "
      >
        {/* =================================================
            LEVEL / LANGUAGE
        ================================================= */}

        <div
          className="
            mb-1.5
            flex
            min-w-0
            gap-1
          "
        >
          <Chip
            label={getLevelLabel(level)}
            size="small"
            variant="outlined"
            className="
              !h-[18px]
              !max-w-[65%]
              !border-blue-200
              !bg-blue-50
              !px-0
              !text-[7px]
              !font-bold
              !text-blue-700
              sm:!h-5
              sm:!text-[8px]
            "
          />

          {language && (
            <Chip
              label={language}
              size="small"
              variant="outlined"
              className="
                !h-[18px]
                !max-w-[35%]
                !border-slate-200
                !bg-slate-50
                !px-0
                !text-[7px]
                !font-medium
                !text-slate-500
                sm:!h-5
                sm:!text-[8px]
              "
            />
          )}
        </div>

        {/* =================================================
            TITLE
        ====================================================== */}

        <a
          href={courseUrl}
          className="
            block
            no-underline
          "
        >
          <Typography
            component="h3"
            className="
              line-clamp-2
              !text-[11px]
              !font-extrabold
              !leading-[15px]
              !tracking-tight
              !text-slate-900
              group-hover:!text-blue-700
              sm:!text-[14px]
              sm:!leading-[18px]
            "
          >
            {title || "Untitled Course"}
          </Typography>
        </a>

        {/* =================================================
            DESCRIPTION
        ====================================================== */}

        <Typography
          component="p"
          className="
            mt-1
            line-clamp-2
            !text-[8px]
            !leading-[13px]
            !text-slate-500
            sm:!text-[10px]
            sm:!leading-4
          "
        >
          {shortDescription ||
            "Practical learning designed for real-world skills."}
        </Typography>

        {/* =================================================
            INSTRUCTOR
        ================================================= */}

        <div
          className="
            mt-1.5
            flex
            min-w-0
            items-center
            gap-1
          "
        >
          <Avatar
            src={instructor?.avatar || undefined}
            alt={
              instructor?.name ||
              "ApnaAcademy instructor"
            }
            slotProps={{
              img: {
                loading: "lazy",
              },
            }}
            className="
              !h-5
              !w-5
              !shrink-0
              !bg-blue-100
              !text-[7px]
              !font-bold
              !text-blue-700
              sm:!h-6
              sm:!w-6
              sm:!text-[8px]
            "
          >
            {getInitial(instructor?.name)}
          </Avatar>

          <Typography
            component="span"
            className="
              min-w-0
              truncate
              !text-[8px]
              !font-semibold
              !text-slate-600
              sm:!text-[9px]
            "
          >
            {instructor?.name || "ApnaAcademy"}
          </Typography>
        </div>

        {/* =================================================
            STATS
        ====================================================== */}

        <div
          className="
            mt-2
            grid
            grid-cols-3
            overflow-hidden
            rounded-md
            border
            border-slate-200
            bg-slate-50
          "
        >
          {/* Modules */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-0.5
              px-1
              py-1.5
            "
          >
            <MenuBook
              sx={{
                fontSize: 12,
              }}
              className="!text-blue-600"
            />

            <Typography
              component="span"
              className="
                truncate
                !text-[8px]
                !font-extrabold
                !text-slate-800
                sm:!text-[9px]
              "
            >
              {totalModules || 0}
            </Typography>
          </div>

          {/* Videos */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-0.5
              border-x
              border-slate-200
              px-1
              py-1.5
            "
          >
            <VideoLibrary
              sx={{
                fontSize: 12,
              }}
              className="!text-indigo-600"
            />

            <Typography
              component="span"
              className="
                truncate
                !text-[8px]
                !font-extrabold
                !text-slate-800
                sm:!text-[9px]
              "
            >
              {totalVideos || 0}
            </Typography>
          </div>

          {/* Duration */}

          <div
            className="
              flex
              min-w-0
              items-center
              justify-center
              gap-0.5
              px-1
              py-1.5
            "
          >
            <Schedule
              sx={{
                fontSize: 12,
              }}
              className="!text-violet-600"
            />

            <Typography
              component="span"
              className="
                truncate
                !text-[8px]
                !font-extrabold
                !text-slate-800
                sm:!text-[9px]
              "
            >
              {durationDays || 0}d
            </Typography>
          </div>
        </div>

        {/* =================================================
            PRICE + CTA
        ====================================================== */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-between
            gap-1.5
            border-t
            border-slate-100
            pt-2
          "
        >
          {/* Price */}

          <Typography
            component="p"
            className="
              min-w-0
              truncate
              !text-xs
              !font-extrabold
              !leading-4
              !text-slate-950
              sm:!text-sm
            "
          >
            {formatPrice(price)}
          </Typography>

          {/* CTA */}

          <Button
            component="a"
            href={courseUrl}
            variant="contained"
            endIcon={
              <ArrowForward
                sx={{
                  fontSize: {
                    xs: 11,
                    sm: 13,
                  },
                }}
              />
            }
            className="
              !min-h-7
              !shrink-0
              !rounded-md
              !bg-blue-600
              !px-2
              !py-1
              !text-[8px]
              !font-bold
              !normal-case
              !leading-none
              !text-white
              !shadow-none
              hover:!bg-blue-700
              sm:!min-h-8
              sm:!px-2.5
              sm:!text-[10px]
            "
          >
            View
          </Button>
        </div>
      </div>
    </article>
  );
}
