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
  Person,
  PlayCircle,
  Smartphone,
  WorkspacePremium as CertificateIcon,
  AllInclusive,
  Lock,
  Shield,
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
    name: "Advanced",
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
    icon: Person,
    title: "Expert Guidance",
    description: "Learn from practical resources and career-focused guidance.",
  },
  {
    icon: PlayCircle,
    title: "Live Opportunities",
    description: "Stay updated with learning, events and career opportunities.",
  },
  {
    icon: Smartphone,
    title: "Flexible Learning",
    description: "Learn, practice and track your preparation across devices.",
  },
  {
    icon: CertificateIcon,
    title: "Career Resources",
    description: "Build stronger preparation with structured resources.",
  },
  {
    icon: AllInclusive,
    title: "Long-Term Access",
    description: "Keep your learning resources available throughout your plan.",
  },
];

const comparisonRows = [
  {
    label: "Core DSA & coding resources",
    basic: true,
    popular: true,
    advanced: true,
  },
  {
    label: "Advanced interview preparation",
    basic: false,
    popular: true,
    advanced: true,
  },
  {
    label: "Live opportunity & hackathon updates",
    basic: true,
    popular: true,
    advanced: true,
  },
  {
    label: "Student collaboration resources",
    basic: true,
    popular: true,
    advanced: true,
  },
  {
    label: "Paid internship opportunity alerts",
    basic: false,
    popular: true,
    advanced: true,
  },
  {
    label: "Placement & hiring opportunity support",
    basic: false,
    popular: true,
    advanced: true,
  },
  {
    label: "Priority career resources & guidance",
    basic: false,
    popular: false,
    advanced: true,
  },
];

const accentStyles = {
  blue: {
    icon: "bg-blue-50 text-blue-600 ring-blue-100",
    check: "!text-blue-600",
    border: "border-blue-200",
    glow: "bg-blue-100/60",
    button: "border-blue-200 hover:bg-blue-50 hover:text-blue-700",
  },
  purple: {
    icon: "bg-violet-50 text-violet-600 ring-violet-100",
    check: "!text-violet-600",
    border: "border-violet-300",
    glow: "bg-violet-100/60",
    button:
      "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-[0_12px_35px_rgba(79,70,229,0.22)] hover:from-violet-700 hover:to-blue-700",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    check: "!text-emerald-600",
    border: "border-emerald-200",
    glow: "bg-emerald-100/60",
    button:
      "border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
  },
};

