import { AutoStoriesOutlined, CalendarMonthOutlined } from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const posts = [
  {
    title: "How to Build Job-Ready Web Development Skills",
    date: "September 14, 2026",
    tag: "Career",
    excerpt:
      "A practical roadmap for frontend, backend, APIs, databases and real-world projects.",
    body:
      "Build fundamentals first, then turn them into projects. Learn JavaScript, React, Node.js, APIs, databases, authentication, Git and deployment. A strong portfolio shows not only what you built but also how you handled security, usability and maintainability.",
  },
  {
    title: "Why Project-Based Learning Works",
    date: "September 10, 2026",
    tag: "Learning",
    excerpt:
      "Move from passive tutorials to structured projects and measurable progress.",
    body:
      "Projects force you to make decisions, debug problems and connect concepts. Break work into milestones, test each feature and review what you learned after every milestone.",
  },
  {
    title: "A Better Way to Prepare for Technical Interviews",
    date: "September 5, 2026",
    tag: "Interview",
    excerpt:
      "Balance DSA, computer science fundamentals, projects and communication.",
    body:
      "Practice DSA consistently, revise core CS concepts, understand every project on your resume and rehearse concise explanations. Track weak areas so your preparation improves over time.",
  },
];

const internalLinks = [
  { label: "Explore Courses", to: "/courses" },
  { label: "Course Pricing", to: "/pricing" },
  { label: "About ApnaAcademy", to: "/about" },
  { label: "Contact Support", to: "/contact" },
];

export default function Blog() {
  return (
    <Box className="min-h-screen bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <Container maxWidth="lg">
          <div className="py-16 text-center sm:py-20">
            <Chip
              icon={<AutoStoriesOutlined />}
              label="ApnaAcademy Blog"
              variant="outlined"
              className="!border-blue-200 !bg-blue-50 !font-bold !text-blue-700"
            />

            <Typography
              component="h1"
              className="!mx-auto !mt-5 !max-w-4xl !text-4xl !font-black !tracking-tight !text-slate-950 sm:!text-5xl"
            >
              Learn smarter. Build better. Grow faster.
            </Typography>

            <Typography
              className="!mx-auto !mt-4 !max-w-2xl !text-base !leading-8 !text-slate-600 sm:!text-lg"
            >
              Practical insights on technology, projects, learning and career growth.
            </Typography>

            <nav
              aria-label="ApnaAcademy learning resources"
              className="mt-7 flex flex-wrap justify-center gap-2"
            >
              {internalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 no-underline transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </Container>
      </section>

      <Container maxWidth="lg">
        <section
          aria-labelledby="learning-insights-heading"
          className="border-b border-slate-200 py-10"
        >
          <Typography
            id="learning-insights-heading"
            component="h2"
            className="!text-2xl !font-black !tracking-tight !text-slate-950 sm:!text-3xl"
          >
            Practical learning insights for students and developers
          </Typography>
          <Typography className="!mt-3 !max-w-4xl !text-sm !leading-7 !text-slate-600 sm:!text-base">
            Explore guidance on web development, project-based learning, technical
            interview preparation and building practical technology skills. These
            resources complement ApnaAcademy courses by helping learners turn
            concepts into projects and career-ready experience.
          </Typography>
        </section>

        <div className="grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card
              key={post.title}
              elevation={0}
              className="!h-full !rounded-3xl !border !border-slate-200 !bg-white !shadow-sm"
            >
              <CardContent className="!flex !h-full !flex-col !p-6">
                <Chip
                  size="small"
                  label={post.tag}
                  className="!w-fit !bg-blue-50 !font-bold !text-blue-700"
                />

                <Typography
                  component="h2"
                  className="!mt-5 !text-xl !font-black !leading-snug"
                >
                  {post.title}
                </Typography>

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <CalendarMonthOutlined sx={{ fontSize: 16 }} />
                  {post.date}
                </div>

                <Typography className="!mt-4 !text-sm !leading-7 !text-slate-600">
                  {post.excerpt}
                </Typography>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-extrabold text-blue-600">
                    Read article
                  </summary>
                  <Typography className="!mt-3 !text-sm !leading-7 !text-slate-600">
                    {post.body}
                  </Typography>
                </details>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Box>
  );
}
