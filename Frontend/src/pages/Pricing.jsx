import { Link } from "react-router-dom";

import {
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  Groups,
  EmojiEvents,
  EventAvailable,
  WorkspacePremium,
  Work,
  Code,
  QuestionAnswer,
  RocketLaunch,
} from "@mui/icons-material";

const plans = [
  {
    name: "Basic",
    eyebrow: "Start your preparation journey",
    price: "₹99",
    period: "/ month",
    description: "Everything you need to start building strong fundamentals.",
    icon: WorkspacePremium,
    featured: false,
    accent: "blue",
    cta: "Get Started",
    features: [
      "Curated DSA practice sheets",
      "Company-wise interview question sets",
      "Coding & interview preparation resources",
      "Student learning community access",
      "Hackathon discovery & participation updates",
      "Career opportunity alerts",
    ],
  },
  {
    name: "Popular",
    eyebrow: "More resources. More opportunities.",
    price: "₹299",
    period: "/ month",
    description: "The balanced plan for serious placement and career preparation.",
    icon: RocketLaunch,
    featured: true,
    accent: "purple",
    cta: "Get Started",
    features: [
      "Everything in Basic",
      "Advanced DSA sheets & interview practice",
      "Expanded company-wise interview questions",
      "Hackathon access & opportunity updates",
      "Collaborate with other students on projects",
      "Placement opportunity notifications",
      "Paid internship opportunity alerts",
      "Company hiring updates & application guidance",
      "Interview opportunity referrals when eligible",
    ],
  },
  {
    name: "Advanced / Business",
    eyebrow: "For serious learners & future leaders",
    price: "₹599",
    period: "/ month",
    description: "Maximum career access with deeper preparation and opportunity support.",
    icon: EmojiEvents,
    featured: false,
    accent: "green",
    cta: "Get Started",
    features: [
      "Everything in Popular",
      "Premium DSA & placement preparation library",
      "Comprehensive company interview question bank",
      "Priority hackathon & event opportunity updates",
      "Student-to-student collaboration network",
      "Placement & hiring opportunity alerts",
      "Paid internship opportunity alerts",
      "Company hiring information and role updates",
      "Interview referral support for eligible opportunities",
      "Career-focused resources, guidance & updates",
    ],
  },
];

const additionalBenefits = [
  {
    icon: Code,
    title: "DSA & Coding",
    description: "Build strong fundamentals with structured practice sheets.",
  },
  {
    icon: QuestionAnswer,
    title: "Interview Prep",
    description: "Prepare with company-focused interview question resources.",
  },
  {
    icon: EventAvailable,
    title: "Hackathons",
    description: "Discover technical events and opportunities to showcase your skills.",
  },
  {
    icon: Groups,
    title: "Community",
    description: "Learn, build and collaborate with fellow students.",
  },
  {
    icon: Work,
    title: "Jobs & Internships",
    description: "Stay informed about relevant hiring and internship opportunities.",
  },
  {
    icon: EmojiEvents,
    title: "Career Growth",
    description: "Get placement-focused resources and opportunity updates.",
  },
];

const accentStyles = {
  blue: {
    icon: "bg-blue-500/20 text-blue-300 ring-blue-400/20",
    check: "!text-blue-400",
    border: "border-blue-500/70",
    glow: "bg-blue-500/10",
    button: "border-blue-400/80 hover:bg-blue-500/10",
  },
  purple: {
    icon: "bg-purple-500/25 text-purple-200 ring-purple-300/30",
    check: "!text-purple-300",
    border: "border-purple-400/90",
    glow: "bg-purple-500/15",
    button: "bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 text-white shadow-[0_12px_35px_rgba(99,102,241,0.35)] hover:brightness-110",
  },
  green: {
    icon: "bg-emerald-500/20 text-emerald-300 ring-emerald-400/20",
    check: "!text-emerald-400",
    border: "border-emerald-400/70",
    glow: "bg-emerald-500/10",
    button: "border-emerald-400/80 hover:bg-emerald-500/10",
  },
};

