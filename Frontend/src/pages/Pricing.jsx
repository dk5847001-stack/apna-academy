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
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    check: "!text-blue-600",
    border: "border-blue-200",
    glow: "bg-blue-50",
    button: "border-blue-200 hover:bg-blue-50 hover:text-blue-700",
  },
  purple: {
    icon: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    check: "!text-indigo-600",
    border: "border-indigo-300",
    glow: "bg-indigo-50",
    button: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-[0_12px_35px_rgba(79,70,229,0.22)] hover:from-indigo-700 hover:to-blue-700",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    check: "!text-emerald-600",
    border: "border-emerald-200",
    glow: "bg-emerald-50",
    button: "border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
  },
};

function PlanCard({ plan }) {
  const Icon = plan.icon;
  const styles = accentStyles[plan.accent];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-visible rounded-[28px] border bg-white p-6 text-slate-900 transition-all duration-500 sm:p-7 ${
        styles.border
      } ${
        plan.featured
          ? "shadow-[0_24px_70px_rgba(79,70,229,0.15)] lg:-translate-y-3"
          : "shadow-[0_12px_40px_rgba(15,23,42,0.07)] hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)]"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${styles.glow}`}
      />
      <div
        className={`pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full blur-3xl opacity-60 ${styles.glow}`}
      />

      {plan.featured && (
        <div className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-xs font-black text-white shadow-[0_8px_25px_rgba(79,70,229,0.25)]">
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
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-[27px]">
            {plan.name}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            {plan.eyebrow}
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-7 flex items-end gap-2">
        <span className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          {plan.price}
        </span>
        <span className="pb-1 text-sm font-medium text-slate-500">
          {plan.period}
        </span>
      </div>

      <p className="relative z-10 mt-3 min-h-[48px] text-sm leading-6 text-slate-600">
        {plan.description}
      </p>

      <Link
        to="/register"
        className={`relative z-10 mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-black no-underline transition-all duration-300 ${
          plan.featured
            ? styles.button
            : `bg-white text-slate-900 ${styles.button}`
        }`}
      >
        {plan.cta}
        <ArrowForward className="!text-[18px]" />
      </Link>

      <div className="relative z-10 my-6 h-px bg-slate-100" />

      <p className="relative z-10 text-xs font-black uppercase tracking-[0.15em] text-slate-500">
        Included benefits
      </p>

      <ul className="relative z-10 mt-4 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle
              className={`mt-0.5 shrink-0 !text-[19px] ${styles.check}`}
            />
            <span className="text-sm leading-6 text-slate-600">
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
    <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />
        <div className="pointer-events-none absolute -right-48 top-32 h-[30rem] w-[30rem] rounded-full bg-indigo-50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-50 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-black text-blue-700 shadow-sm">
              <WorkspacePremium className="!text-[17px]" />
              Simple Plans. Bigger Dreams.
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Choose Your <span className="text-blue-600">Plan</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Get access to DSA sheets, company questions, hackathons, job alerts,
              and everything you need to build your dream career.
            </p>
          </div>

          <div className="mt-14 grid items-stretch gap-7 lg:grid-cols-3 lg:gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-center text-xs leading-6 text-slate-500 shadow-sm sm:px-6">
            Opportunity and interview support depends on student eligibility, company requirements, available openings, and the terms of each opportunity. ApnaAcademy does not guarantee a job, internship, placement, interview selection, or hiring outcome.
          </div>
        </div>
      </section>

      <section className="relative border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {additionalBenefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="!text-[21px]" />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex items-center justify-center gap-4 text-center text-sm font-medium italic text-slate-400">
            <span className="hidden h-px w-24 bg-slate-200 sm:block" />
            <span>Better Skills&nbsp; → &nbsp;Better Opportunities&nbsp; → &nbsp;A Brighter Future</span>
            <span className="hidden h-px w-24 bg-slate-200 sm:block" />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-slate-200 bg-slate-50">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_35px_rgba(37,99,235,0.22)]">
            <RocketLaunch />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Ready to turn preparation into opportunity?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Pick the plan that fits your current goal and start building a stronger preparation and opportunity pipeline.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-black text-white no-underline shadow-[0_12px_35px_rgba(37,99,235,0.22)] transition-all hover:bg-blue-700 hover:shadow-[0_16px_45px_rgba(37,99,235,0.3)]"
          >
            Get Started
            <ArrowForward className="!text-[18px]" />
          </Link>
        </div>
      </section>
    </main>
  );
}
