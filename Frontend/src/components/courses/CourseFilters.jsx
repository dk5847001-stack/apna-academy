import { Search, SlidersHorizontal, X } from "lucide-react";

const categories = [
  "All Categories",
  "Web Development",
  "Data Science",
  "AI & ML",
  "DSA",
  "Programming",
  "Finance",
];

const levels = [
  "All Levels",
  "beginner",
  "intermediate",
  "advanced",
  "all-levels",
];

export default function CourseFilters({
  search,
  setSearch,
  category,
  setCategory,
  level,
  setLevel,
  onReset,
}) {
  const hasFilters =
    search.trim() ||
    category !== "All Categories" ||
    level !== "All Levels";

  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={19}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
            className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative">
            <SlidersHorizontal
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              aria-label="Filter by category"
              className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-10 text-sm text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 sm:w-52"
            >
              {categories.map((item) => (
                <option
                  key={item}
                  value={item}
                  className="bg-slate-900 text-white"
                >
                  {item}
                </option>
              ))}
            </select>
          </div>

          <select
            value={level}
            onChange={(event) =>
              setLevel(event.target.value)
            }
            aria-label="Filter by level"
            className="h-12 w-full appearance-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10 sm:w-44"
          >
            {levels.map((item) => (
              <option
                key={item}
                value={item}
                className="bg-slate-900 text-white"
              >
                {item === "All Levels"
                  ? item
                  : item.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-slate-300 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
          >
            <X size={17} />
            Reset
          </button>
        )}
      </div>
    </section>
  );
}