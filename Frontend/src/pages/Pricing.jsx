import { Link } from "react-router-dom";

import {
  AllInclusive,
  ArrowForward,
  AutoAwesome,
  CheckCircle,
  EmojiEvents,
  Lock,
  Person,
  PlayCircle,
  RocketLaunch,
  Shield,
  Smartphone,
  WorkspacePremium,
} from "@mui/icons-material";

const plans = [
  {
    name: "Basic",
    eyebrow: "A simple place to start",
    price: "₹99",
    period: "/ month",
    description: "Build strong fundamentals with practical resources and a clear starting point.",
    icon: WorkspacePremium,
    featured: false,
    accent: "orange",
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
    eyebrow: "More preparation. More resources.",
    price: "₹299",
    period: "/ month",
    description: "A balanced plan for students who want deeper placement and career preparation.",
    icon: RocketLaunch,
    featured: true,
    accent: "featured",
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
    description: "Deeper preparation with broader career resources and opportunity support.",
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
    icon: WorkspacePremium,
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
  { label: "Core DSA & coding resources", basic: true, popular: true, advanced: true },
  { label: "Advanced interview preparation", basic: false, popular: true, advanced: true },
  { label: "Live opportunity & hackathon updates", basic: true, popular: true, advanced: true },
  { label: "Student collaboration resources", basic: true, popular: true, advanced: true },
  { label: "Paid internship opportunity alerts", basic: false, popular: true, advanced: true },
  { label: "Placement & hiring opportunity support", basic: false, popular: true, advanced: true },
  { label: "Priority career resources & guidance", basic: false, popular: false, advanced: true },
];

const accentStyles = {
  orange: {
    icon: "bg-orange-50 text-orange-600 ring-orange-100",
    check: "!text-orange-500",
    border: "border-orange-100",
    glow: "bg-orange-100/70",
    button: "border-orange-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700",
  },
  featured: {
    icon: "bg-orange-100 text-orange-600 ring-orange-200",
    check: "!text-orange-500",
    border: "border-orange-300",
    glow: "bg-orange-200/55",
    button: "bg-gradient-to-r from-[#ff8b2b] to-[#ff6710] text-white shadow-[0_14px_34px_rgba(255,118,22,0.24)] hover:from-[#ff7f1d] hover:to-[#f65f09]",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    check: "!text-emerald-600",
    border: "border-emerald-100",
    glow: "bg-emerald-100/55",
    button: "border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700",
  },
};

function PlanCard({ plan }) {
  const Icon = plan.icon;
  const styles = accentStyles[plan.accent];

  return (
    <article
      className={`group relative flex h-full flex-col overflow-visible rounded-[28px] border bg-white p-6 text-slate-900 shadow-[0_14px_45px_rgba(91,56,27,0.07)] transition-all duration-300 sm:p-7 ${
        styles.border
      } ${
        plan.featured
          ? "lg:-translate-y-3 shadow-[0_24px_65px_rgba(255,118,22,0.16)]"
          : "hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(91,56,27,0.11)]"
      }`}
    >
      <div className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full blur-3xl ${styles.glow}`} />
      <div className={`pointer-events-none absolute -bottom-24 -right-16 h-52 w-52 rounded-full blur-3xl opacity-50 ${styles.glow}`} />

      {plan.featured && (
        <div className="absolute -top-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#ff8b2b] to-[#ff6710] px-5 py-2 text-xs font-black text-white shadow-[0_9px_25px_rgba(255,118,22,0.24)]">
          <AutoAwesome className="!text-[16px]" />
          Most Popular
        </div>
      )}

      <div className="relative z-10 flex items-start gap-4">
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${styles.icon}`}>
          <Icon className="!text-[29px]" />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-2xl font-black tracking-tight text-[#172b46] sm:text-[27px]">{plan.name}</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">{plan.eyebrow}</p>
        </div>
      </div>

      <div className="relative z-10 mt-7 flex items-end gap-2">
        <span className="text-4xl font-black tracking-tight text-[#172b46] sm:text-5xl">{plan.price}</span>
        <span className="pb-1 text-sm font-medium text-slate-500">{plan.period}</span>
      </div>

      <p className="relative z-10 mt-3 min-h-[48px] text-sm leading-6 text-slate-600">{plan.description}</p>

      <Link
        to="/register"
        className={`relative z-10 mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-black no-underline transition-all duration-300 ${
          plan.featured ? styles.button : `bg-white text-slate-800 ${styles.button}`
        }`}
      >
        {plan.cta}
        <ArrowForward className="!text-[18px]" />
      </Link>

      <div className="relative z-10 my-6 h-px bg-orange-50" />

      <p className="relative z-10 text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Included benefits</p>

      <ul className="relative z-10 mt-4 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle className={`mt-0.5 shrink-0 !text-[19px] ${styles.check}`} />
            <span className="text-sm leading-6 text-slate-600">{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ComparisonMark({ enabled, accent }) {
  if (!enabled) return <span className="text-sm font-bold text-slate-300">—</span>;

  return (
    <span
      className={`flex h-6 w-6 items-center justify-center rounded-full ${
        accent === "popular"
          ? "bg-orange-100 text-orange-600"
          : accent === "advanced"
            ? "bg-emerald-50 text-emerald-600"
            : "bg-orange-50 text-orange-500"
      }`}
    >
      <CheckCircle className="!text-[15px]" />
    </span>
  );
}

export default function Pricing() {
  return (
    <main className="pricing-page min-h-screen overflow-x-hidden bg-[#fffaf5] text-slate-900">
      <section className="relative overflow-hidden border-b border-orange-100/80 bg-[#fffaf5]">
        <div className="pointer-events-none absolute -left-40 top-8 h-80 w-80 rounded-full bg-orange-100/55 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-0 h-[30rem] w-[30rem] rounded-full bg-amber-100/45 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-[-9rem] h-72 w-[38rem] -translate-x-1/2 rounded-full bg-orange-50/80 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12 lg:px-8 lg:pb-20 lg:pt-14">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black text-orange-700 shadow-[0_8px_24px_rgba(255,118,22,0.08)] backdrop-blur-xl">
              <AutoAwesome className="!text-[16px]" />
              Simple plans. Clear learning.
            </div>

            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.045em] text-[#172b46] sm:text-5xl lg:text-6xl">
              Choose the plan that fits{" "}
              <span className="bg-gradient-to-r from-[#ff8b2b] to-[#f36a16] bg-clip-text text-transparent">
                your journey
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Start simple, learn at your pace, and unlock more preparation resources as your goals grow.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs font-semibold text-slate-600 sm:text-sm">
              {[
                ["Flexible access", CheckCircle],
                ["Cancel anytime", Shield],
                ["Secure payments", Lock],
              ].map(([label, Icon]) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Icon className="!text-[17px] !text-orange-500" />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="pointer-events-none absolute right-0 top-16 hidden lg:block">
            <div className="relative h-48 w-52">
              <div className="absolute right-1 top-3 h-32 w-40 rotate-6 rounded-[24px] border border-orange-100 bg-white/70 shadow-[0_20px_50px_rgba(255,118,22,0.10)]" />
              <div className="absolute right-8 top-10 flex h-32 w-40 -rotate-3 items-center justify-center rounded-[24px] border border-orange-100 bg-white/90 shadow-[0_20px_50px_rgba(255,118,22,0.12)]">
                <WorkspacePremium className="!text-6xl !text-orange-500" />
              </div>
              <div className="absolute bottom-0 right-16 rounded-xl border border-orange-100 bg-white px-3 py-2 text-left shadow-lg">
                <p className="text-[10px] font-black text-orange-600">Learn</p>
                <p className="text-[10px] font-black text-[#172b46]">Grow</p>
                <p className="text-[10px] font-black text-slate-500">Succeed</p>
              </div>
            </div>
          </div>

          <div className="mt-12 grid items-stretch gap-7 lg:grid-cols-3 lg:gap-6">
            {plans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
          </div>

          <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-orange-100 bg-white/75 px-5 py-4 text-center text-xs leading-6 text-slate-500 shadow-sm backdrop-blur-xl sm:px-6">
            Opportunity and interview support depends on student eligibility, company requirements, available openings, and the terms of each opportunity. ApnaAcademy does not guarantee a job, internship, placement, interview selection, or hiring outcome.
          </div>
        </div>
      </section>

      <section className="relative border-b border-orange-100 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid overflow-hidden rounded-[24px] border border-orange-100 bg-white shadow-[0_16px_50px_rgba(91,56,27,0.06)] sm:grid-cols-5">
            {additionalBenefits.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={`group p-5 text-center sm:p-4 lg:p-6 ${
                    index !== additionalBenefits.length - 1 ? "border-b border-orange-50 sm:border-b-0 sm:border-r" : ""
                  }`}
                >
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600 ring-1 ring-orange-100 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="!text-[20px]" />
                  </div>
                  <h3 className="mt-3 text-sm font-black text-[#172b46]">{item.title}</h3>
                  <p className="mx-auto mt-1.5 max-w-[180px] text-[11px] leading-5 text-slate-500">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative border-b border-orange-100 bg-[#fff8f1]">
        <div className="pointer-events-none absolute left-0 top-12 h-64 w-64 rounded-full bg-orange-100/45 blur-3xl" />
        <div className="pointer-events-none absolute right-0 bottom-8 h-72 w-72 rounded-full bg-amber-100/45 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="overflow-hidden rounded-[26px] border border-orange-100 bg-white shadow-[0_18px_60px_rgba(91,56,27,0.07)]">
            <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="border-b border-orange-100 bg-gradient-to-br from-orange-50/90 to-white p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="inline-flex rounded-full border border-orange-100 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-orange-600 shadow-sm">
                  Quick comparison
                </div>
                <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-[#172b46] sm:text-3xl">
                  See what changes as you grow
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Compare the core benefits and choose a plan that matches your current preparation stage.
                </p>
                <div className="mt-8 inline-flex rounded-2xl bg-orange-50 px-4 py-3 text-sm font-black text-orange-700">
                  Start small. Keep growing.
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[680px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-orange-100 bg-white">
                      <th className="px-5 py-5 text-xs font-black text-slate-700 sm:px-6">Features</th>
                      <th className="px-4 py-5 text-center text-xs font-black text-orange-600">
                        Basic<span className="mt-1 block text-[10px] text-slate-500">₹99/mo</span>
                      </th>
                      <th className="border-x border-orange-200 bg-orange-50/60 px-4 py-5 text-center text-xs font-black text-orange-700">
                        Popular<span className="mt-1 block text-[10px] text-slate-500">₹299/mo</span>
                      </th>
                      <th className="px-4 py-5 text-center text-xs font-black text-emerald-600">
                        Advanced<span className="mt-1 block text-[10px] text-slate-500">₹599/mo</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 sm:px-6">{row.label}</td>
                        <td className="px-4 py-3.5"><div className="flex justify-center"><ComparisonMark enabled={row.basic} accent="basic" /></div></td>
                        <td className="border-x border-orange-100 bg-orange-50/25 px-4 py-3.5"><div className="flex justify-center"><ComparisonMark enabled={row.popular} accent="popular" /></div></td>
                        <td className="px-4 py-3.5"><div className="flex justify-center"><ComparisonMark enabled={row.advanced} accent="advanced" /></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-orange-100 bg-white">
        <div className="pointer-events-none absolute left-1/2 top-0 h-56 w-[34rem] -translate-x-1/2 rounded-full bg-orange-100/45 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
          <div className="relative overflow-hidden rounded-[24px] border border-orange-100 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-6 shadow-[0_18px_60px_rgba(255,118,22,0.09)] sm:p-8">
            <div className="pointer-events-none absolute -left-10 bottom-[-5rem] h-40 w-72 rounded-full bg-orange-200/35 blur-3xl" />
            <div className="pointer-events-none absolute right-[-3rem] top-[-4rem] h-40 w-72 rounded-full bg-amber-200/35 blur-3xl" />

            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 shadow-sm sm:h-16 sm:w-16">
                  <RocketLaunch className="!text-[30px]" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight text-[#172b46] sm:text-2xl">Ready to start your journey?</h2>
                  <p className="mt-1 max-w-xl text-xs leading-5 text-slate-600 sm:text-sm">
                    Create your account and choose the learning plan that fits your current goals.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link
                  to="/register"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#ff8b2b] to-[#ff6710] px-7 py-3 text-sm font-black text-white no-underline shadow-[0_13px_35px_rgba(255,118,22,0.23)] transition-all hover:-translate-y-0.5 hover:shadow-[0_17px_45px_rgba(255,118,22,0.28)]"
                >
                  Get Started Now
                  <ArrowForward className="!text-[18px]" />
                </Link>
                <p className="mt-2 text-center text-[10px] font-semibold text-slate-500">Start with your ApnaAcademy account</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