function PlanCard({ plan }) {
  const Icon = plan.icon;
  const styles = accentStyles[plan.accent];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-visible rounded-[28px] border p-6 text-white backdrop-blur-xl transition-all duration-500 sm:p-7 ${
        styles.border
      } ${
        plan.featured
          ? "bg-gradient-to-b from-indigo-950 via-blue-950 to-slate-950 shadow-[0_0_55px_rgba(99,102,241,0.30)] lg:-translate-y-3"
          : "bg-slate-950/80 shadow-[0_20px_60px_rgba(2,8,23,0.28)] hover:-translate-y-2 hover:shadow-[0_28px_75px_rgba(15,23,42,0.5)]"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${styles.glow}`}
      />
      <div
        className={`pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full blur-3xl ${styles.glow}`}
      />

      {plan.featured && (
        <div className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-5 py-2 text-xs font-black text-white shadow-[0_8px_25px_rgba(99,102,241,0.45)]">
          <AutoAwesome className="!text-[16px]" />
          Most Popular
        </div>
      )}

      <div className="relative z-10 flex items-start gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}
        >
          <Icon className="!text-[30px]" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-2xl font-black tracking-tight sm:text-[27px]">
            {plan.name}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-300">
            {plan.eyebrow}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-7 flex items-end gap-2">
        <span className="text-4xl font-black tracking-tight sm:text-5xl">
          {plan.price}
        </span>
        <span className="pb-1 text-sm font-medium text-slate-300">
          {plan.period}
        </span>
      </div>

      <p className="relative z-10 mt-3 min-h-[48px] text-sm leading-6 text-slate-300">
        {plan.description}
      </p>

      <Link
        to="/register"
        className={`relative z-10 mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-black no-underline transition-all duration-300 ${
          plan.featured
            ? styles.button
            : `bg-transparent text-white ${styles.button}`
        }`}
      >
        {plan.cta}
        <ArrowForward className="!text-[18px]" />
      </Link>

      <div className="relative z-10 my-6 h-px bg-white/10" />

      <p className="relative z-10 text-xs font-black uppercase tracking-[0.15em] text-slate-400">
        Included benefits
      </p>

      <ul className="relative z-10 mt-4 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle
              className={`mt-0.5 shrink-0 !text-[19px] ${styles.check}`}
            />
            <span className="text-sm leading-6 text-slate-200">
              {feature}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}

export default function Pricing() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#020817] text-white">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-48 top-32 h-[30rem] w-[30rem] rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/15 px-4 py-2 text-xs font-black text-indigo-100 shadow-lg shadow-indigo-950/30">
              <WorkspacePremium className="!text-[17px]" />
              Simple Plans. Bigger Dreams.
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Choose Your <span className="text-blue-400">Plan</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Get access to DSA sheets, company questions, hackathons, job alerts,
              and everything you need to build your dream career.
            </p>
          </div>

          <div className="mt-14 grid items-stretch gap-7 lg:grid-cols-3 lg:gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-xs leading-6 text-slate-400 backdrop-blur sm:px-6">
            Opportunity and interview support depends on student eligibility, company requirements, available openings, and the terms of each opportunity. ApnaAcademy does not guarantee a job, internship, placement, interview selection, or hiring outcome.
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/10 bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {additionalBenefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/30 hover:bg-white/[0.06]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/15 text-blue-300 ring-1 ring-blue-400/10 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="!text-[21px]" />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 text-center text-sm font-medium italic text-slate-400">
            <span className="hidden h-px w-24 bg-white/10 sm:block" />
            <span>Better Skills&nbsp; → &nbsp;Better Opportunities&nbsp; → &nbsp;A Brighter Future</span>
            <span className="hidden h-px w-24 bg-white/10 sm:block" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/10 bg-[#020817] text-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_12px_35px_rgba(37,99,235,0.35)]">
            <RocketLaunch />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl">
            Ready to turn preparation into opportunity?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Pick the plan that fits your current goal and start building a stronger preparation and opportunity pipeline.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-black text-white no-underline shadow-[0_12px_35px_rgba(37,99,235,0.35)] transition-all hover:bg-blue-500 hover:shadow-[0_16px_45px_rgba(37,99,235,0.45)]"
          >
            Get Started
            <ArrowForward className="!text-[18px]" />
          </Link>
        </div>
      </section>
    </main>
  );
}
