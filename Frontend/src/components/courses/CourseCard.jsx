import { Link } from "react-router-dom";

function formatPrice(price) {
  if (price === 0) return "Free";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
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
  } = course;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:bg-white/[0.07]">
      {/* Featured Badge */}
      {isFeatured && (
        <div className="absolute left-4 top-4 z-10">
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/20 bg-amber-400/15 px-3 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur-md">
            <span>★</span>
            Featured
          </span>
        </div>
      )}

      {/* Thumbnail */}
      <Link
        to={`/courses/${slug}`}
        className="relative block aspect-video overflow-hidden"
      >
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src =
              "https://placehold.co/1280x720/0f172a/ffffff?text=ApnaAcademy";
          }}
        />

        {/* Thumbnail Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />

        {/* Category */}
        <div className="absolute bottom-4 left-4">
          <span className="rounded-full border border-white/15 bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {category}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Level + Language */}
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 font-medium capitalize text-cyan-300">
            {level}
          </span>

          <span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-400">
            {language}
          </span>
        </div>

        {/* Title */}
        <Link to={`/courses/${slug}`}>
          <h2 className="line-clamp-2 text-xl font-bold leading-tight text-white transition-colors duration-300 group-hover:text-cyan-300">
            {title}
          </h2>
        </Link>

        {/* Description */}
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
          {shortDescription}
        </p>

        {/* Instructor */}
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-cyan-400/20 to-blue-500/20">
            {instructor?.avatar ? (
              <img
                src={instructor.avatar}
                alt={instructor.name}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-cyan-300">
                {instructor?.name?.charAt(0)?.toUpperCase() || "A"}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-slate-500">
              Instructor
            </p>

            <p className="truncate text-sm font-medium text-slate-200">
              {instructor?.name || "ApnaAcademy"}
            </p>
          </div>
        </div>

        {/* Course Stats */}
        <div className="mt-5 grid grid-cols-3 gap-2 border-y border-white/10 py-4">
          <div>
            <p className="text-sm font-semibold text-white">
              {totalModules || 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Modules
            </p>
          </div>

          <div className="border-x border-white/10 px-2">
            <p className="text-sm font-semibold text-white">
              {totalVideos || 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Videos
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              {durationDays || 0}d
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Duration
            </p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="text-xs text-slate-500">
              Course price
            </p>

            <p className="mt-1 text-xl font-bold text-white">
              {formatPrice(price)}
            </p>
          </div>

          <Link
            to={`/courses/${slug}`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:scale-105 hover:shadow-cyan-400/25"
          >
            View Course
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}