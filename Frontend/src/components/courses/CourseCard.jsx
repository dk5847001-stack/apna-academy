import { Link } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
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

function formatPrice(price) {
  const numericPrice = Number(price) || 0;

  if (numericPrice === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericPrice);
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
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

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

  const courseUrl = `/courses/${slug}`;

  return (
    <article
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[1.75rem]
        border
        border-white/10
        bg-white/[0.035]
        shadow-2xl
        shadow-black/20
        backdrop-blur-xl
        transition-all
        duration-500
        hover:-translate-y-2
        hover:border-cyan-400/25
        hover:bg-white/[0.055]
        hover:shadow-cyan-950/20
      "
    >
      {/* =====================================================
          FEATURED BADGE
      ===================================================== */}

      {isFeatured && (
        <div className="absolute left-4 top-4 z-20">
          <Chip
            icon={
              <AutoAwesome fontSize="small" />
            }
            label="Featured"
            size="small"
            variant="outlined"
            className="
              !border
              !border-amber-300/20
              !bg-slate-950/80
              !font-semibold
              !text-amber-200
              !backdrop-blur-md
            "
          />
        </div>
      )}

      {/* =====================================================
          COURSE THUMBNAIL
      ===================================================== */}

      <Link
        to={courseUrl}
        aria-label={`View ${title || "course"}`}
        className="
          relative
          block
          aspect-video
          overflow-hidden
        "
      >
        <img
          src={
            thumbnail ||
            "https://placehold.co/1280x720/0f172a/ffffff?text=ApnaAcademy"
          }
          alt={
            title
              ? `${title} course thumbnail`
              : "ApnaAcademy course"
          }
          loading="lazy"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-700
            group-hover:scale-105
          "
          onError={(event) => {
            event.currentTarget.onerror = null;

            event.currentTarget.src =
              "https://placehold.co/1280x720/0f172a/ffffff?text=ApnaAcademy";
          }}
        />

        {/* Thumbnail overlay */}
        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-slate-950
            via-slate-950/20
            to-transparent
            opacity-90
          "
        />

        {/* =================================================
            HOVER PLAY BUTTON
        ================================================= */}

        <div
          className="
            absolute
            inset-0
            flex
            items-center
            justify-center
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        >
          <Box
            className="
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-slate-950/75
              text-white
              shadow-2xl
              backdrop-blur-md
            "
          >
            <PlayArrow fontSize="large" />
          </Box>
        </div>

        {/* Category */}
        {category && (
          <div className="absolute bottom-4 left-4">
            <Chip
              label={category}
              size="small"
              variant="outlined"
              className="
                !border
                !border-white/10
                !bg-slate-950/80
                !font-semibold
                !text-white
                !backdrop-blur-md
              "
            />
          </div>
        )}
      </Link>

      {/* =====================================================
          CARD CONTENT
      ===================================================== */}

      <div className="flex flex-1 flex-col p-5">

        {/* Level + Language */}
        <div className="mb-3 flex flex-wrap items-center gap-2">

          <Chip
            label={getLevelLabel(level)}
            size="small"
            className="
              !border-cyan-400/10
              !bg-cyan-400/10
              !font-medium
              !text-cyan-300
            "
          />

          {language && (
            <Chip
              label={language}
              size="small"
              className="
                !border-white/5
                !bg-white/5
                !text-slate-400
              "
            />
          )}

        </div>

        {/* =================================================
            TITLE
        ================================================= */}

        <Link
          to={courseUrl}
          className="block"
        >
          <Typography
            component="h2"
            className="
              line-clamp-2
              !text-xl
              !font-bold
              !leading-tight
              !tracking-tight
              !text-white
              transition-colors
              duration-300
              group-hover:!text-cyan-300
            "
          >
            {title || "Untitled Course"}
          </Typography>
        </Link>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <Typography
          component="p"
          className="
            mt-3
            line-clamp-2
            !text-sm
            !leading-6
            !text-slate-400
          "
        >
          {shortDescription ||
            "Start learning practical skills with ApnaAcademy."}
        </Typography>

        {/* =================================================
            INSTRUCTOR
        ================================================= */}

        <div className="mt-5 flex items-center gap-3">

          <Avatar
            src={instructor?.avatar || undefined}
            alt={
              instructor?.name ||
              "ApnaAcademy instructor"
            }
            imgProps={{
              loading: "lazy",
            }}
            className="
              !h-10
              !w-10
              !border
              !border-white/10
              !bg-gradient-to-br
              !from-cyan-400/20
              !to-blue-500/20
              !text-sm
              !font-bold
              !text-cyan-300
            "
          >
            {getInitial(instructor?.name)}
          </Avatar>

          <div className="min-w-0">

            <Typography
              component="p"
              className="
                !text-[11px]
                !font-medium
                !uppercase
                !tracking-wider
                !text-slate-500
              "
            >
              Instructor
            </Typography>

            <Typography
              component="p"
              className="
                truncate
                !text-sm
                !font-semibold
                !text-slate-200
              "
            >
              {instructor?.name ||
                "ApnaAcademy"}
            </Typography>

          </div>

        </div>

        {/* =================================================
            COURSE STATS
        ================================================= */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-white/10
            bg-black/10
            px-3
            py-4
          "
        >
          <div className="grid grid-cols-3">

            {/* Modules */}
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
                px-1
              "
            >
              <MenuBook
                fontSize="small"
                className="!shrink-0 !text-cyan-400/70"
              />

              <div className="min-w-0">

                <Typography
                  component="p"
                  className="
                    !text-sm
                    !font-bold
                    !text-white
                  "
                >
                  {totalModules || 0}
                </Typography>

                <Typography
                  component="p"
                  className="
                    !text-[10px]
                    !text-slate-500
                  "
                >
                  Modules
                </Typography>

              </div>
            </div>

            {/* Videos */}
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
                border-x
                border-white/10
                px-3
              "
            >
              <VideoLibrary
                fontSize="small"
                className="!shrink-0 !text-blue-400/70"
              />

              <div className="min-w-0">

                <Typography
                  component="p"
                  className="
                    !text-sm
                    !font-bold
                    !text-white
                  "
                >
                  {totalVideos || 0}
                </Typography>

                <Typography
                  component="p"
                  className="
                    !text-[10px]
                    !text-slate-500
                  "
                >
                  Videos
                </Typography>

              </div>
            </div>

            {/* Duration */}
            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
                px-3
              "
            >
              <Schedule
                fontSize="small"
                className="!shrink-0 !text-violet-400/70"
              />

              <div className="min-w-0">

                <Typography
                  component="p"
                  className="
                    !text-sm
                    !font-bold
                    !text-white
                  "
                >
                  {durationDays || 0}d
                </Typography>

                <Typography
                  component="p"
                  className="
                    !text-[10px]
                    !text-slate-500
                  "
                >
                  Duration
                </Typography>

              </div>
            </div>

          </div>
        </div>

        <Divider className="!my-5 !border-white/10" />

        {/* =================================================
            PRICE + CTA
        ================================================= */}

        <div
          className="
            mt-auto
            flex
            items-end
            justify-between
            gap-4
          "
        >

          {/* Price */}
          <div className="min-w-0">

            <Typography
              component="p"
              className="
                !text-[11px]
                !font-medium
                !uppercase
                !tracking-wider
                !text-slate-500
              "
            >
              Course Price
            </Typography>

            <Typography
              component="p"
              className="
                mt-1
                !text-xl
                !font-black
                !tracking-tight
                !text-white
              "
            >
              {formatPrice(price)}
            </Typography>

          </div>

          {/* View Course */}
          <Button
            component={Link}
            to={courseUrl}
            variant="contained"
            endIcon={<ArrowForward fontSize="small" />}
            className="
              !shrink-0
              !rounded-xl
              !bg-gradient-to-r
              !from-cyan-400
              !to-blue-500
              !px-4
              !py-2.5
              !text-sm
              !font-bold
              !normal-case
              !text-slate-950
              !shadow-lg
              !shadow-cyan-500/10
              transition-all
              duration-300
              hover:!from-cyan-300
              hover:!to-blue-400
              hover:!shadow-cyan-400/20
            "
          >
            View Course
          </Button>

        </div>

      </div>
    </article>
  );
}