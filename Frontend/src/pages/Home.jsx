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
        !border-blue-100/80
        !bg-white/95
        transition-all
        duration-200
        hover:-translate-y-1
        hover:!border-blue-200
        hover:shadow-2xl
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
    <main className="relative min-h-screen overflow-hidden bg-[#f7faff] text-slate-900">
      {/* =====================================================
          PAGE AMBIENT BACKGROUND + HERO
      ====================================================== */}

      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-[-8rem] top-[24rem] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-[20rem] left-[25%] h-72 w-72 rounded-full bg-cyan-100/35 blur-3xl" />
      </div>

      <section className="relative border-b border-blue-100/80 bg-transparent">
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
            bg-blue-200/45
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
              <div className="rounded-[2rem] border border-white/90 bg-white/70 p-3 shadow-[0_24px_70px_rgba(37,99,235,0.12)] backdrop-blur-xl sm:p-4">
                <div className="overflow-hidden rounded-[1.5rem] border border-blue-100/80 bg-white/90 shadow-inner">
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

      <section className="border-b border-blue-100/70 bg-white/65 backdrop-blur-sm">
        <Container maxWidth="lg">
          <div className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-blue-100/80 bg-white/85 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
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

      <section className="border-b border-blue-100/70 bg-white/80 backdrop-blur-sm">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <Typography
                  component="p"
                  className="!inline-flex !rounded-full !border !border-blue-100 !bg-blue-50 !px-3 !py-1 !text-xs !font-black !uppercase !tracking-[0.16em] !text-blue-700"
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

      <section className="border-b border-blue-100/70 bg-white/60 backdrop-blur-sm">
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
                  className="rounded-2xl border border-blue-100/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50"
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
          TEAM
      ====================================================== */}

      <section className="relative overflow-hidden border-b border-blue-100/70 bg-transparent">
        <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-8 h-64 w-64 rounded-full bg-violet-100/40 blur-3xl" />

        <Container maxWidth="lg" className="relative">
          <div className="py-14 sm:py-18 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-2 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 sm:text-[11px]">
                <span className="h-px w-8 bg-gradient-to-r from-transparent to-blue-300 sm:w-14" />
                <span>Meet Our Team</span>
                <span className="h-px w-8 bg-gradient-to-l from-transparent to-violet-300 sm:w-14" />
              </div>

              <Typography
                component="h2"
                className="!text-3xl !font-black !leading-[1.08] !tracking-[-0.04em] !text-slate-950 sm:!text-5xl"
              >
                The People Behind{" "}
                <span className="relative inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Your Success
                  <span className="absolute -bottom-1 left-1/2 h-1 w-[84%] -translate-x-1/2 rounded-full bg-blue-600 sm:-bottom-2" />
                </span>
              </Typography>

              <Typography
                component="p"
                className="!mx-auto !mt-4 !max-w-2xl !text-xs !leading-6 !text-slate-500 sm:!text-base sm:!leading-7"
              >
                A passionate team bringing education, technology and learner-first thinking together.
              </Typography>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {[
                {
                  name: "Harry Ali Khan",
                  role: "Team Management",
                  bio: "Focused on building a structured learning environment where students can learn, practice and grow with confidence.",
                  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-ZG7Em57ag-WD1-dICUGdF7lH1wJ-kYAdQ8XgryiMag&s=10",
                  color: "blue",
                  note: "Build\nLearn\nGrow",
                  tags: ["Strategy", "Product"],
                },
                {
                  name: "Shradha Khapra",
                  role: "Team Director",
                  bio: "Creates engaging learning experiences with a strong focus on clarity, accessibility and practical technology skills.",
                  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDE-SJTtsq58khCMm50OCqxyL5HHjlwROvDfsOUcF6Ww&s=10",
                  color: "violet",
                  note: "Learn\nCreate\nInspire",
                  tags: ["Design", "Creativity"],
                },
                {
                  name: "Alakh Panday",
                  role: "Team Leader",
                  bio: "Brings a practical, learner-first approach to technical education, systems and scalable digital learning.",
                  image: "https://www.cioandleader.com/wp-content/uploads/2024/09/Alakh-Pandey-Founder-and-CEO-Physics-Wallah-PW.jpg",
                  color: "emerald",
                  note: "Learn\nSolve\nGrow",
                  tags: ["Data", "Technology"],
                },
                {
                  name: "Sneha Patel",
                  role: "Data Analytics",
                  bio: "Turns learning data and user insights into thoughtful improvements for a smoother and more useful student experience.",
                  image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGWPFfG2wBAHhPdOXIyP3JZGnHogJLqntEnjBrdcQnSQ&s=10",
                  color: "orange",
                  note: "Create\nConnect\nImpact",
                  tags: ["Content", "Community"],
                },
              ].map((member) => {
                const palette = {
                  blue: { border: "border-blue-200", wash: "from-blue-50 via-white to-indigo-50", blob: "bg-blue-200/65", tag: "bg-blue-600", text: "text-blue-700", line: "from-blue-500 to-indigo-500" },
                  violet: { border: "border-violet-200", wash: "from-violet-50 via-white to-fuchsia-50", blob: "bg-violet-200/65", tag: "bg-violet-600", text: "text-violet-700", line: "from-violet-500 to-fuchsia-500" },
                  emerald: { border: "border-emerald-200", wash: "from-emerald-50 via-white to-teal-50", blob: "bg-emerald-200/65", tag: "bg-emerald-700", text: "text-emerald-700", line: "from-emerald-500 to-teal-500" },
                  orange: { border: "border-orange-200", wash: "from-orange-50 via-white to-amber-50", blob: "bg-orange-200/65", tag: "bg-orange-500", text: "text-orange-700", line: "from-orange-400 to-amber-500" },
                }[member.color];

                return (
                  <article
                    key={member.name}
                    className={`group relative overflow-hidden rounded-[1.4rem] border bg-white shadow-[0_10px_30px_rgba(15,23,42,.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(15,23,42,.11)] ${palette.border}`}
                  >
                    <div className={`relative h-[142px] overflow-hidden bg-gradient-to-br ${palette.wash} sm:h-[174px]`}>
                      <div className={`absolute -left-5 top-5 h-28 w-36 rotate-[-8deg] rounded-[52%_48%_45%_55%] ${palette.blob} sm:left-1 sm:top-6 sm:h-40 sm:w-48`} />
                      <div className="absolute left-6 top-8 h-20 w-24 rotate-[8deg] rounded-[55%_45%_50%_50%] bg-white/65 sm:left-10 sm:top-11 sm:h-28 sm:w-32" />

                      <div className={`absolute right-3 top-3 z-[3] max-w-[34%] whitespace-pre-line text-right font-serif text-[7px] font-bold italic leading-[1.05] sm:right-5 sm:top-5 sm:text-[10px] ${palette.text}`}>
                        {member.note}
                        <span className={`mt-1 ml-auto block h-0.5 w-7 rounded-full bg-gradient-to-r ${palette.line} sm:w-10`} />
                      </div>

                      <div className="absolute bottom-0 left-2 z-[1] h-[108px] w-[65%] overflow-hidden rounded-[48%_52%_38%_34%] sm:left-4 sm:h-[145px] sm:w-[68%]">
                        <img
                          src={member.image}
                          alt={`${member.name} — ${member.role}`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.035]"
                        />
                      </div>

                      <span className={`absolute bottom-2 left-2 z-[2] inline-flex max-w-[92%] items-center rounded-full px-2 py-1 text-[6px] font-black uppercase tracking-[0.045em] text-white shadow-lg sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1.5 sm:text-[8px] ${palette.tag}`}>
                        {member.role}
                      </span>
                    </div>

                    <div className="relative px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-3.5">
                      <div className={`absolute right-3 top-4 h-0.5 w-8 rounded-full bg-gradient-to-r ${palette.line} sm:right-4 sm:w-10`} />

                      <Typography
                        component="h3"
                        className="!pr-9 !text-[12px] !font-black !leading-tight !text-slate-950 sm:!text-lg"
                      >
                        {member.name}
                      </Typography>

                      <Typography
                        component="p"
                        className={`!mt-0.5 !text-[6.5px] !font-black !uppercase !tracking-[0.13em] sm:!text-[9px] ${palette.text}`}
                      >
                        {member.role}
                      </Typography>

                      <Typography
                        component="p"
                        className="!mt-1.5 !line-clamp-2 !text-[8px] !leading-4 !text-slate-500 sm:!mt-2 sm:!text-[10px] sm:!leading-5"
                      >
                        {member.bio}
                      </Typography>

                      <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
                        {member.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`rounded-full bg-white px-1.5 py-0.5 text-[6px] font-bold shadow-sm ring-1 ring-slate-100 sm:px-2 sm:py-1 sm:text-[8px] ${palette.text}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 text-center text-[9px] font-bold tracking-wide text-slate-400 sm:mt-8 sm:text-xs">
              <span>Different Skills</span>
              <span className="mx-2 text-blue-400">•</span>
              <span>Same Goal</span>
              <span className="mx-2 text-violet-400">•</span>
              <span>Your Growth</span>
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
            <div className="relative overflow-hidden rounded-[2rem] border border-blue-100/80 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-10 shadow-[0_24px_70px_rgba(37,99,235,0.10)] sm:px-10 sm:py-14">
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
