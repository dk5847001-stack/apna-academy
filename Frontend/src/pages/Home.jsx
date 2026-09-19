import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  Code,
  Groups,
  MenuBook,
  PlayArrow,
  RocketLaunch,
  Security,
  Star,
  Verified,
  WorkspacePremium,
} from "@mui/icons-material";

import api from "../services/api";

const FALLBACK_THUMBNAIL =
  "https://placehold.co/1280x720/e2e8f0/334155?text=ApnaAcademy";

const COURSE_APP_URL =
  import.meta.env.VITE_COURSE_URL || "https://course.apnaacademy.me";

function formatPrice(price) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return "Free";
  }

  return `Γé╣${numericPrice.toLocaleString("en-IN")}`;
}

function getInstructorName(instructor) {
  if (!instructor) return "ApnaAcademy Instructor";

  if (typeof instructor === "string") {
    return instructor;
  }

  return (
    instructor.name ||
    instructor.fullName ||
    instructor.username ||
    "ApnaAcademy Instructor"
  );
}

function getInitial(name) {
  return (
    name?.trim()?.charAt(0)?.toUpperCase() ||
    "A"
  );
}

const features = [
  {
    icon: <MenuBook />,
    title: "Structured Learning",
    description:
      "Learn through carefully organized modules, lessons and practical learning paths.",
  },
  {
    icon: <Code />,
    title: "Practical Skills",
    description:
      "Focus on real-world skills, projects and hands-on learning instead of only theory.",
  },
  {
    icon: <Verified />,
    title: "Verified Achievement",
    description:
      "Complete your learning journey and earn verifiable digital certificates.",
  },
  {
    icon: <Security />,
    title: "Secure Platform",
    description:
      "Your account, purchases and learning progress are handled through secure systems.",
  },
];

const learningSteps = [
  {
    number: "01",
    title: "Choose a Course",
    description:
      "Explore practical courses designed around useful and career-focused skills.",
  },
  {
    number: "02",
    title: "Learn at Your Pace",
    description:
      "Follow structured modules and continue your learning from where you stopped.",
  },
  {
    number: "03",
    title: "Build & Complete",
    description:
      "Watch lessons, complete your learning journey and demonstrate your progress.",
  },
  {
    number: "04",
    title: "Earn Your Certificate",
    description:
      "Meet the course requirements and unlock your verified certificate.",
  },
];