function PlanCard({ plan }) {
  const Icon = plan.icon;
  const styles = accentStyles[plan.accent];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-visible rounded-[28px] border bg-white/85 p-6 text-slate-900 backdrop-blur-xl transition-all duration-500 sm:p-7 ${styles.border} ${
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
        <div className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-xs font-black text-white shadow-[0_8px_25px_rgba(79,70,229,0.25)]">
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
            : `bg-white/80 text-slate-900 ${styles.button}`
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

function ComparisonMark({ enabled, accent }) {
  if (!enabled) {
    return <span className="text-sm font-bold text-slate-300">—</span>;
  }

  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full ${
        accent === "popular"
          ? "bg-violet-50 text-violet-600"
          : accent === "advanced"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-blue-50 text-blue-600"
      }`}
    >
      <CheckCircle className="!text-[15px]" />
    </span>
  );
}

export default function Pricing() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f8fbff] text-slate-900">
      <section className="relative overflow-hidden border-b border-blue-100/70 bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="pointer-events-none absolute -left-32 top-24 h-72 w-72 rounded-full bg-blue-100/45 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-8 h-96 w-96 rounded-full bg-indigo-100/55 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-[34rem] -translate-x-1/2 rounded-full bg-cyan-100/35 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/80 px-4 py-2 text-xs font-black text-violet-700 shadow-sm backdrop-blur-xl">
              <AutoAwesome className="!text-[16px]" />
              Simple Plans. Better Future.
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              Choose Your <span className="text-blue-600">Plan</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Get access to DSA resources, career-focused preparation,
              opportunity updates, and everything you need to build your
              learning journey.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-600 sm:text-sm">
              {[
                ["Lifetime Access", CheckCircle],
                ["Cancel Anytime", Shield],
                ["Secure Payments", Lock],
              ].map(([label, Icon]) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="!text-[17px] !text-blue-600" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute right-[-4rem] top-12 hidden h-64 w-72 lg:block">
            <div className="absolute right-12 top-16 h-28 w-44 rotate-[-5deg] rounded-[22px] border border-white/90 bg-white/75 shadow-[0_18px_50px_rgba(37,99,235,0.12)] backdrop-blur-xl" />
            <div className="absolute right-0 top-6 h-28 w-44 rotate-[5deg] rounded-[22px] border border-blue-100 bg-white/80 shadow-[0_18px_50px_rgba(37,99,235,0.12)] backdrop-blur-xl" />
            <div className="absolute right-16 top-0 flex h-28 w-36 items-center justify-center rounded-[28px] bg-gradient-to-br from-indigo-600 to-blue-500 shadow-[0_20px_50px_rgba(37,99,235,0.2)]">
              <WorkspacePremium className="!text-6xl !text-white" />
            </div>
            <div className="absolute right-28 bottom-0 rounded-xl border border-white/90 bg-white/85 px-4 py-3 text-left shadow-lg backdrop-blur-xl">
              <p className="text-[10px] font-black text-blue-700">Learn</p>
              <p className="text-[10px] font-black text-slate-700">Grow</p>
              <p className="text-[10px] font-black text-slate-500">Succeed</p>
            </div>
          </div>

          <div className="mt-12 grid items-stretch gap-7 lg:grid-cols-3 lg:gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.name} plan={plan} />
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-blue-100 bg-white/70 px-5 py-4 text-center text-xs leading-6 text-slate-500 shadow-sm backdrop-blur-xl sm:px-6">
            Opportunity and interview support depends on student eligibility,
            company requirements, available openings, and the terms of each
            opportunity. ApnaAcademy does not guarantee a job, internship,
            placement, interview selection, or hiring outcome.
          </div>
        </div>
      </section>

      <section className="relative border-b border-blue-100 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid overflow-hidden rounded-[24px] border border-blue-100 bg-white/85 shadow-[0_16px_50px_rgba(37,99,235,0.08)] backdrop-blur-xl sm:grid-cols-5">
            {additionalBenefits.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className={`group p-5 text-center sm:p-4 lg:p-6 ${
                    index !== additionalBenefits.length - 1
                      ? "border-b border-blue-50 sm:border-b-0 sm:border-r"
                      : ""
                  }`}
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="!text-[20px]" />
                  </div>
                  <h3 className="mt-3 text-sm font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-[180px] text-[11px] leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-b border-blue-100 bg-[#f8fbff]">
        <div className="pointer-events-none absolute left-0 top-10 h-60 w-60 rounded-full bg-blue-100/35 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-10 h-72 w-72 rounded-full bg-violet-100/35 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="overflow-hidden rounded-[26px] border border-blue-100 bg-white/85 shadow-[0_18px_60px_rgba(37,99,235,0.08)] backdrop-blur-xl">
            <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="border-b border-blue-100 bg-gradient-to-br from-blue-50/80 to-white p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="inline-flex rounded-full border border-blue-100 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-blue-600 shadow-sm">
                  Quick Comparison
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                  Find the Perfect Plan for Your Goals
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Compare the core benefits and choose the plan that fits your
                  current preparation journey.
                </p>

                <div className="mt-8 text-sm font-bold italic text-violet-500">
                  More learning
                  <br />
                  More opportunities
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2 opacity-60">
                  {Array.from({ length: 15 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-1.5 w-1.5 rounded-full bg-blue-200"
                    />
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-blue-100 bg-white/80">
                      <th className="px-5 py-5 text-xs font-black text-slate-700 sm:px-6">
                        Features
                      </th>
                      <th className="px-4 py-5 text-center text-xs font-black text-blue-600">
                        Basic
                        <span className="mt-1 block text-[10px] text-slate-500">
                          ₹99/mo
                        </span>
                      </th>
                      <th className="border-x border-violet-200 bg-violet-50/40 px-4 py-5 text-center text-xs font-black text-violet-600">
                        Popular
                        <span className="mt-1 block text-[10px] text-slate-500">
                          ₹299/mo
                        </span>
                      </th>
                      <th className="px-4 py-5 text-center text-xs font-black text-emerald-600">
                        Advanced
                        <span className="mt-1 block text-[10px] text-slate-500">
                          ₹599/mo
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 sm:px-6">
                          {row.label}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-center">
                            <ComparisonMark enabled={row.basic} accent="basic" />
                          </div>
                        </td>
                        <td className="border-x border-violet-100 bg-violet-50/20 px-4 py-3.5">
                          <div className="flex justify-center">
                            <ComparisonMark enabled={row.popular} accent="popular" />
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex justify-center">
                            <ComparisonMark enabled={row.advanced} accent="advanced" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-blue-100 bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-6 shadow-[0_18px_60px_rgba(37,99,235,0.1)] sm:p-8">
            <div className="pointer-events-none absolute -left-10 bottom-[-5rem] h-40 w-72 rounded-full bg-blue-200/40 blur-3xl" />
            <div className="pointer-events-none absolute right-[-3rem] top-[-4rem] h-40 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 shadow-sm sm:h-16 sm:w-16">
                  <RocketLaunch className="!text-[30px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                    Ready to turn your goals into reality?
                  </h2>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
                    Join learners who are building stronger skills, preparing
                    smarter and moving closer to their career goals.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-blue-600 px-7 py-3 text-sm font-black text-white no-underline shadow-[0_12px_35px_rgba(37,99,235,0.22)] transition-all hover:bg-blue-700 hover:shadow-[0_16px_45px_rgba(37,99,235,0.3)]"
                >
                  Get Started Now
                  <ArrowForward className="!text-[18px]" />
                </Link>
                <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">
                  Start with your ApnaAcademy account
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
