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
    eyebrow: "Start your journey",
    price: "₹99",
    period: "/month",
    description:
      "A focused starter plan for students who want structured preparation and essential career resources.",
    icon: WorkspacePremium,
    featured: false,
    cta: "Choose Basic",
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
    eyebrow: "Best for placement preparation",
    price: "₹299",
    period: "/month",
    description:
      "The most balanced plan for students preparing seriously for interviews, hackathons and career opportunities.",
    icon: RocketLaunch,
    featured: true,
    cta: "Choose Popular",
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
    eyebrow: "Maximum career access",
    price: "₹599",
    period: "/month",
    description:
      "A high-value career access plan built for students who want deeper preparation and broader opportunity support.",
    icon: EmojiEvents,
    featured: false,
    cta: "Choose Advanced",
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
    title: "DSA & Coding Sheets",
    description:
      "Practice structured problem sets designed to help you prepare consistently for coding rounds and technical interviews.",
  },
  {
    icon: QuestionAnswer,
    title: "Company Interview Prep",
    description:
      "Access company-focused interview question resources so you can prepare around the patterns and topics commonly expected in hiring rounds.",
  },
  {
    icon: EventAvailable,
    title: "Hackathon Access",
    description:
      "Discover hackathons, technical events and participation opportunities that can help you build experience and a stronger portfolio.",
  },
  {
    icon: Groups,
    title: "Student Collaboration",
    description:
      "Connect and collaborate with fellow students for projects, ideas, peer learning and team-based opportunities.",
  },
  {
    icon: Work,
    title: "Internship & Job Alerts",
    description:
      "Get information about relevant paid internships, jobs and company hiring opportunities available through the platform.",
  },
  {
    icon: EmojiEvents,
    title: "Placement Opportunities",
    description:
      "Receive placement-related opportunity updates and, where an eligible company opportunity is available, information on how to apply or be considered for interview rounds.",
  },
];

function PlanCard({ plan }) {
  const Icon = plan.icon;

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border p-6 transition-all duration-300 sm:p-7 ${
        plan.featured
          ? "border-blue-500 bg-slate-950 text-white shadow-[0_24px_70px_rgba(37,99,235,0.22)] lg:-translate-y-3"
          : "border-slate-200 bg-white text-slate-900 shadow-sm hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg">
          Most Popular
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            plan.featured
              ? "bg-blue-500/15 text-blue-300"
              : "bg-blue-50 text-blue-600"
          }`}
        >
          <Icon />
        </div>

        {plan.featured && (
          <AutoAwesome className="!text-blue-300" />
        )}
      </div>

      <p
        className={`mt-6 text-xs font-black uppercase tracking-[0.16em] ${
          plan.featured ? "text-blue-300" : "text-blue-600"
        }`}
      >
        {plan.eyebrow}
      </p>

      <h2
        className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl ${
          plan.featured ? "text-white" : "text-slate-950"
        }`}
      >
        {plan.name}
      </h2>

      <div className="mt-5 flex items-end gap-1">
        <span
          className={`text-4xl font-black tracking-tight sm:text-5xl ${
            plan.featured ? "text-white" : "text-slate-950"
          }`}
        >
          {plan.price}
        </span>
        <span
          className={`pb-1 text-sm font-semibold ${
            plan.featured ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {plan.period}
        </span>
      </div>

      <p
        className={`mt-4 min-h-[72px] text-sm leading-6 ${
          plan.featured ? "text-slate-300" : "text-slate-600"
        }`}
      >
        {plan.description}
      </p>

      <Link
        to="/register"
        className={`mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-black no-underline transition-all duration-200 ${
          plan.featured
            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30 hover:bg-blue-500"
            : "bg-slate-950 text-white hover:bg-blue-600"
        }`}
      >
        {plan.cta}
        <ArrowForward className="!text-[18px]" />
      </Link>

      <div
        className={`my-7 h-px ${
          plan.featured ? "bg-white/10" : "bg-slate-200"
        }`}
      />

      <p
        className={`text-xs font-black uppercase tracking-[0.14em] ${
          plan.featured ? "text-slate-400" : "text-slate-500"
        }`}
      >
        Included benefits
      </p>

      <ul className="mt-4 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle
              className={`mt-0.5 shrink-0 !text-[19px] ${
                plan.featured ? "!text-blue-400" : "!text-blue-600"
              }`}
            />
            <span
              className={`text-sm leading-6 ${
                plan.featured ? "text-slate-200" : "text-slate-600"
              }`}
            >
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
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50">
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
              <AutoAwesome className="!text-[17px]" />
              ApnaAcademy Career Plans
            </div>

            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Choose the plan that matches your
              <span className="block text-blue-600">career ambition.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Go beyond courses with structured DSA preparation, company interview resources, hackathons, student collaboration, and career opportunity updates — all in one student-focused ecosystem.
            </p>
          </div>

          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3 lg:gap-7">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-xs leading-6 text-slate-500 shadow-sm sm:px-6">
            Opportunity and interview support depends on student eligibility, company requirements, available openings, and the terms of each opportunity. ApnaAcademy does not guarantee a job, internship, placement, interview selection, or hiring outcome.
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-slate-600">
              More than a subscription
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Built to help you prepare, participate and get discovered.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Your plan unlocks resources and opportunity-focused features according to the level you choose.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {additionalBenefits.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition-transform duration-300 group-hover:scale-105">
                    <Icon />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
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
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white no-underline shadow-lg shadow-blue-900/30 transition-colors hover:bg-blue-500"
          >
            Get Started
            <ArrowForward className="!text-[18px]" />
          </Link>
        </div>
      </section>
    </main>
  );
}
