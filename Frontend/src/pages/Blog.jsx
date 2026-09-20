import {
  ArrowForwardRounded,
  AutoStoriesRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  CodeRounded,
  EmojiObjectsRounded,
  ExploreRounded,
  GroupsRounded,
  MenuBookRounded,
  PsychologyRounded,
  SearchRounded,
  SchoolRounded,
  WorkRounded,
} from "@mui/icons-material";
import { Box, Chip, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const CATEGORIES = ["All", "Web Development", "DSA & Programming", "Career", "Learning", "AI & Data", "Projects"];

const posts = [
  {
    title: "How to Build Job-Ready Web Development Skills",
    date: "September 14, 2026",
    category: "Web Development",
    read: "8 min read",
    icon: CodeRounded,
    tone: "blue",
    excerpt: "A practical roadmap from HTML and JavaScript fundamentals to React, Node.js, APIs, databases, authentication and deployment.",
    points: ["Build frontend and backend fundamentals", "Create portfolio projects with real features", "Learn Git, APIs, databases and deployment"],
  },
  {
    title: "Why Project-Based Learning Works",
    date: "September 10, 2026",
    category: "Learning",
    read: "6 min read",
    icon: EmojiObjectsRounded,
    tone: "amber",
    excerpt: "Projects turn concepts into decisions, debugging practice and measurable outcomes. Learn how to structure projects without getting overwhelmed.",
    points: ["Break projects into milestones", "Debug and document your decisions", "Turn finished work into portfolio evidence"],
  },
  {
    title: "A Better Way to Prepare for Technical Interviews",
    date: "September 5, 2026",
    category: "Career",
    read: "9 min read",
    icon: WorkRounded,
    tone: "violet",
    excerpt: "Balance DSA, core computer science concepts, projects and communication instead of preparing for only one part of an interview.",
    points: ["Practice DSA consistently", "Understand every project on your resume", "Track weak areas and revise them"],
  },
  {
    title: "DSA Roadmap: From Basics to Interview Practice",
    date: "September 3, 2026",
    category: "DSA & Programming",
    read: "10 min read",
    icon: PsychologyRounded,
    tone: "indigo",
    excerpt: "A structured path for arrays, strings, linked lists, stacks, queues, trees, graphs, dynamic programming and problem-solving patterns.",
    points: ["Learn one topic at a time", "Solve easy problems before increasing difficulty", "Review mistakes instead of only counting solved problems"],
  },
  {
    title: "How to Choose Your First Programming Language",
    date: "August 30, 2026",
    category: "DSA & Programming",
    read: "7 min read",
    icon: MenuBookRounded,
    tone: "cyan",
    excerpt: "Compare practical learning goals across Java, C++, Python and JavaScript and choose a starting point without trying to learn everything at once.",
    points: ["Choose based on your target projects", "Stay consistent long enough to build fluency", "Add another language when a real need appears"],
  },
  {
    title: "How to Build a Strong Developer Portfolio",
    date: "August 26, 2026",
    category: "Projects",
    read: "8 min read",
    icon: SchoolRounded,
    tone: "emerald",
    excerpt: "Your portfolio should demonstrate what you can build, how you solve problems and how you ship software—not just list technologies.",
    points: ["Show 3–5 meaningful projects", "Explain architecture and technical decisions", "Include live demos and clear repository documentation"],
  },
  {
    title: "What Makes a Good Full Stack Project?",
    date: "August 22, 2026",
    category: "Projects",
    read: "7 min read",
    icon: ExploreRounded,
    tone: "rose",
    excerpt: "Learn the features that turn a basic CRUD demo into a useful full-stack application: authentication, validation, APIs, database design and deployment.",
    points: ["Design a clear user flow", "Add validation and secure access", "Deploy and monitor the finished application"],
  },
  {
    title: "AI and Machine Learning Learning Path for Beginners",
    date: "August 18, 2026",
    category: "AI & Data",
    read: "9 min read",
    icon: PsychologyRounded,
    tone: "purple",
    excerpt: "A beginner-friendly sequence covering Python, data handling, statistics, machine learning concepts and practical AI projects.",
    points: ["Strengthen Python first", "Understand data before models", "Learn through small, measurable projects"],
  },
  {
    title: "How to Study Consistently While in College",
    date: "August 14, 2026",
    category: "Learning",
    read: "6 min read",
    icon: GroupsRounded,
    tone: "orange",
    excerpt: "Use a realistic weekly system for classes, DSA, projects and revision without relying on motivation every day.",
    points: ["Set weekly outcomes", "Protect focused study blocks", "Review progress every weekend"],
  },
];

const toneClasses = {
  blue: "from-blue-600 to-indigo-600",
  amber: "from-amber-500 to-orange-500",
  violet: "from-violet-600 to-fuchsia-600",
  indigo: "from-indigo-600 to-blue-600",
  cyan: "from-cyan-500 to-blue-600",
  emerald: "from-emerald-500 to-teal-600",
  rose: "from-rose-500 to-pink-600",
  purple: "from-purple-600 to-indigo-600",
  orange: "from-orange-500 to-red-500",
};

const internalLinks = [
  { label: "Explore Courses", to: "/courses" },
  { label: "View Pricing", to: "/pricing" },
  { label: "About ApnaAcademy", to: "/about" },
  { label: "Contact Support", to: "/contact" },
];

export default function Blog() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filteredPosts = useMemo(() => {
    const term = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "All" || post.category === category;
      const matchesQuery =
        !term ||
        post.title.toLowerCase().includes(term) ||
        post.excerpt.toLowerCase().includes(term) ||
        post.category.toLowerCase().includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const featured = posts[0];

  return (
    <Box className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute -left-28 -top-28 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 top-0 h-80 w-80 rounded-full bg-violet-100/70 blur-3xl" />
        <Container maxWidth="lg">
          <div className="relative py-16 text-center sm:py-20 lg:py-24">
            <Chip icon={<AutoStoriesRounded />} label="ApnaAcademy Learning Hub" className="!border !border-blue-200 !bg-blue-50 !font-black !text-blue-700" variant="outlined" />
            <Typography component="h1" className="!mx-auto !mt-5 !max-w-5xl !text-4xl !font-black !leading-tight !tracking-tight !text-slate-950 sm:!text-5xl lg:!text-6xl">
              Learn smarter. Build better.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">Grow faster.</span>
            </Typography>
            <Typography className="!mx-auto !mt-5 !max-w-3xl !text-base !leading-8 !text-slate-600 sm:!text-lg">
              Practical guides for students, developers and aspiring professionals—covering technology, projects, DSA, AI, learning strategy and career preparation.
            </Typography>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {internalLinks.map((link) => (
                <Link key={link.to} to={link.to} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-600 no-underline shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  {link.label}<ArrowForwardRounded sx={{ fontSize: 14 }} />
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container maxWidth="lg">
        <section className="py-10 sm:py-12" aria-labelledby="featured-article">
          <div className="grid overflow-hidden rounded-[2rem] bg-slate-950 shadow-xl lg:grid-cols-[1.3fr_.7fr]">
            <div className="relative overflow-hidden p-7 sm:p-10 lg:p-12">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-600/30 blur-3xl" />
              <div className="relative">
                <span className="inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.18em] text-blue-200">Featured guide</span>
                <Typography id="featured-article" component="h2" className="!mt-5 !text-3xl !font-black !leading-tight !text-white sm:!text-4xl">
                  {featured.title}
                </Typography>
                <Typography className="!mt-4 !max-w-2xl !text-sm !leading-7 !text-slate-300 sm:!text-base">{featured.excerpt}</Typography>
                <div className="mt-6 flex flex-wrap gap-2">
                  {featured.points.map((point) => <span key={point} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"><CheckCircleRounded sx={{ fontSize: 15 }} />{point}</span>)}
                </div>
              </div>
            </div>
            <div className={`bg-gradient-to-br ${toneClasses[featured.tone]} p-7 sm:p-10 lg:p-12`}>
              <div className="flex h-full min-h-56 flex-col justify-between text-white">
                <div><CodeRounded sx={{ fontSize: 54 }} /><p className="mt-5 text-xs font-black uppercase tracking-[.2em] text-white/70">{featured.category}</p><p className="mt-2 text-sm font-semibold text-white/85">{featured.read} · {featured.date}</p></div>
                <Link to="/courses" className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-slate-950 no-underline shadow-lg transition hover:-translate-y-0.5">Explore related courses <ArrowForwardRounded sx={{ fontSize: 18 }} /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-8" aria-labelledby="topics-heading">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div><Typography id="topics-heading" component="h2" className="!text-2xl !font-black !tracking-tight !text-slate-950 sm:!text-3xl">Explore by topic</Typography><Typography className="!mt-2 !text-sm !text-slate-500">Find the learning resource that matches your current goal.</Typography></div>
            <div className="relative w-full max-w-sm"><SearchRounded className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" sx={{ fontSize: 20 }} /><input value={query} onChange={(e)=>setQuery(e.target.value)} aria-label="Search blog articles" placeholder="Search guides..." className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50" /></div>
          </div>
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">{CATEGORIES.map((item)=><button key={item} type="button" onClick={()=>setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${category===item?"bg-slate-950 text-white":"border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"}`}>{item}</button>)}</div>
        </section>

        <section aria-labelledby="articles-heading" className="pb-14 sm:pb-16">
          <div className="mb-6 flex items-end justify-between gap-4"><div><Typography id="articles-heading" component="h2" className="!text-2xl !font-black !text-slate-950 sm:!text-3xl">Latest practical guides</Typography><Typography className="!mt-2 !text-sm !text-slate-500">{filteredPosts.length} resources available in this learning hub.</Typography></div><span className="hidden rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 sm:inline-flex">Updated regularly</span></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const Icon = post.icon;
              return <article key={post.title} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <div className={`relative h-32 bg-gradient-to-br ${toneClasses[post.tone]} p-5 text-white`}><Icon sx={{ fontSize: 40 }} /><span className="absolute right-4 top-4 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">{post.category}</span></div>
                <div className="flex flex-1 flex-col p-5 sm:p-6"><div className="flex items-center gap-2 text-[11px] font-bold text-slate-400"><CalendarMonthRounded sx={{fontSize:15}}/>{post.date}<span>·</span>{post.read}</div><h3 className="mt-3 text-lg font-black leading-snug text-slate-950">{post.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p><div className="mt-4 space-y-2">{post.points.map((point)=><div key={point} className="flex gap-2 text-xs font-semibold leading-5 text-slate-500"><CheckCircleRounded className="mt-0.5 text-emerald-500" sx={{fontSize:16}}/>{point}</div>)}</div><details className="mt-5 border-t border-slate-100 pt-4"><summary className="cursor-pointer list-none text-sm font-black text-blue-600">Read key takeaways <span className="ml-1">+</span></summary><p className="mt-3 text-sm leading-7 text-slate-600">Use this guide as a practical checklist. Start with one small outcome, build it, review what went wrong, document what you learned and then increase the difficulty. Pair the guide with relevant ApnaAcademy courses and hands-on practice for a structured learning path.</p></details></div>
              </article>;
            })}
          </div>
          {filteredPosts.length===0 && <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Typography className="!font-black !text-slate-900">No guides found</Typography><Typography className="!mt-2 !text-sm !text-slate-500">Try another keyword or choose All.</Typography></div>}
        </section>

        <section className="border-t border-slate-200 py-14" aria-labelledby="learning-path-heading">
          <Typography id="learning-path-heading" component="h2" className="!text-2xl !font-black !text-slate-950 sm:!text-3xl">Turn reading into a learning path</Typography>
          <Typography className="!mt-2 !max-w-3xl !text-sm !leading-7 !text-slate-500">A useful blog should lead to action. Pick a goal, study the fundamentals, build something and measure your progress.</Typography>
          <div className="mt-7 grid gap-4 md:grid-cols-3">
            {[["01","Choose a skill","Pick Web Development, programming, DSA, AI or another clear goal.","/courses"],["02","Learn + practice","Use structured lessons and reinforce them with projects and problem-solving.","/courses"],["03","Build your proof","Turn learning into projects, a portfolio and documented practical experience.","/about"]].map(([n,title,text,to])=><Link key={n} to={to} className="group rounded-3xl border border-slate-200 bg-white p-6 no-underline shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"><span className="text-sm font-black text-blue-600">{n}</span><h3 className="mt-3 text-lg font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-blue-600">Continue <ArrowForwardRounded sx={{fontSize:15}}/></span></Link>)}
          </div>
        </section>

        <section className="pb-16 pt-2" aria-labelledby="faq-heading">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-9">
            <Typography id="faq-heading" component="h2" className="!text-2xl !font-black !text-slate-950">Blog & learning questions</Typography>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {[["Is the ApnaAcademy blog free?","Yes. The guides on this public page are designed as free learning resources. Course access and pricing are available separately on the Courses and Pricing pages."],["What topics does ApnaAcademy cover?","The learning hub focuses on web development, programming and DSA, projects, AI and data, learning strategy and career preparation."],["How should I use these articles?","Pick one goal, read the relevant guide, apply the steps in a project or practice session, and track what you can now do independently."],["Where can I start learning?","Explore the current course catalog, compare available plans and choose a structured learning path that matches your goal."]].map(([q,a])=><details key={q} className="group rounded-2xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer list-none pr-5 text-sm font-black text-slate-900">{q}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{a}</p></details>)}
            </div>
          </div>
        </section>

        <section className="mb-16 overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-700 p-7 text-white shadow-xl sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div><span className="text-xs font-black uppercase tracking-[.18em] text-blue-100">Next step</span><h2 className="mt-2 text-2xl font-black sm:text-3xl">Ready to turn knowledge into practical skills?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Explore ApnaAcademy courses, compare learning options and continue from reading to structured practice.</p></div>
            <div className="flex shrink-0 flex-wrap gap-3"><Link to="/courses" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-blue-700 no-underline shadow-lg">Explore Courses <ArrowForwardRounded sx={{fontSize:18}}/></Link><Link to="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white no-underline">View Pricing</Link></div>
          </div>
        </section>
      </Container>
    </Box>
  );
}
