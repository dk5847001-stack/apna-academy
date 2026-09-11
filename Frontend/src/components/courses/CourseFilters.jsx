import {
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@mui/material";

import {
  Close,
  FilterList,
  Search,
} from "@mui/icons-material";

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
    <section
      className="
        mb-8
        rounded-[1.75rem]
        border border-white/10
        bg-white/[0.035]
        p-4
        shadow-2xl shadow-black/20
        backdrop-blur-xl
        sm:p-5
      "
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

        {/* =======================================================
            SEARCH
        ======================================================= */}
        <div className="min-w-0 flex-1">

          <TextField
            fullWidth
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search courses..."
            aria-label="Search courses"
            variant="outlined"
            size="medium"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search
                      fontSize="small"
                      className="!text-slate-500"
                    />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                minHeight: "48px",
                borderRadius: "16px",
              },
            }}
            className="
              [&_.MuiOutlinedInput-root]:!bg-white
              [&_.MuiOutlinedInput-notchedOutline]:!border-slate-200
              [&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:!border-slate-300
              [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-400
              [&_.MuiInputBase-input]:!text-sm
              [&_.MuiInputBase-input]:!text-slate-900
              [&_.MuiInputBase-input::placeholder]:!text-slate-500
            "
          />

        </div>

        {/* =======================================================
            FILTER CONTROLS
        ======================================================= */}
        <div className="flex flex-col gap-3 sm:flex-row">

          {/* =====================================================
              CATEGORY
          ===================================================== */}
          <FormControl
            size="medium"
            className="w-full sm:w-52"
          >
            <InputLabel
              className="
                !text-slate-500
                [&.Mui-focused]:!text-blue-600
              "
            >
              Category
            </InputLabel>

            <Select
              value={category}
              label="Category"
              onChange={(event) =>
                setCategory(event.target.value)
              }
              startAdornment={
                <InputAdornment position="start">
                  <FilterList
                    fontSize="small"
                    className="!text-slate-500"
                  />
                </InputAdornment>
              }
              className="
                !min-h-12
                !rounded-2xl
                !bg-white
                !text-sm
                !text-slate-800
                [&_.MuiOutlinedInput-notchedOutline]:!border-slate-200
                hover:[&_.MuiOutlinedInput-notchedOutline]:!border-slate-300
                [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-400
                [&_.MuiSelect-icon]:!text-slate-500
              "
              MenuProps={{
                slotProps: {
                  paper: {
                    className:
                      "!mt-2 !rounded-2xl !border !border-slate-200 !bg-white !text-slate-800 !shadow-2xl",
                  },
                },
              }}
            >
              {categories.map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                  className="
                    !text-sm
                    hover:!bg-slate-50
                    [&.Mui-selected]:!bg-blue-50
                  "
                >
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* =====================================================
              LEVEL
          ===================================================== */}
          <FormControl
            size="medium"
            className="w-full sm:w-44"
          >
            <InputLabel
              className="
                !text-slate-500
                [&.Mui-focused]:!text-blue-600
              "
            >
              Level
            </InputLabel>

            <Select
              value={level}
              label="Level"
              onChange={(event) =>
                setLevel(event.target.value)
              }
              className="
                !min-h-12
                !rounded-2xl
                !bg-white
                !text-sm
                !text-slate-800
                [&_.MuiOutlinedInput-notchedOutline]:!border-slate-200
                hover:[&_.MuiOutlinedInput-notchedOutline]:!border-slate-300
                [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-400
                [&_.MuiSelect-icon]:!text-slate-500
              "
              MenuProps={{
                slotProps: {
                  paper: {
                    className:
                      "!mt-2 !rounded-2xl !border !border-slate-200 !bg-white !text-slate-800 !shadow-2xl",
                  },
                },
              }}
            >
              {levels.map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                  className="
                    !text-sm
                    capitalize
                    hover:!bg-slate-50
                    [&.Mui-selected]:!bg-blue-50
                  "
                >
                  {item === "All Levels"
                    ? item
                    : item.replace("-", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

        </div>

        {/* =======================================================
            RESET
        ======================================================= */}
        {hasFilters && (
          <Tooltip title="Reset filters" arrow>
            <IconButton
              type="button"
              onClick={onReset}
              aria-label="Reset course filters"
              className="
                !h-12
                !w-12
                !shrink-0
                !rounded-2xl
                !border
                !border-slate-200
                !bg-white/5
                !text-slate-500
                hover:!border-red-200
                hover:!bg-red-50
                hover:!text-red-600
              "
            >
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

      </div>
    </section>
  );
}