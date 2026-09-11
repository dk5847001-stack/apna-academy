import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  Code,
  MenuBook,
  Refresh,
  School,
  Security,
  TrendingUp,
  Verified,
} from "@mui/icons-material";

import api from "../services/api";

const COURSE_APP_URL =
  import.meta.env.VITE_COURSE_URL || "http://localhost:5174";

const FALLBACK_THUMBNAIL =
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=85";

function getCourseThumbnail(course) {
  return (
    course?.thumbnailUrl ||
    course?.thumbnail ||
    course?.imageUrl ||
    FALLBACK_THUMBNAIL
  );
}

function getCoursePrice(course) {
  const price =
    course?.price ??
    course?.pricing?.price ??
    course?.amount ??
    0;

  return Number(price) > 0 ? `₹${Number(price).toLocaleString("en-IN")}` : "Free";
}

function getCourseSlug(course) {
  return course?.slug || course?._id || course?.id;
}

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [courseError, setCourseError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoadingCourses(true);
      setCourseError("");

      const response = await api.get("/courses");

      const payload = response?.data;

      const courseList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.courses)
          ? payload.courses
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.courses)
              ? payload.data.courses
              : [];

      setCourses(courseList);
    } catch (error) {
      console.error("Home courses fetch error:", error);

      setCourses([]);
      setCourseError(
        error?.response?.data?.message ||
          "Courses could not be loaded right now."
      );
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const featuredCourses = useMemo(() => {
    return courses
      .filter((course) => course?.isPublished !== false)
      .slice(0, 3);
  }, [courses]);

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-slate-50 blur-3xl" />

        <Container
          maxWidth="lg"
          className="relative"
          sx={{ py: { xs: 8, md: 12 } }}
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Hero Content */}
            <div>
              <Chip
                icon={<AutoAwesome fontSize="small" />}
                label="Practical learning for modern careers"
                size="small"
                className="mb-5 border border-blue-100 bg-blue-50 font-semibold text-blue-700"
              />

              <Typography
                component="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1.05,
                  fontSize: {
                    xs: "2.5rem",
                    sm: "3.5rem",
                    md: "4.35rem",
                  },
                }}
                className="max-w-4xl text-slate-950"
              >
                Learn skills that
                <span className="block text-blue-600">
                  move your career forward.
                </span>
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.12rem" },
                  lineHeight: 1.8,
                }}
                className="mt-6 max-w-2xl text-slate-600"
              >
                Build practical skills through structured courses,
                real-world projects and an outcome-focused learning
                experience designed for today's learners.
              </Typography>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  component={Link}
                  to="/courses"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  className="!rounded-xl !bg-blue-600 !px-6 !py-3 !font-bold !normal-case !shadow-none hover:!bg-blue-700"
                >
                  Explore Courses
                </Button>

                <Button
                  component={Link}
                  to="/about"
                  variant="outlined"
                  size="large"
                  className="!rounded-xl !border-slate-300 !px-6 !py-3 !font-bold !normal-case !text-slate-700 hover:!border-blue-300 hover:!bg-blue-50 hover:!text-blue-700"
                >
                  Why ApnaAcademy?
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Structured learning",
                  "Practical projects",
                  "Verified achievement",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-medium text-slate-600"
                  >
                    <CheckCircle
                      sx={{ fontSize: 18 }}
                      className="text-blue-600"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Side Card */}
            <div className="lg:pl-8">
              <Card
                elevation={0}
                className="overflow-hidden !rounded-3xl border !border-slate-200 !bg-slate-50"
              >
                <CardContent className="!p-6 sm:!p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-200">
                      <School />
                    </div>

                    <Chip
                      label="Learning Platform"
                      size="small"
                      className="!bg-white !font-semibold !text-slate-600"
                    />
                  </div>

                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 800 }}
                    className="mt-6 !text-slate-950"
                  >
                    Learn. Practice. Progress.
                  </Typography>

                  <Typography
                    sx={{ lineHeight: 1.75 }}
                    className="mt-3 !text-slate-600"
                  >
                    Everything you need to turn knowledge into practical
                    skills — organized in one focused learning journey.
                  </Typography>

                  <Divider className="!my-6" />

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: <MenuBook />,
                        title: "Structured",
                        text: "Course modules",
                      },
                      {
                        icon: <TrendingUp />,
                        title: "Progress",
                        text: "Track learning",
                      },
                      {
                        icon: <Verified />,
                        title: "Verified",
                        text: "Achievements",
                      },
                      {
                        icon: <Security />,
                        title: "Secure",
                        text: "Protected access",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="text-blue-600">{item.icon}</div>

                        <p className="mt-3 text-sm font-bold text-slate-900">
                          {item.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          VALUE STRIP
      ====================================================== */}
      <section className="border-b border-slate-100 bg-white">
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 6 } }}>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <Code />,
                title: "Learn by doing",
                text: "Focus on practical and applicable skills.",
              },
              {
                icon: <TrendingUp />,
                title: "Track your progress",
                text: "Keep your learning journey organized.",
              },
              {
                icon: <Verified />,
                title: "Build credibility",
                text: "Complete learning and earn achievements.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    {item.icon}
                  </div>

                  <div>
                    <p className="font-bold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {item.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================
          FEATURED COURSES
      ====================================================== */}
      <section className="bg-slate-50/70">
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Typography
                component="p"
                className="!font-bold !uppercase !tracking-[0.16em] !text-blue-600"
                sx={{ fontSize: "0.72rem" }}
              >
                Featured learning
              </Typography>

              <Typography
                component="h2"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                }}
                className="mt-2 !text-slate-950"
              >
                Start learning today
              </Typography>

              <Typography className="mt-2 !max-w-2xl !text-slate-600">
                Explore courses published on ApnaAcademy and choose the
                learning path that fits your goals.
              </Typography>
            </div>

            <Button
              component={Link}
              to="/courses"
              endIcon={<ArrowForward />}
              className="!w-fit !rounded-xl !font-bold !normal-case !text-blue-600 hover:!bg-blue-50"
            >
              View all courses
            </Button>
          </div>

          {courseError && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={fetchCourses}
                >
                  Retry
                </Button>
              }
              className="!mb-6 !rounded-2xl"
            >
              {courseError}
            </Alert>
          )}

          {loadingCourses ? (
            <Box className="flex min-h-60 items-center justify-center rounded-3xl border border-slate-200 bg-white">
              <Stack alignItems="center" spacing={2}>
                <CircularProgress
                  size={34}
                  thickness={4}
                  className="!text-blue-600"
                />
                <Typography className="!text-sm !font-medium !text-slate-500">
                  Loading courses...
                </Typography>
              </Stack>
            </Box>
          ) : featuredCourses.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <MenuBook />
              </div>

              <Typography
                variant="h6"
                sx={{ fontWeight: 800 }}
                className="mt-5 !text-slate-900"
              >
                Courses are coming soon
              </Typography>

              <Typography className="mx-auto mt-2 !max-w-lg !text-slate-500">
                We are preparing practical learning experiences for
                the platform. Please check back soon.
              </Typography>

              <Button
                component={Link}
                to="/courses"
                variant="outlined"
                className="!mt-6 !rounded-xl !border-slate-300 !font-bold !normal-case"
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.map((course) => {
                const slug = getCourseSlug(course);

                return (
                  <Card
                    key={course?._id || course?.id || slug}
                    elevation={0}
                    className="group flex h-full flex-col overflow-hidden !rounded-3xl !border !border-slate-200 !bg-white transition duration-200 hover:-translate-y-1 hover:!border-blue-200 hover:shadow-lg"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <img
                        src={getCourseThumbnail(course)}
                        alt={course?.title || "ApnaAcademy course"}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_THUMBNAIL;
                        }}
                      />

                      <div className="absolute left-4 top-4">
                        <Chip
                          label={getCoursePrice(course)}
                          size="small"
                          className="!bg-white !font-bold !text-slate-900 shadow-sm"
                        />
                      </div>
                    </div>

                    <CardContent className="flex flex-1 flex-col !p-6">
                      <Typography
                        component="h3"
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          lineHeight: 1.3,
                        }}
                        className="!text-slate-950"
                      >
                        {course?.title || "Untitled Course"}
                      </Typography>

                      <Typography
                        className="mt-3 line-clamp-3 !text-sm !leading-6 !text-slate-600"
                      >
                        {course?.shortDescription ||
                          course?.description ||
                          "Explore this course and build practical skills through structured learning."}
                      </Typography>

                      <div className="mt-auto pt-6">
                        <Button
                          component="a"
                          href={`${COURSE_APP_URL}/courses/${slug}`}
                          endIcon={<ArrowForward />}
                          fullWidth
                          variant="outlined"
                          className="!rounded-xl !border-slate-200 !py-2.5 !font-bold !normal-case !text-slate-800 hover:!border-blue-300 hover:!bg-blue-50 hover:!text-blue-700"
                        >
                          View Course
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </Container>
      </section>

      {/* =====================================================
          FINAL CTA
      ====================================================== */}
      <section className="bg-white">
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-7 sm:p-10 lg:p-12">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <Typography
                  component="h2"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    fontSize: { xs: "1.8rem", md: "2.3rem" },
                  }}
                  className="!text-slate-950"
                >
                  Ready to build your next skill?
                </Typography>

                <Typography
                  sx={{ lineHeight: 1.8 }}
                  className="mt-3 !text-slate-600"
                >
                  Explore the course catalog and start building skills
                  with a structured learning experience.
                </Typography>
              </div>

              <Button
                component={Link}
                to="/courses"
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                className="!w-fit !rounded-xl !bg-blue-600 !px-6 !py-3 !font-bold !normal-case !shadow-none hover:!bg-blue-700"
              >
                Explore Courses
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}