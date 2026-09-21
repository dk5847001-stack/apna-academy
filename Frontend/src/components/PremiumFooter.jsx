import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Apps,
  ArrowForward,
  Dashboard,
  Explore,
  Facebook,
  GitHub,
  Instagram,
  LinkedIn,
  MailOutline,
  MenuBook,
  School,
  Settings,
} from "@mui/icons-material";
import { ADMIN_URL, API_BASE_URL, COURSE_URL, DASHBOARD_URL, DSA_URL } from "../constants/config";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/dilkhush_10star?stkn=MXVubXJtbHdtODA0aA==", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/share/1EkezcKBs2/", icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dilkhush-kumar-43a426372", icon: LinkedIn },
  { label: "GitHub", href: "https://github.com/dk5847001-stack", icon: GitHub },
];

const SECTION_META = {
  explore: { icon: Explore, label: "Explore" },
  account: { icon: MenuBook, label: "Learning & Account" },
  apps: { icon: Apps, label: "ApnaAcademy Apps" },
};

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="group inline-flex w-fit items-center gap-2 rounded-lg py-1 text-[15px] font-medium text-slate-700 no-underline transition duration-200 hover:text-blue-700"
    >
      <span>{children}</span>
      <ArrowForward
        aria-hidden="true"
        className="!text-[15px] opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100"
      />
    </Link>
  );
}

function SectionHeading({ type }) {
  const { icon: Icon, label } = SECTION_META[type];

  return (
    <div className="inline-flex flex-col items-start">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-white/85 text-blue-600 shadow-[0_8px_22px_rgba(37,99,235,0.12)] backdrop-blur-xl">
          <Icon fontSize="small" />
        </span>
        <span className="text-[13px] font-black uppercase tracking-[0.14em] text-slate-800">
          {label}
        </span>
      </div>
      <span className="ml-1 mt-2 h-0.5 w-8 rounded-full bg-blue-500" />
    </div>
  );
}

