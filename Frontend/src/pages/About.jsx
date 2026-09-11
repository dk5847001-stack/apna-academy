import { Link } from "react-router-dom";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  EmojiEvents,
  Groups,
  PlayArrow,
  School,
  Security,
  TrendingUp,
  Verified,
} from "@mui/icons-material";

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
  "Industry-relevant learning",
  "Structured course modules",
  "Progress-focused learning",
  "Practical skill development",
  "Modern digital certificates",
  "Student-first experience",
];

export default function About() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">

          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">

            {/* LEFT CONTENT */}

            <div>

              <Chip
                icon={<AutoAwesome fontSize="small" />}
                label="About ApnaAcademy"
                variant="outlined"
                className="
                  !border-blue-200
                  !bg-blue-50
                  !font-semibold
                  !text-blue-700
                "
              />

              <Typography
                component="h1"
                className="
                  !mt-6
                  !max-w-4xl
                  !text-4xl
                  !font-black
                  !leading-tight
                  !tracking-tight
                  !text-slate-950
                  sm:!text-5xl
                  lg:!text-6xl
                "
              >
                Learn today.
                <span className="block text-blue-600">
                  Build your future.
                </span>
              </Typography>

              <Typography
                component="p"
                className="
                  !mt-6
                  !max-w-2xl
                  !text-base
                  !leading-8
                  !text-slate-600
                  sm:!text-lg
                "
              >
                ApnaAcademy is a modern learning platform
                focused on helping students develop practical
                skills through structured, accessible, and
                outcome-oriented digital learning experiences.
              </Typography>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Button
                  component={Link}
                  to="/courses"
                  variant="contained"
                  endIcon={<ArrowForward />}
                  className="
                    !rounded-xl
                    !bg-blue-600
                    !px-6
                    !py-3
                    !font-bold
                    !normal-case
                    !shadow-sm
                    hover:!bg-blue-700
                  "
                >
                  Explore Courses
                </Button>

                <Button
                  component={Link}
                  to="/contact"
                  variant="outlined"
                  className="
                    !rounded-xl
                    !border-slate-300
                    !px-6
                    !py-3
                    !font-bold
                    !normal-case
                    !text-slate-700
                    hover:!border-blue-300
                    hover:!bg-blue-50
                  "
                >
                  Contact Us
                </Button>

              </div>

            </div>

            {/* RIGHT FEATURE CARD */}

            <Card
              elevation={0}
              className="
                !rounded-3xl
                !border
                !border-slate-200
                !bg-slate-50
                !shadow-[0_20px_50px_rgba(15,23,42,0.08)]
              "
            >
              <CardContent className="!p-6 sm:!p-8">

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <Box
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-blue-600
                        text-white
                      "
                    >
                      <School />
                    </Box>

                    <div>

                      <Typography
                        className="
                          !text-sm
                          !font-black
                          !text-slate-900
                        "
                      >
                        ApnaAcademy
                      </Typography>

                      <Typography
                        className="
                          !text-xs
                          !text-slate-500
                        "
                      >
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

                <Box
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-blue-100
                    bg-blue-50
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">

                    <AutoAwesome
                      fontSize="small"
                      className="!mt-0.5 !text-blue-600"
                    />

                    <Typography
                      className="
                        !text-sm
                        !leading-6
                        !text-slate-600
                      "
                    >
                      A learning experience designed
                      around progress, practical skills,
                      and continuous improvement.
                    </Typography>

                  </div>
                </Box>

              </CardContent>
            </Card>

          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION + VISION
      ===================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="grid gap-6 lg:grid-cols-2">

            <InfoCard
              label="Our Mission"
              title="Make meaningful learning more accessible."
              description="Our goal is to create a learning environment where students can discover useful skills, follow structured learning paths, track their progress, and build confidence through practical learning."
            />

            <InfoCard
              label="Our Vision"
              title="Build a better digital learning journey."
              description="We envision a platform where technology, structured education, and practical experiences come together to help learners continuously improve and prepare for real-world opportunities."
            />

          </div>

        </div>
      </section>

      {/* =====================================================
          WHY APNAACADEMY
      ===================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="max-w-2xl">

            <Chip
              label="Why ApnaAcademy"
              size="small"
              variant="outlined"
              className="
                !border-blue-200
                !bg-blue-50
                !font-semibold
                !text-blue-700
              "
            />

            <Typography
              component="h2"
              className="
                !mt-4
                !text-3xl
                !font-black
                !tracking-tight
                !text-slate-950
                sm:!text-4xl
              "
            >
              Everything focused around your learning journey.
            </Typography>

            <Typography
              component="p"
              className="
                !mt-4
                !text-sm
                !leading-7
                !text-slate-600
                sm:!text-base
              "
            >
              From structured modules to progress tracking,
              ApnaAcademy is designed to keep learning simple,
              focused, and engaging.
            </Typography>

          </div>

          <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <Card
                  key={item.title}
                  elevation={0}
                  className="
                    !rounded-2xl
                    !border
                    !border-slate-200
                    !bg-white
                    !shadow-sm
                    !transition
                    !duration-200
                    hover:!-translate-y-1
                    hover:!border-blue-200
                    hover:!shadow-lg
                  "
                >
                  <CardContent className="!p-6">

                    <Box
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-50
                        text-blue-600
                      "
                    >
                      <Icon />
                    </Box>

                    <Typography
                      component="h3"
                      className="
                        !mt-5
                        !text-lg
                        !font-black
                        !text-slate-900
                      "
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      component="p"
                      className="
                        !mt-3
                        !text-sm
                        !leading-6
                        !text-slate-600
                      "
                    >
                      {item.description}
                    </Typography>

                  </CardContent>
                </Card>
              );
            })}

          </div>

        </div>
      </section>

      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <Card
            elevation={0}
            className="
              !rounded-3xl
              !border
              !border-slate-200
              !bg-white
              !shadow-sm
            "
          >
            <CardContent className="!p-7 sm:!p-10 lg:!p-12">

              <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">

                <div>

                  <Chip
                    label="What We Believe"
                    size="small"
                    variant="outlined"
                    className="
                      !border-blue-200
                      !bg-blue-50
                      !font-semibold
                      !text-blue-700
                    "
                  />

                  <Typography
                    component="h2"
                    className="
                      !mt-4
                      !text-3xl
                      !font-black
                      !text-slate-950
                      sm:!text-4xl
                    "
                  >
                    Built around learners.
                  </Typography>

                  <Typography
                    component="p"
                    className="
                      !mt-4
                      !text-sm
                      !leading-7
                      !text-slate-600
                      sm:!text-base
                    "
                  >
                    We believe effective learning should be
                    structured, practical, measurable, and
                    accessible.
                  </Typography>

                </div>

                <div className="grid gap-3 sm:grid-cols-2">

                  {values.map((value) => (
                    <div
                      key={value}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        border-slate-200
                        bg-slate-50
                        px-4
                        py-3
                      "
                    >
                      <CheckCircle
                        fontSize="small"
                        className="!shrink-0 !text-blue-600"
                      />

                      <Typography
                        component="span"
                        className="
                          !text-sm
                          !font-medium
                          !text-slate-700
                        "
                      >
                        {value}
                      </Typography>
                    </div>
                  ))}

                </div>

              </div>

            </CardContent>
          </Card>

        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div
            className="
              rounded-3xl
              border
              border-blue-100
              bg-blue-50
              px-6
              py-12
              text-center
              sm:px-10
            "
          >

            <Box
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-white
                text-blue-600
                shadow-sm
              "
            >
              <School />
            </Box>

            <Typography
              component="h2"
              className="
                !mt-5
                !text-2xl
                !font-black
                !text-slate-950
                sm:!text-3xl
              "
            >
              Ready to start learning?
            </Typography>

            <Typography
              component="p"
              className="
                mx-auto
                !mt-3
                !max-w-2xl
                !text-sm
                !leading-7
                !text-slate-600
                sm:!text-base
              "
            >
              Explore our courses and start building the
              skills that move you forward.
            </Typography>

            <Button
              component={Link}
              to="/courses"
              variant="contained"
              endIcon={<ArrowForward />}
              className="
                !mt-7
                !rounded-xl
                !bg-blue-600
                !px-7
                !py-3
                !font-bold
                !normal-case
                hover:!bg-blue-700
              "
            >
              Explore Courses
            </Button>

          </div>

        </div>
      </section>

    </div>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({ label, title, description }) {
  return (
    <Card
      elevation={0}
      className="
        !rounded-3xl
        !border
        !border-slate-200
        !bg-white
        !shadow-sm
        hover:!shadow-md
      "
    >
      <CardContent className="!p-7 sm:!p-9">

        <Chip
          label={label}
          size="small"
          variant="outlined"
          className="
            !border-blue-200
            !bg-blue-50
            !font-semibold
            !text-blue-700
          "
        />

        <Typography
          component="h2"
          className="
            !mt-5
            !text-2xl
            !font-black
            !leading-tight
            !text-slate-950
            sm:!text-3xl
          "
        >
          {title}
        </Typography>

        <Typography
          component="p"
          className="
            !mt-4
            !text-sm
            !leading-7
            !text-slate-600
            sm:!text-base
          "
        >
          {description}
        </Typography>

      </CardContent>
    </Card>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ icon, value, label }) {
  return (
    <Box
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-4
      "
    >
      <Box className="text-blue-600">
        {icon}
      </Box>

      <Typography
        component="p"
        className="
          !mt-3
          !text-sm
          !font-black
          !text-slate-900
        "
      >
        {value}
      </Typography>

      <Typography
        component="p"
        className="
          !mt-1
          !text-xs
          !leading-5
          !text-slate-500
        "
      >
        {label}
      </Typography>
    </Box>
  );
}