import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AutoAwesome,
  FilterAltOff,
  Search,
  Tune,
} from "@mui/icons-material";
import api from "../services/api";
import CourseCard from "../components/CourseCard";
import CourseNavigation from "../components/CourseNavigation";

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const getLevel = (course) =>
  course?.level
    ? String(course.level).replace(/[-_]/g, " ")
    : "All Levels";
const getCategory = (course) => course?.category || "Other";

const publishCourseCatalog = (courses) => {
  window.dispatchEvent(
    new CustomEvent("apnaacademy-course-catalog-loaded", {
      detail: Array.isArray(courses) ? courses : [],
    }),
  );
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [sort, setSort] = useState("featured");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/courses");
      const data = response?.data?.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(response?.data?.courses)
          ? response.data.courses
          : Array.isArray(data?.courses)
            ? data.courses
            : [];
      setCourses(list);
      publishCourseCatalog(list);
    } catch (err) {
      console.error("Course catalog fetch error:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load courses right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.get("/courses");
        if (!mounted) return;

        const data = response?.data?.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(response?.data?.courses)
            ? response.data.courses
            : Array.isArray(data?.courses)
              ? data.courses
              : [];

        setCourses(list);
        publishCourseCatalog(list);
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load courses right now. Please try again.",
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(
    () =>
      [...new Set(courses.map(getCategory).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      ),
    [courses],
  );

  const levels = useMemo(
    () =>
      [...new Set(courses.map(getLevel).filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      ),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const query = normalizeText(search);

    const result = courses.filter((course) => {
      const instructor =
        typeof course?.instructor === "string"
          ? course.instructor
          : course?.instructor?.name || course?.instructor?.fullName;

      const matchesSearch =
        !query ||
        [
          course?.title,
          course?.shortDescription,
          course?.description,
          getCategory(course),
          instructor,
        ].some((value) => normalizeText(value).includes(query));

      const matchesCategory =
        category === "all" ||
        normalizeText(getCategory(course)) === normalizeText(category);

      const matchesLevel =
        level === "all" || normalizeText(getLevel(course)) === normalizeText(level);

      return matchesSearch && matchesCategory && matchesLevel;
    });

    if (sort === "price-low") {
      result.sort((a, b) => Number(a?.price || 0) - Number(b?.price || 0));
    }
    if (sort === "price-high") {
      result.sort((a, b) => Number(b?.price || 0) - Number(a?.price || 0));
    }
    if (sort === "newest") {
      result.sort(
        (a, b) =>
          new Date(b?.createdAt || 0).getTime() -
          new Date(a?.createdAt || 0).getTime(),
      );
    }
    if (sort === "featured") {
      result.sort(
        (a, b) =>
          Number(Boolean(b?.isFeatured)) - Number(Boolean(a?.isFeatured)),
      );
    }

    return result;
  }, [courses, search, category, level, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setLevel("all");
    setSort("featured");
  };

  const hasActiveFilters =
    Boolean(search.trim()) ||
    category !== "all" ||
    level !== "all" ||
    sort !== "featured";

  return (
    <CourseNavigation>
      <main className="min-h-screen bg-white text-slate-900" aria-label="ApnaAcademy course catalog">
        <section
          aria-labelledby="course-catalog-title"
          className="border-b border-slate-200 bg-slate-50/70"
        >
          <Container maxWidth="lg">
            <div className="py-10 sm:py-14 lg:py-16">
              <div className="max-w-3xl">
                <Chip
                  icon={<AutoAwesome />}
                  label="Learning Library"
                  size="small"
                  className="!rounded-full !bg-blue-50 !font-bold !text-blue-700"
                />
                <Typography
                  id="course-catalog-title"
                  component="h1"
                  className="!mt-4 !text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl lg:!text-5xl"
                >
                  Explore courses built{" "}
                  <span className="text-blue-600">for practical growth.</span>
                </Typography>
                <Typography
                  component="p"
                  className="!mt-4 !max-w-2xl !text-sm !leading-7 !text-slate-600 sm:!text-base"
                >
                  Discover structured courses designed to help you learn useful
                  skills, build practical knowledge and move closer to your goals.
                </Typography>
              </div>

              <div className="mt-7">
                <TextField
                  fullWidth
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search courses, skills, topics..."
                  aria-label="Search courses"
                  InputProps={{
                    startAdornment: <Search className="mr-2 !text-slate-400" />,
                  }}
                  className="!rounded-2xl !bg-white"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                    },
                  }}
                />
              </div>
            </div>
          </Container>
        </section>

        <section
          aria-labelledby="course-filters-title"
          className="border-b border-slate-200 bg-white"
        >
          <Container maxWidth="lg">
            <div className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <Tune className="!text-[20px] !text-blue-600" />
                <Typography
                  id="course-filters-title"
                  component="span"
                  className="!text-sm !font-black !text-slate-900"
                >
                  Find your course
                </Typography>
                <Chip
                  label={`${filteredCourses.length} ${
                    filteredCourses.length === 1 ? "course" : "courses"
                  }`}
                  size="small"
                  className="!ml-1 !bg-slate-100 !font-bold !text-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[650px]" aria-label="Course catalog filters">
                <FormControl fullWidth size="small">
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={category}
                    label="Category"
                    onChange={(event) => setCategory(event.target.value)}
                    className="!rounded-xl"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={level}
                    label="Level"
                    onChange={(event) => setLevel(event.target.value)}
                    className="!rounded-xl"
                  >
                    <MenuItem value="all">All Levels</MenuItem>
                    {levels.map((item) => (
                      <MenuItem key={item} value={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sort}
                    label="Sort By"
                    onChange={(event) => setSort(event.target.value)}
                    className="!rounded-xl"
                  >
                    <MenuItem value="featured">Featured</MenuItem>
                    <MenuItem value="newest">Newest</MenuItem>
                    <MenuItem value="price-low">Price: Low to High</MenuItem>
                    <MenuItem value="price-high">Price: High to Low</MenuItem>
                  </Select>
                </FormControl>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pb-5" aria-label="Active course filters">
                {search.trim() && (
                  <Chip
                    label={`Search: ${search}`}
                    size="small"
                    onDelete={() => setSearch("")}
                    className="!bg-blue-50 !font-semibold !text-blue-700"
                  />
                )}
                {category !== "all" && (
                  <Chip
                    label={`Category: ${category}`}
                    size="small"
                    onDelete={() => setCategory("all")}
                    className="!bg-blue-50 !font-semibold !text-blue-700"
                  />
                )}
                {level !== "all" && (
                  <Chip
                    label={`Level: ${level}`}
                    size="small"
                    onDelete={() => setLevel("all")}
                    className="!bg-blue-50 !font-semibold !text-blue-700"
                  />
                )}
                <Button
                  size="small"
                  startIcon={<FilterAltOff />}
                  onClick={clearFilters}
                  className="!rounded-lg !font-bold !normal-case !text-slate-500"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </Container>
        </section>

        <section
          id="course-catalog"
          aria-labelledby="available-courses-title"
          className="bg-white py-9 sm:py-12"
        >
          <Container maxWidth="lg">
            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center" role="status" aria-live="polite">
                <Stack spacing={2} alignItems="center">
                  <CircularProgress size={34} />
                  <Typography
                    component="p"
                    className="!text-sm !font-semibold !text-slate-500"
                  >
                    Loading courses...
                  </Typography>
                </Stack>
              </div>
            ) : error ? (
              <div className="mx-auto max-w-2xl" role="alert">
                <Alert
                  severity="error"
                  className="!rounded-2xl"
                  action={
                    <Button
                      size="small"
                      onClick={fetchCourses}
                      className="!font-bold !normal-case"
                    >
                      Retry
                    </Button>
                  }
                >
                  {error}
                </Alert>
              </div>
            ) : filteredCourses.length > 0 ? (
              <>
                <div className="mb-7 flex items-end justify-between gap-4">
                  <div>
                    <Typography
                      id="available-courses-title"
                      component="h2"
                      className="!text-xl !font-black !text-slate-950 sm:!text-2xl"
                    >
                      Available Courses
                    </Typography>
                    <Typography
                      component="p"
                      className="!mt-1 !text-xs !text-slate-500 sm:!text-sm"
                    >
                      Choose a course and start building practical skills.
                    </Typography>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course?._id || course?.id || course?.slug}
                      course={course}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm">
                  <Search />
                </div>
                <Typography
                  id="available-courses-title"
                  component="h2"
                  className="!mt-5 !text-lg !font-black !text-slate-950"
                >
                  No courses found
                </Typography>
                <Typography
                  component="p"
                  className="!mt-2 !text-sm !leading-6 !text-slate-500"
                >
                  Try changing your search or filters to find available courses.
                </Typography>
                {hasActiveFilters && (
                  <Button
                    variant="contained"
                    startIcon={<FilterAltOff />}
                    onClick={clearFilters}
                    className="!mt-5 !rounded-xl !bg-blue-600 !font-bold !normal-case hover:!bg-blue-700"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </Container>
        </section>

        <section aria-labelledby="course-catalog-cta-title" className="border-t border-slate-200 bg-slate-50 py-12">
          <Container maxWidth="md">
            <div className="rounded-3xl border border-blue-100 bg-blue-50 px-6 py-9 text-center sm:px-10">
              <Typography
                id="course-catalog-cta-title"
                component="h2"
                className="!text-2xl !font-black !text-slate-950"
              >
                Your next skill starts here.
              </Typography>
              <Typography
                component="p"
                className="!mx-auto !mt-2 !max-w-xl !text-sm !leading-6 !text-slate-600"
              >
                Explore the catalog, choose the right course and continue your
                learning journey.
              </Typography>
            </div>
          </Container>
        </section>
      </main>
    </CourseNavigation>
  );
}
