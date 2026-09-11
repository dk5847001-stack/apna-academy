import { Link } from "react-router-dom";

import {
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  EmojiEvents,
  Groups,
  PlayArrow,
  RocketLaunch,
  School,
  Security,
  TrendingUp,
  Verified,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

const highlights = [
  {
    icon: School,
    title: "Practical Learning",
    description:
      "Learn through structured courses, practical lessons, and skill-focused learning experiences.",
  },
  {
    icon: Verified,
    title: "Verified Achievement",
    description:
      "Build your learning journey toward meaningful and verifiable digital achievements.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth",
    description:
      "Develop practical skills that can help you move confidently toward your career goals.",
  },
  {
    icon: Security,
    title: "Secure Platform",
    description:
      "A modern learning platform designed with secure authentication and protected course access.",
  },
];

const values = [
  {
    icon: School,
    title: "Structured Learning",
    description:
      "Follow organized courses and modules so your learning journey remains clear and focused.",
  },
  {
    icon: TrendingUp,
    title: "Continuous Progress",
    description:
      "Track your learning progress and keep moving forward with a consistent learning routine.",
  },
  {
    icon: Groups,
    title: "Student First",
    description:
      "The platform is designed around the needs, goals, and learning experience of students.",
  },
  {
    icon: RocketLaunch,
    title: "Career Ready",
    description:
      "Focus on practical skills that can help learners prepare for real-world opportunities.",
  },
];

const trustPoints = [
  "Structured course modules",
  "Practical skill development",
  "Progress-focused learning",
  "Secure authentication",
  "Verified digital achievements",
  "Responsive learning experience",
];

function StatCard({ icon, value, label }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0">
          <Typography className="!text-sm !font-black !text-slate-900">
            {value}
          </Typography>

          <Typography className="!mt-0.5 !text-xs !leading-5 !text-slate-500">
            {label}
          </Typography>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, title, description }) {
  return (
    <Card
      elevation={0}
      className="!h-full !rounded-3xl !border !border-slate-200 !bg-white"
    >
      <CardContent className="!p-7 sm:!p-9">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <Typography
          component="p"
          className="!mt-6 !text-xs !font-extrabold !uppercase !tracking-[0.16em] !text-blue-600"
        >
          {label}
        </Typography>

        <Typography
          component="h2"
          className="!mt-3 !text-2xl !font-black !leading-tight !text-slate-950 sm:!text-3xl"
        >
          {title}
        </Typography>

        <Typography className="!mt-4 !text-sm !leading-7 !text-slate-600 sm:!text-base">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function About() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <Container maxWidth="lg">
          <div className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
            {/* LEFT */}

            <div>
              <Chip
                icon={<AutoAwesome fontSize="small" />}
                label="About ApnaAcademy"
                variant="outlined"
                className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
              />

              <Typography
                component="h1"
                className="!mt-6 !max-w-4xl !text-4xl !font-black !leading-tight !tracking-tight !text-slate-950 sm:!text-5xl lg:!text-6xl"
              >
                Learn today.
                <span className="block text-blue-600">
                  Build your future.
                </span>
              </Typography>

              <Typography
                component="p"
                className="!mt-6 !max-w-2xl !text-base !leading-8 !text-slate-600 sm:!text-lg"
              >
                ApnaAcademy is a modern learning platform focused on helping
                students develop practical skills through structured,
                accessible, and outcome-oriented digital learning experiences.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                className="mt-8"
              >
                <Button
                  component={Link}
                  to="/courses"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  className="!rounded-xl !bg-blue-600 !px-6 !py-3 !font-bold !normal-case !shadow-sm hover:!bg-blue-700"
                >
                  Explore Courses
                </Button>

                <Button
                  component={Link}
                  to="/contact"
                  variant="outlined"
                  size="large"
                  className="!rounded-xl !border-slate-300 !px-6 !py-3 !font-bold !normal-case !text-slate-700 hover:!border-blue-300 hover:!bg-blue-50"
                >
                  Contact Us
                </Button>
              </Stack>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3">
                {[
                  "Practical Learning",
                  "Student Focused",
                  "Career Ready",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600"
                  >
                    <CheckCircle className="!text-[18px] !text-blue-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}

            <Card
              elevation={0}
              className="!rounded-3xl !border !border-slate-200 !bg-slate-50 !shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            >
              <CardContent className="!p-6 sm:!p-8">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Box className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
                      <School />
                    </Box>

                    <div>
                      <Typography className="!text-sm !font-black !text-slate-900">
                        ApnaAcademy
                      </Typography>

                      <Typography className="!text-xs !text-slate-500">
                        Digital Learning Platform
                      </Typography>
                    </div>
                  </div>

                  <Verified className="!text-blue-600" />
                </div>

                <Divider className="!my-6 !border-slate-200" />

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={<PlayArrow />}
                    value="Learn"
                    label="Practical Lessons"
                  />

                  <StatCard
                    icon={<TrendingUp />}
                    value="Grow"
                    label="Career Skills"
                  />

                  <StatCard
                    icon={<EmojiEvents />}
                    value="Achieve"
                    label="Digital Recognition"
                  />

                  <StatCard
                    icon={<Groups />}
                    value="Connect"
                    label="Learning Community"
                  />
                </div>

                <Box className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <AutoAwesome
                      fontSize="small"
                      className="!mt-0.5 !text-blue-600"
                    />

                    <Typography className="!text-sm !leading-6 !text-slate-600">
                      A learning experience designed around progress,
                      practical skills, and continuous improvement.
                    </Typography>
                  </div>
                </Box>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      {/* =====================================================
          MISSION + VISION
      ====================================================== */}

      <section className="bg-slate-50">
        <Container maxWidth="lg">
          <div className="py-16 sm:py-20">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <Chip
                label="Our Purpose"
                variant="outlined"
                className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
              />

              <Typography
                component="h2"
                className="!mt-4 !text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
              >
                Creating a better learning journey
              </Typography>

              <Typography className="!mt-4 !text-sm !leading-7 !text-slate-600 sm:!text-base">
                ApnaAcademy brings structured learning, practical skills,
                measurable progress, and digital achievements together in one
                modern platform.
              </Typography>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <InfoCard
                icon={<WorkspacePremium />}
                label="Our Mission"
                title="Make meaningful learning more accessible."
                description="Our goal is to create a learning environment where students can discover useful skills, follow structured learning paths, track their progress, and build confidence through practical learning."
              />

              <InfoCard
                icon={<RocketLaunch />}
                label="Our Vision"
                title="Build a better digital learning journey."
                description="We envision a platform where technology, structured education, and practical experiences come together to help learners continuously improve and prepare for real-world opportunities."
              />
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          WHY APNAACADEMY
      ====================================================== */}

      <section className="bg-white">
        <Container maxWidth="lg">
          <div className="py-16 sm:py-20">
            <div className="max-w-2xl">
              <Chip
                label="Why ApnaAcademy"
                size="small"
                variant="outlined"
                className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
              />

              <Typography
                component="h2"
                className="!mt-4 !text-3xl !font-black !tracking-tight !text-slate-950 sm:!text-4xl"
              >
                Everything focused around your learning journey.
              </Typography>

              <Typography
                component="p"
                className="!mt-4 !text-sm !leading-7 !text-slate-600 sm:!text-base"
              >
                From structured modules to progress tracking, ApnaAcademy is
                designed to keep learning simple, focused, and engaging.
              </Typography>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <Card
                    key={item.title}
                    elevation={0}
                    className="!h-full !rounded-2xl !border !border-slate-200 !bg-white !shadow-sm !transition-shadow !duration-200 hover:!border-blue-200 hover:!shadow-lg"
                  >
                    <CardContent className="!p-6">
                      <Box className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon />
                      </Box>

                      <Typography
                        component="h3"
                        className="!mt-5 !text-lg !font-black !text-slate-900"
                      >
                        {item.title}
                      </Typography>

                      <Typography
                        component="p"
                        className="!mt-3 !text-sm !leading-6 !text-slate-600"
                      >
                        {item.description}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          VALUES
      ====================================================== */}

      <section className="bg-slate-50">
        <Container maxWidth="lg">
          <div className="py-16 sm:py-20">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div>
                <Chip
                  label="What We Believe"
                  size="small"
                  variant="outlined"
                  className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
                />

                <Typography
                  component="h2"
                  className="!mt-4 !text-3xl !font-black !text-slate-950 sm:!text-4xl"
                >
                  Built around learners.
                </Typography>

                <Typography
                  component="p"
                  className="!mt-4 !text-sm !leading-7 !text-slate-600 sm:!text-base"
                >
                  We believe effective learning should be structured,
                  practical, measurable, and accessible.
                </Typography>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {values.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Icon />
                        </div>

                        <div>
                          <Typography className="!text-base !font-black !text-slate-900">
                            {item.title}
                          </Typography>

                          <Typography className="!mt-2 !text-sm !leading-6 !text-slate-600">
                            {item.description}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          TRUST
      ====================================================== */}

      <section className="bg-white">
        <Container maxWidth="lg">
          <div className="py-16 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <Chip
                  label="Designed for Students"
                  size="small"
                  variant="outlined"
                  className="!border-blue-200 !bg-blue-50 !font-semibold !text-blue-700"
                />

                <Typography
                  component="h2"
                  className="!mt-4 !text-3xl !font-black !leading-tight !text-slate-950 sm:!text-4xl"
                >
                  A focused platform for meaningful learning.
                </Typography>

                <Typography className="!mt-5 !text-sm !leading-7 !text-slate-600 sm:!text-base">
                  From discovering a course to completing lessons and tracking
                  achievements, ApnaAcademy is designed to keep the learning
                  journey clear and organized.
                </Typography>

                <Button
                  component={Link}
                  to="/courses"
                  variant="text"
                  endIcon={<ArrowForward />}
                  className="!mt-5 !px-0 !font-bold !normal-case !text-blue-600 hover:!bg-transparent"
                >
                  Explore our courses
                </Button>
              </div>

              <Card
                elevation={0}
                className="!rounded-3xl !border !border-slate-200 !bg-slate-50"
              >
                <CardContent className="!p-6 sm:!p-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Security />
                    </div>

                    <Typography className="!text-lg !font-black !text-slate-900">
                      Platform Principles
                    </Typography>
                  </div>

                  <Divider className="!my-5 !border-slate-200" />

                  <div className="grid gap-3 sm:grid-cols-2">
                    {trustPoints.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <CheckCircle className="mt-0.5 shrink-0 !text-[19px] !text-blue-600" />

                        <Typography className="!text-sm !font-semibold !leading-6 !text-slate-700">
                          {point}
                        </Typography>
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
          FINAL CTA
      ====================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">
        <Container maxWidth="lg">
          <div className="py-14 sm:py-16">
            <div className="rounded-[2rem] bg-blue-600 px-6 py-10 text-white shadow-[0_20px_50px_rgba(37,99,235,0.18)] sm:px-10 sm:py-12">
              <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                      <WorkspacePremium />
                    </div>

                    <Typography className="!text-sm !font-bold !text-blue-100">
                      Start your learning journey
                    </Typography>
                  </div>

                  <Typography
                    component="h2"
                    className="!mt-4 !text-2xl !font-black sm:!text-3xl"
                  >
                    Ready to build practical skills?
                  </Typography>

                  <Typography className="!mt-3 !text-sm !leading-7 !text-blue-100 sm:!text-base">
                    Explore ApnaAcademy courses and take the next step in your
                    learning journey.
                  </Typography>
                </div>

                <Button
                  component={Link}
                  to="/courses"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  className="!rounded-xl !bg-white !px-6 !py-3 !font-bold !normal-case !text-blue-700 !shadow-none hover:!bg-blue-50"
                >
                  Explore Courses
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}