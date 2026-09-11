import {
  Close,
  FilterList,
  Search,
} from "@mui/icons-material";

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
    search.trim().length > 0 ||
    category !== "All Categories" ||
    level !== "All Levels";

  return (
    <section
      aria-label="Course filters"
      className="
        mb-8
        rounded-3xl
        border border-slate-200
        bg-white
        p-4
        shadow-sm
        sm:p-5
      "
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="min-w-0 flex-1">
          <TextField
            fullWidth
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
            autoComplete="off"
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
              [&_.MuiOutlinedInput-root]:!bg-slate-50
              [&_.MuiOutlinedInput-notchedOutline]:!border-slate-200
              [&_.MuiOutlinedInput-root:hover_.MuiOutlinedInput-notchedOutline]:!border-slate-300
              [&_.MuiOutlinedInput-root.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-500
              [&_.MuiInputBase-input]:!text-sm
              [&_.MuiInputBase-input]:!text-slate-900
              [&_.MuiInputBase-input::placeholder]:!text-slate-400
            "
          />
        </div>

        {/* Filters */}
        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          {/* Category */}
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
                !bg-slate-50
                !text-sm
                !text-slate-800
                [&_.MuiOutlinedInput-notchedOutline]:!border-slate-200
                hover:[&_.MuiOutlinedInput-notchedOutline]:!border-slate-300
                [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-500
                [&_.MuiSelect-icon]:!text-slate-500
              "
              MenuProps={{
                slotProps: {
                  paper: {
                    className:
                      "!mt-2 !rounded-2xl !border !border-slate-200 !bg-white !text-slate-800 !shadow-xl",
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
                    [&.Mui-selected]:!text-blue-700
                  "
                >
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Level */}
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
                !bg-slate-50
                !text-sm
                !text-slate-800
                [&_.MuiOutlinedInput-notchedOutline]:!border-slate-200
                hover:[&_.MuiOutlinedInput-notchedOutline]:!border-slate-300
                [&.Mui-focused_.MuiOutlinedInput-notchedOutline]:!border-blue-500
                [&_.MuiSelect-icon]:!text-slate-500
              "
              MenuProps={{
                slotProps: {
                  paper: {
                    className:
                      "!mt-2 !rounded-2xl !border !border-slate-200 !bg-white !text-slate-800 !shadow-xl",
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
                    [&.Mui-selected]:!text-blue-700
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

        {/* Reset */}
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
                !self-end
                !rounded-2xl
                !border
                !border-slate-200
                !bg-white
                !text-slate-500
                hover:!border-red-200
                hover:!bg-red-50
                hover:!text-red-600
                lg:!self-auto
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