function AppCard({ icon: Icon, title, description, onClick, accent = "blue" }) {
  const accentClasses =
    accent === "violet"
      ? "border-violet-100 bg-violet-50/80 text-violet-600 shadow-[0_12px_30px_rgba(124,58,237,0.10)] hover:border-violet-200 hover:bg-violet-50"
      : accent === "slate"
        ? "border-slate-200 bg-slate-50/85 text-slate-600 shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:border-slate-300 hover:bg-white"
        : "border-blue-100 bg-blue-50/85 text-blue-600 shadow-[0_12px_30px_rgba(37,99,235,0.10)] hover:border-blue-200 hover:bg-blue-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-[20px] border border-white/90 bg-white/65 p-4 text-left shadow-[0_12px_32px_rgba(37,99,235,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:bg-white/80"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${accentClasses}`}
      >
        <Icon fontSize="small" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-extrabold text-slate-900">{title}</span>
        <span className="mt-1 block text-[12px] leading-4 text-slate-500">{description}</span>
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50/90 text-blue-600 transition duration-200 group-hover:translate-x-0.5 group-hover:bg-blue-100">
        <ArrowForward className="!text-[18px]" />
      </span>
    </button>
  );
}

export default function PremiumFooter() {
  const [user, setUser] = useState(getStoredUser);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("token") && user);
  const isAdmin = isLoggedIn && user?.role === "admin";

  useLayoutEffect(() => {
    const hideLegacyFooters = () => {
      document.querySelectorAll("footer:not([data-premium-footer='true'])").forEach((footer) => footer.classList.add("hidden"));
    };
    hideLegacyFooters();
    const observer = new MutationObserver(hideLegacyFooters);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncAuth = () => setUser(getStoredUser());
    window.addEventListener("storage", syncAuth);
    window.addEventListener("apnaacademy-auth-change", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("apnaacademy-auth-change", syncAuth);
    };
  }, []);

  const goTo = (url) => {
    window.location.href = url;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("apnaacademy-auth-change"));
    window.location.href = "/login";
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setStatus("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch(`${API_BASE_URL}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Subscription failed.");
      }

      setEmail("");
      setStatus(data?.message || "Subscribed successfully.");
    } catch (error) {
      setStatus(error?.message || "Unable to subscribe right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer
      data-premium-footer="true"
      className="relative isolate overflow-hidden border-t border-slate-200/80 bg-[#fbfcff] text-slate-800 shadow-[0_-18px_60px_rgba(37,99,235,0.06)]"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 -top-28 h-[30rem] w-[30rem] rounded-full bg-blue-100/55 blur-3xl" />
        <div className="absolute -right-48 top-20 h-[34rem] w-[34rem] rounded-full bg-indigo-100/50 blur-3xl" />
        <div className="absolute left-1/2 top-36 h-[22rem] w-[38rem] -translate-x-1/2 rounded-full bg-cyan-50/70 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-blue-50/60 via-white/10 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-[1700px] px-5 py-12 sm:px-8 sm:py-14 lg:px-12 lg:py-16 xl:px-16">
        <div className="grid grid-cols-1 gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.65fr_0.95fr_1.05fr_1.2fr] lg:gap-x-10 xl:gap-x-16">
          <div className="min-w-0">
            <Link to="/" className="group inline-flex items-center gap-4 no-underline">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] border border-blue-300/70 bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-600 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24),inset_0_1px_0_rgba(255,255,255,0.55)] transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-[0_20px_42px_rgba(37,99,235,0.28)]">
                <School className="!text-[43px]" />
              </span>
              <span>
                <span className="block text-[27px] font-black tracking-[-0.04em] text-slate-900">
                  Apna<span className="text-blue-600">Academy</span>
                </span>
                <span className="mt-1 block text-[16px] font-medium text-slate-500">Learn. Build. Grow.</span>
              </span>
            </Link>

            <p className="mt-5 max-w-xl text-[15px] leading-7 text-slate-700 sm:text-[16px]">
              Practical, structured learning for students who want to build real skills, complete projects and grow with confidence.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="rounded-full border border-blue-100 bg-blue-50/80 px-3.5 py-1.5 text-[11px] font-extrabold text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.06)]">
                Practical Learning
              </span>
              <span className="rounded-full border border-emerald-100 bg-emerald-50/80 px-3.5 py-1.5 text-[11px] font-extrabold text-emerald-600 shadow-[0_6px_16px_rgba(16,185,129,0.06)]">
                Career Focused
              </span>
              <span className="rounded-full border border-violet-100 bg-violet-50/80 px-3.5 py-1.5 text-[11px] font-extrabold text-violet-600 shadow-[0_6px_16px_rgba(124,58,237,0.06)]">
                Verified Certificates
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2.5 rounded-[14px] bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-[14px] font-extrabold text-white no-underline shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(37,99,235,0.28)]"
              >
                <MenuBook fontSize="small" />
                Explore Courses
                <ArrowForward className="!text-[17px]" />
              </Link>
              <button
                type="button"
                onClick={() => goTo(isLoggedIn ? DASHBOARD_URL : "/register")}
                className="inline-flex items-center gap-2.5 rounded-[14px] border border-blue-100 bg-white/80 px-5 py-3 text-[14px] font-extrabold text-slate-800 shadow-[0_10px_24px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700"
              >
                <Dashboard fontSize="small" />
                {isLoggedIn ? "Open Dashboard" : "Get Started"}
              </button>
            </div>

            <div className="mt-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">Follow us</p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-white/90 text-slate-500 shadow-[0_8px_18px_rgba(37,99,235,0.08)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-100 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Icon fontSize="small" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionHeading type="explore" />
            <div className="mt-4 flex flex-col items-start gap-1.5">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/courses">All Courses</FooterLink>
              <FooterLink to="/pricing">Pricing</FooterLink>
              <FooterLink to="/blog">Blog</FooterLink>
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </div>
          </div>

          <div>
            <SectionHeading type="account" />
            <div className="mt-4 flex flex-col items-start gap-1.5">
              <button type="button" onClick={() => goTo(COURSE_URL)} className="w-fit border-0 bg-transparent py-1 text-left text-[15px] font-medium text-slate-700 transition hover:text-blue-700">
                Learning App
              </button>

              {isLoggedIn ? (
                <>
                  <button type="button" onClick={() => goTo(DASHBOARD_URL)} className="w-fit border-0 bg-transparent py-1 text-left text-[15px] font-medium text-slate-700 transition hover:text-blue-700">Dashboard</button>
                  <button type="button" onClick={() => goTo(`${DASHBOARD_URL}/courses`)} className="w-fit border-0 bg-transparent py-1 text-left text-[15px] font-medium text-slate-700 transition hover:text-blue-700">My Courses</button>
                  <button type="button" onClick={() => goTo(`${DASHBOARD_URL}/profile`)} className="w-fit border-0 bg-transparent py-1 text-left text-[15px] font-medium text-slate-700 transition hover:text-blue-700">Profile</button>
                  <button type="button" onClick={() => goTo(`${DASHBOARD_URL}/notifications`)} className="w-fit border-0 bg-transparent py-1 text-left text-[15px] font-medium text-slate-700 transition hover:text-blue-700">Notifications</button>
                  <button type="button" onClick={handleLogout} className="w-fit border-0 bg-transparent py-1 text-left text-[15px] font-medium text-red-500 transition hover:text-red-600">Logout</button>
                </>
              ) : (
                <>
                  <FooterLink to="/login">Sign In</FooterLink>
                  <FooterLink to="/register">Create Account</FooterLink>
                </>
              )}

              <FooterLink to="/contact">Learning Support</FooterLink>
              <FooterLink to="/contact">Help Center</FooterLink>
            </div>
          </div>

          <div>
            <SectionHeading type="apps" />
            <div className="mt-4 space-y-3">
              <AppCard icon={Dashboard} title="Student Dashboard" description="Profile & progress" onClick={() => goTo(DASHBOARD_URL)} />
              <AppCard icon={MenuBook} title="Learning App" description="Courses & lessons" onClick={() => goTo(COURSE_URL)} accent="violet" />
              <AppCard icon={School} title="DSA Practice" description="Practice & challenges" accent="slate" onClick={() => goTo(DSA_URL)} />
              {isAdmin && <AppCard icon={Settings} title="Admin Portal" description="Administration" accent="slate" onClick={() => goTo(ADMIN_URL)} />}
            </div>
          </div>
        </div>

        <div className="relative mx-auto mt-12 max-w-[1120px] sm:mt-14">
          <div className="pointer-events-none absolute -left-16 -top-10 hidden text-blue-500/80 lg:block">
            <School className="!text-[82px] -rotate-12 drop-shadow-[0_10px_18px_rgba(37,99,235,0.14)]" />
          </div>

          <div className="relative rounded-[24px] border border-white/90 bg-blue-50/65 p-5 shadow-[0_18px_50px_rgba(37,99,235,0.10),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl sm:p-6">
            <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto] lg:gap-8">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-white/80 text-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.10)]">
                  <MailOutline />
                </span>
                <div className="min-w-0">
                  <p className="text-[17px] font-extrabold text-slate-900">Stay updated</p>
                  <p className="mt-1 text-[12px] leading-5 text-slate-500">Get course announcements and platform updates.</p>
                </div>
              </div>

              <form onSubmit={handleSubscribe} className="flex w-full min-w-0 flex-col gap-2 sm:flex-row lg:w-[560px]">
                <div className="relative min-w-0 flex-1">
                  <MailOutline className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 !text-[18px] text-blue-500" />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    maxLength={254}
                    placeholder="Enter your email address"
                    className="h-12 w-full rounded-full border border-white/90 bg-white/95 pl-11 pr-4 text-[13px] font-semibold text-slate-800 outline-none shadow-[0_8px_20px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.95)] placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 px-7 text-[13px] font-extrabold text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(37,99,235,0.26)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Subscribing..." : "Subscribe"}
                  <ArrowForward className="!text-[17px]" />
                </button>
              </form>
            </div>
            <p className="mt-2 min-h-4 pl-1 text-xs font-bold text-slate-500" aria-live="polite">{status}</p>
          </div>
        </div>

        <div className="pointer-events-none relative mt-8 hidden h-8 lg:block">
          <div className="absolute right-36 top-0 flex items-end gap-3 text-blue-500/85">
            <span className="max-w-[150px] -rotate-6 text-center font-serif text-[21px] font-bold italic leading-5">
              Better Learning
              <br />
              <span className="text-[18px]">Brighter Future</span>
            </span>
            <div className="relative h-16 w-28">
              <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-300 via-blue-600 to-indigo-700 shadow-[0_10px_26px_rgba(37,99,235,0.28)]" />
              <div className="absolute left-0 top-1/2 h-10 w-28 -translate-y-1/2 rounded-[50%] border border-blue-400/40 -rotate-6" />
            </div>
          </div>
        </div>

        <div className="relative mt-4 rounded-[22px] border border-white/90 bg-white/70 px-5 py-5 shadow-[0_16px_42px_rgba(37,99,235,0.08),inset_0_1px_0_rgba(255,255,255,0.98)] backdrop-blur-2xl sm:px-7 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[12px] font-semibold text-slate-700">© {new Date().getFullYear()} ApnaAcademy. All rights reserved.</p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">Built for practical learning, structured progress and career-focused skill development.</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
              <FooterLink to="/refund-policy">Refund Policy</FooterLink>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/contact">Support</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