function CoursePreviewCard({ course }) {
  const title = course?.title || "Learning Course";
  const instructor = getInstructorName(course?.instructor);
  const slug = course?.slug;

  const courseUrl = slug
    ? `${COURSE_APP_URL}/courses/${slug}`
    : COURSE_APP_URL;

  return (
    <Card
      elevation={0}
      className="
        group
        h-full
        overflow-hidden
        !rounded-2xl
        !border
        !border-slate-200
        !bg-white
        transition-all
        duration-200
        hover:-translate-y-1
        hover:!border-blue-200
        hover:shadow-xl
        hover:shadow-slate-200/60
      "
    >
      <Box className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={course?.thumbnail || FALLBACK_THUMBNAIL}
          alt={`${title} course`}
          loading="lazy"
          decoding="async"
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-300
            group-hover:scale-[1.03]
          "
          onError={(event) => {
            event.currentTarget.src = FALLBACK_THUMBNAIL;
          }}
        />

        {course?.isFeatured && (
          <Chip
            icon={<Star className="!text-[15px]" />}
            label="Featured"
            size="small"
            className="
              !absolute
              !left-3
              !top-3
              !bg-white
              !font-bold
              !text-blue-700
              !shadow-md
            "
          />
        )}
      </Box>

      <CardContent className="!p-4 sm:!p-5">
        <Stack spacing={1.25}>
          <div className="flex flex-wrap gap-2">
            {course?.category && (
              <Chip
                label={course.category}
                size="small"
                className="
                  !h-6
                  !rounded-lg
                  !bg-blue-50
                  !text-[11px]
                  !font-bold
                  !text-blue-700
                "
              />
            )}

            {course?.level && (
              <Chip
                label={String(course.level).replace(/[-_]/g, " ")}
                size="small"
                variant="outlined"
                className="
                  !h-6
                  !rounded-lg
                  !border-slate-200
                  !text-[11px]
                  !font-semibold
                  !capitalize
                  !text-slate-600
                "
              />
            )}
          </div>

          <Typography
            component="h3"
            className="
              !line-clamp-2
              !text-base
              !font-black
              !leading-6
              !text-slate-950
              sm:!text-lg
            "
          >
            {title}
          </Typography>

          <Typography
            component="p"
            className="
              !line-clamp-2
              !text-xs
              !leading-5
              !text-slate-500
              sm:!text-sm
            "
          >
            {course?.shortDescription ||
              course?.description ||
              "Build practical skills through structured learning."}
          </Typography>

          <div className="flex items-center gap-2 pt-1">
            <Avatar
              sx={{
                width: 28,
                height: 28,
                fontSize: 12,
              }}
              className="!bg-blue-100 !font-bold !text-blue-700"
            >
              {getInitial(instructor)}
            </Avatar>

            <Typography
              component="span"
              className="!truncate !text-xs !font-semibold !text-slate-600"
            >
              {instructor}
            </Typography>
          </div>

          <Divider className="!my-1 !border-slate-100" />

          <div className="flex items-center justify-between gap-3">
            <Typography
              component="span"
              className="!text-base !font-black !text-slate-950"
            >
              {formatPrice(course?.price)}
            </Typography>

            <Button
              href={courseUrl}
              variant="outlined"
              size="small"
              endIcon={<ArrowForward />}
              className="
                !rounded-xl
                !border-slate-200
                !px-3
                !py-2
                !text-xs
                !font-bold
                !normal-case
                !text-slate-700
                hover:!border-blue-300
                hover:!bg-blue-50
                hover:!text-blue-700
              "
            >
              View Course
            </Button>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const navigate = useNavigate();

  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchFeaturedCourses = async () => {
      try {
        setLoadingCourses(true);

        const response = await api.get("/courses");

        if (!mounted) return;

        const courses = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data?.courses)
          ? response.data.courses
          : [];

        const featured = courses.filter(
          (course) => course?.isFeatured
        );

        setFeaturedCourses(
          (featured.length > 0 ? featured : courses).slice(0, 3)
        );
      } catch (error) {
        console.error(
          "Home courses fetch error:",
          error
        );

        if (mounted) {
          setFeaturedCourses([]);
        }
      } finally {
        if (mounted) {
          setLoadingCourses(false);
        }
      }
    };

    fetchFeaturedCourses();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="overflow-hidden bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative border-b border-slate-200 bg-white">
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-72
            w-72
            rounded-full
            bg-blue-100/60
            blur-3xl
          "
        />

        <Container maxWidth="lg" className="relative">
          <div className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
            <div>
              <Chip
                icon={<AutoAwesome />}
                label="Learn ΓÇó Build ΓÇó Grow"
                className="
                  !mb-5
                  !rounded-full
                  !border
                  !border-blue-100
                  !bg-blue-50
                  !px-2
                  !font-bold
                  !text-blue-700
                "
              />

              <Typography
                component="h1"
                className="
                  !max-w-3xl
                  !text-4xl
                  !font-black
                  !leading-[1.08]
                  !tracking-tight
                  !text-slate-950
                  sm:!text-5xl
                  lg:!text-6xl
                "
              >
                Learn skills that
                <span className="block text-blue-600">
                  move your career forward.
                </span>
              </Typography>

              <Typography
                component="p"
                className="
                  !mt-5
                  !max-w-2xl
                  !text-base
                  !leading-7
                  !text-slate-600
                  sm:!text-lg
                "
              >
                ApnaAcademy helps you build practical,
                career-focused skills through structured
                courses, real-world learning and verified
                achievements.
              </Typography>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  component={RouterLink}
                  to="/courses"
                  className="
                    !rounded-xl
                    !bg-blue-600
                    !px-6
                    !py-3
                    !font-bold
                    !normal-case
                    !shadow-lg
                    !shadow-blue-600/20
                    hover:!bg-blue-700
                  "
                >
                  Explore Courses
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => navigate("/register")}
                  className="
                    !rounded-xl
                    !border-slate-200
                    !px-6
                    !py-3
                    !font-bold
                    !normal-case
                    !text-slate-700
                    hover:!border-blue-300
                    hover:!bg-blue-50
                    hover:!text-blue-700
                  "
                >
                  Start Learning
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
                {[
                  "Structured courses",
                  "Practical learning",
                  "Verified certificates",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="!text-[18px] !text-blue-600" />

                    <Typography
                      component="span"
                      className="!text-xs !font-semibold !text-slate-600 sm:!text-sm"
                    >
                      {item}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3 shadow-2xl shadow-slate-200/70 sm:p-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                    </div>

                    <Chip
                      label="Learning Dashboard"
                      size="small"
                      className="!h-6 !bg-blue-50 !text-[10px] !font-bold !text-blue-700"
                    />
                  </div>

                  <div className="p-5 sm:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Typography
                          component="p"
                          className="!text-xs !font-semibold !text-slate-500"
                        >
                          Your learning journey
                        </Typography>

                        <Typography
                          component="h2"
                          className="!mt-1 !text-xl !font-black !text-slate-950"
                        >
                          Keep learning.
                        </Typography>
                      </div>

                      <Avatar className="!bg-blue-600 !font-bold">
                        A
                      </Avatar>
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <Typography
                          component="span"
                          className="!text-xs !font-bold !text-slate-700"
                        >
                          Full Stack Development
                        </Typography>

                        <Typography
                          component="span"
                          className="!text-xs !font-black !text-blue-600"
                        >
                          68%
                        </Typography>
                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-[68%] rounded-full bg-blue-600" />
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <Typography
                          component="span"
                          className="!text-[11px] !font-medium !text-slate-500"
                        >
                          Continue your course
                        </Typography>

                        <PlayArrow className="!text-[18px] !text-blue-600" />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <RocketLaunch className="!text-blue-600" />

                        <Typography
                          component="p"
                          className="!mt-3 !text-xs !font-bold !text-slate-500"
                        >
                          Skills
                        </Typography>

                        <Typography
                          component="p"
                          className="!mt-1 !text-sm !font-black !text-slate-900"
                        >
                          Career Ready
                        </Typography>
                      </div>

                      <div className="rounded-2xl border border-slate-200 p-4">
                        <WorkspacePremium className="!text-blue-600" />

                        <Typography
                          component="p"
                          className="!mt-3 !text-xs !font-bold !text-slate-500"
                        >
                          Achievement
                        </Typography>

                        <Typography
                          component="p"
                          className="!mt-1 !text-sm !font-black !text-slate-900"
                        >
                          Verified
                        </Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                aria-hidden="true"
                className="
                  absolute
                  -bottom-4
                  -left-4
                  hidden
                  h-20
                  w-20
                  rounded-2xl
                  border
                  border-blue-100
                  bg-white
                  shadow-xl
                  sm:block
                "
              />
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          TRUST / VALUE
      ====================================================== */}

      <section className="border-b border-slate-200 bg-slate-50">
        <Container maxWidth="lg">
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  {feature.icon}
                </div>

                <Typography
                  component="h2"
                  className="!mt-4 !text-sm !font-black !text-slate-900"
                >
                  {feature.title}
                </Typography>

                <Typography
                  component="p"
                  className="!mt-2 !text-xs !leading-5 !text-slate-500 sm:!text-sm"
                >
                  {feature.description}
                </Typography>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================
    FEATURED COURSES
====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Typography
                  component="p"
                  className="!text-xs !font-black !uppercase !tracking-[0.18em] !text-blue-600"
                >
                  Featured learning
                </Typography>

                <Typography
                  component="h2"
                  className="!mt-2 !text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
                >
                  Explore courses built for practical skills.
                </Typography>

                <Typography
                  component="p"
                  className="!mt-3 !text-sm !leading-6 !text-slate-500 sm:!text-base"
                >
                  Discover structured courses designed to help you learn useful skills, build confidence and move closer to your career goals.
                </Typography>
              </div>

              <Button
                href="/courses"
                endIcon={<ArrowForward />}
                className="!w-fit !rounded-xl !px-3 !py-2 !font-bold !normal-case !text-blue-700 hover:!bg-blue-50"
              >
                View all courses
              </Button>
            </div>

            <div className="mt-8">
              {loadingCourses ? (
                <div className="flex min-h-40 items-center justify-center">
                  <CircularProgress size={28} />
                </div>
              ) : featuredCourses.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {featuredCourses.map((course) => (
                    <CoursePreviewCard
                      key={course?._id || course?.id || course?.slug}
                      course={course}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Typography
                    component="h3"
                    className="!text-base !font-black !text-slate-800"
                  >
                    Courses are being prepared.
                  </Typography>

                  <Typography
                    component="p"
                    className="!mt-2 !text-sm !text-slate-500"
                  >
                    Please check back soon for new learning opportunities.
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          LEARNING PROCESS
      ====================================================== */}

      <section className="border-b border-slate-200 bg-slate-50">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <Typography
                component="p"
                className="!text-xs !font-black !uppercase !tracking-[0.18em] !text-blue-600"
              >
                How it works
              </Typography>

              <Typography
                component="h2"
                className="!mt-2 !text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
              >
                A simple path from learning to achievement.
              </Typography>

              <Typography
                component="p"
                className="!mt-3 !text-sm !leading-6 !text-slate-500 sm:!text-base"
              >
                Follow a structured learning journey that keeps your progress clear and focused.
              </Typography>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {learningSteps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <Typography
                    component="span"
                    className="!text-xs !font-black !tracking-[0.18em] !text-blue-600"
                  >
                    {step.number}
                  </Typography>

                  <Typography
                    component="h3"
                    className="!mt-3 !text-base !font-black !text-slate-900"
                  >
                    {step.title}
                  </Typography>

                  <Typography
                    component="p"
                    className="!mt-2 !text-sm !leading-6 !text-slate-500"
                  >
                    {step.description}
                  </Typography>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="bg-white">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-blue-50 px-6 py-10 sm:px-10 sm:py-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-white/60 blur-3xl"
              />

              <div className="relative max-w-3xl">
                <Typography
                  component="p"
                  className="!text-xs !font-black !uppercase !tracking-[0.18em] !text-blue-700"
                >
                  Start your journey
                </Typography>

                <Typography
                  component="h2"
                  className="!mt-2 !text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
                >
                  Build skills that stay useful beyond the classroom.
                </Typography>

                <Typography
                  component="p"
                  className="!mt-4 !max-w-2xl !text-sm !leading-6 !text-slate-600 sm:!text-base"
                >
                  Explore practical learning paths, build your knowledge step by step and work toward verified achievements with ApnaAcademy.
                </Typography>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate("/courses")}
                    className="!rounded-xl !bg-blue-600 !px-5 !py-2.5 !font-bold !normal-case hover:!bg-blue-700"
                  >
                    Explore Courses
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() => navigate("/about")}
                    className="!rounded-xl !border-slate-200 !px-5 !py-2.5 !font-bold !normal-case !text-slate-700 hover:!border-blue-300 hover:!bg-white"
                  >
                    Learn About Us
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
