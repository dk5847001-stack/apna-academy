import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpward,
  CalendarMonth,
  ChevronRight,
  Cookie,
  Description,
  Email,
  Lock,
  ManageAccounts,
  Payments,
  Person,
  Security,
  Share,
  TableOfContents,
} from "@mui/icons-material";

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    icon: Description,
    text: "This Privacy Policy explains how ApnaAcademy handles information when you use our website and learning services. We are committed to protecting your privacy and ensuring your personal information is collected, used and stored securely, in accordance with applicable laws and regulations.",
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    icon: Person,
    text: "We may collect information you provide when you create an account, purchase a course, contact support, subscribe to updates or use learning features, including your name, email, account details, purchase information and messages.",
  },
  {
    id: "how-we-use-information",
    title: "How We Use Information",
    icon: ManageAccounts,
    text: "We use information to operate and secure the platform, process purchases, provide course access, support learners, maintain certificates, communicate service updates and improve our services.",
  },
  {
    id: "payments",
    title: "Payments",
    icon: Payments,
    text: "Online payments are processed through our payment provider. We may retain order identifiers, payment status and transaction metadata for reconciliation, fraud prevention and support.",
  },
  {
    id: "cookies-local-storage",
    title: "Cookies & Local Storage",
    icon: Cookie,
    text: "Authentication cookies and local browser storage may be used for secure sessions and preferences such as theme settings.",
  },
  {
    id: "data-sharing",
    title: "Data Sharing",
    icon: Share,
    text: "We do not sell personal information. Service providers may process information only as necessary for hosting, payments, authentication, video delivery and security.",
  },
  {
    id: "security-retention",
    title: "Security & Retention",
    icon: Security,
    text: "We use reasonable safeguards and retain information as needed for service operation, legal, payment, security and support purposes. No internet service can guarantee absolute security.",
  },
  {
    id: "your-rights",
    title: "Your Rights",
    icon: Person,
    text: "You can access, correct or delete your personal information and manage your preferences at any time. For privacy requests contact support@apnaacademy.in.",
  },
  {
    id: "contact-updates",
    title: "Contact & Updates",
    icon: Email,
    text: "For privacy requests or questions, contact support@apnaacademy.in. We may update this policy when our services, security practices or legal obligations change.",
  },
];

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function PrivacyPolicy() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id);

  const sectionMap = useMemo(() => new Map(SECTIONS.map((section) => [section.id, section])), []);

  useEffect(() => {
    const observers = [];
    const handleIntersection = (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id && sectionMap.has(visible.target.id)) {
        setActiveId(visible.target.id);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-18% 0px -68% 0px",
      threshold: [0.05, 0.2, 0.5, 0.8],
    });

    SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        observers.push(element);
      }
    });

    return () => {
      observer.disconnect();
      observers.length = 0;
    };
  }, [sectionMap]);

  const activeIndex = Math.max(0, SECTIONS.findIndex((section) => section.id === activeId));

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8fbff] text-slate-900">
      <section className="relative overflow-hidden border-b border-blue-100/70 bg-gradient-to-br from-white via-blue-50/80 to-indigo-50/70">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="pointer-events-none absolute right-[-6rem] top-[-5rem] h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-cyan-100/40 blur-3xl" />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] text-blue-600 shadow-sm backdrop-blur-xl">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Lock fontSize="inherit" />
              </span>
              Legal
            </div>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[48px] lg:leading-[1.08]">
              Privacy <span className="text-blue-600">Policy</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              We value your trust. This Privacy Policy explains how ApnaAcademy handles your information and keeps it safe.
            </p>
            <div className="mt-5 flex items-center gap-2 text-sm font-medium text-blue-700">
              <CalendarMonth fontSize="small" />
              <span>Last updated: September 14, 2026</span>
            </div>
          </div>

          <div className="relative hidden min-h-[190px] items-center justify-center lg:flex" aria-hidden="true">
            <div className="absolute h-44 w-72 rotate-[-8deg] rounded-2xl border border-white/90 bg-white/65 shadow-[0_24px_60px_rgba(37,99,235,0.12)] backdrop-blur-xl" />
            <div className="absolute -left-2 top-10 h-16 w-16 rotate-[-8deg] rounded-2xl border border-white/90 bg-blue-100/80 shadow-lg">
              <div className="flex h-full items-center justify-center text-blue-600"><Person /></div>
            </div>
            <div className="absolute left-10 top-1 h-44 w-56 rotate-[-8deg] rounded-2xl border border-blue-100 bg-white/85 p-6 shadow-xl backdrop-blur-xl">
              <div className="space-y-3">
                <div className="h-3 w-28 rounded-full bg-blue-100" />
                <div className="h-2 w-40 rounded-full bg-slate-200" />
                <div className="h-2 w-32 rounded-full bg-slate-200" />
                <div className="h-2 w-36 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="relative z-10 ml-36 flex h-32 w-28 items-center justify-center rounded-[32px] bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_24px_50px_rgba(37,99,235,0.3)]">
              <div className="absolute inset-3 rounded-[24px] border border-white/20" />
              <Lock className="!text-6xl !text-white" />
            </div>
            <div className="absolute bottom-2 right-16 h-7 w-7 rounded-full bg-blue-500 shadow-lg" />
            <div className="absolute left-20 top-4 h-4 w-4 rounded-full bg-blue-400" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-2xl border border-blue-100 bg-white/85 p-4 shadow-[0_12px_40px_rgba(37,99,235,0.07)] backdrop-blur-xl lg:sticky lg:top-24">
          <div className="flex items-center gap-3 px-1 py-1">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><TableOfContents fontSize="small" /></span>
            <div>
              <h2 className="text-sm font-black text-slate-900">Table of Contents</h2>
              <p className="text-[10px] text-slate-500">Quick navigation to sections</p>
            </div>
          </div>

          <nav className="mt-4 space-y-1.5">
            {SECTIONS.map((section, index) => {
              const active = activeId === section.id;
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => scrollToSection(section.id)}
                  className={`group flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs font-semibold transition ${
                    active ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-extrabold ${
                    active ? "border-blue-500 bg-blue-600 text-white" : "border-blue-100 bg-blue-50 text-blue-700"
                  }`}>{index + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{section.title}</span>
                  <ChevronRight className={`shrink-0 text-sm transition ${
                    active ? "translate-x-0 text-blue-500" : "opacity-0 group-hover:translate-x-0.5 group-hover:opacity-100"
                  }`} />
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm"><Security fontSize="small" /></span>
              <div>
                <p className="text-xs font-black text-slate-900">Your data, your control</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-600">You can manage your information, preferences and account settings anytime from your profile.</p>
                <button type="button" onClick={() => scrollToSection("cookies-local-storage")} className="mt-3 inline-flex items-center gap-1 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-[10px] font-bold text-blue-600 shadow-sm hover:bg-blue-50">
                  Manage Settings <ChevronRight className="!text-sm" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        <article className="min-w-0 rounded-2xl border border-blue-100 bg-white/90 p-4 shadow-[0_12px_40px_rgba(37,99,235,0.07)] backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="space-y-0">
            {SECTIONS.map((section, index) => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={section.id} className="scroll-mt-24 border-b border-slate-100 py-4 first:pt-0 last:border-b-0 last:pb-0 sm:py-5">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="flex shrink-0 items-start gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-700 ring-4 ring-blue-50/70">{index + 1}</span>
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600"><Icon fontSize="small" /></span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-black text-slate-950 sm:text-base">{section.title}</h2>
                      <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs sm:leading-5">{section.text}</p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="mt-4 flex w-full items-center gap-3 rounded-xl bg-blue-50 px-4 py-3 text-left transition hover:bg-blue-100">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm"><Security fontSize="small" /></span>
            <span className="flex-1">
              <span className="block text-xs font-bold text-slate-900">Back to top</span>
              <span className="block text-[10px] text-slate-500">Jump to the top of this page</span>
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-blue-600"><ArrowUpward fontSize="small" /></span>
          </button>
        </article>
      </section>
    </main>
  );
}
