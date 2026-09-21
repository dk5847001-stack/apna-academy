import { useEffect, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dashboard, Facebook, GitHub, Instagram, LinkedIn, MenuBook, School, Settings } from "@mui/icons-material";
import { ADMIN_URL, API_BASE_URL, COURSE_URL, DASHBOARD_URL, DSA_URL } from "../constants/config";

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/dilkhush_10star?stkn=MXVubXJtbHdtODA0aA==", icon: Instagram },
  { label: "Facebook", href: "https://www.facebook.com/share/1EkezcKBs2/", icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dilkhush-kumar-43a426372", icon: LinkedIn },
  { label: "GitHub", href: "https://github.com/dk5847001-stack", icon: GitHub },
];

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
    <Link to={to} className="group inline-flex w-fit items-center gap-1 rounded-md py-1 text-sm text-slate-300 no-underline transition duration-200 hover:text-blue-300">
      <span>{children}</span>
      <span aria-hidden="true" className="text-xs opacity-0 transition duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">↗</span>
    </Link>
  );
}

function AppCard({ icon: Icon, title, description, onClick, accent = "blue" }) {
  const accentClasses = accent === "violet"
    ? "bg-violet-50 text-violet-600 group-hover:border-violet-200"
    : accent === "slate"
      ? "bg-slate-100 text-slate-600 group-hover:border-slate-300"
      : "bg-blue-50 text-blue-600 group-hover:border-blue-200";

  return (
    <button type="button" onClick={onClick} className="group flex w-full items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/55 p-3 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_24px_rgba(2,6,23,0.3)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-slate-800/65">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accentClasses}`}><Icon fontSize="small" /></span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-extrabold text-white">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">{description}</span>
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

  const goTo = (url) => { window.location.href = url; };

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
      if (!response.ok) throw new Error(data?.message || "Subscription failed.");
      setEmail("");
      setStatus(data?.message || "Subscribed successfully.");
    } catch (error) {
      setStatus(error?.message || "Unable to subscribe right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer data-premium-footer="true" className="relative overflow-hidden border-t border-slate-700/70 bg-slate-950/90 text-slate-200 shadow-[0_-18px_50px_rgba(2,6,23,0.45)] backdrop-blur-3xl backdrop-saturate-150 ring-1 ring-inset ring-white/5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
      <div className="pointer-events-none absolute -left-36 top-6 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-36 bottom-0 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1.25fr]">
          <div className="min-w-0">
            <Link to="/" className="inline-flex items-center gap-3 no-underline">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-lg shadow-blue-900/5"><School fontSize="small" /></span>
              <span><span className="block text-lg font-black tracking-tight text-white">ApnaAcademy</span><span className="block text-xs font-semibold text-slate-400">Learn. Build. Grow.</span></span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">Practical, structured learning for students who want to build real skills, complete projects and grow with confidence.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-extrabold text-blue-700">Practical Learning</span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-extrabold text-emerald-700">Career Focused</span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-extrabold text-slate-600">Verified Certificates</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white no-underline transition hover:bg-blue-500"><MenuBook fontSize="small" />Explore Courses</Link>
              <button type="button" onClick={() => goTo(isLoggedIn ? DASHBOARD_URL : "/register")} className="inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-900/60 px-4 py-2.5 text-sm font-extrabold text-slate-200 transition hover:border-blue-400/50 hover:bg-slate-800 hover:text-blue-300"><Dashboard fontSize="small" />{isLoggedIn ? "Open Dashboard" : "Get Started"}</button>
            </div>
            <div className="mt-7">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Follow us</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 text-slate-400 no-underline transition hover:border-blue-400/50 hover:bg-slate-800 hover:text-blue-300"><Icon fontSize="small" /></a>)}
              </div>
            </div>
            <div className="mt-7 max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_30px_rgba(2,6,23,0.28)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-inset ring-white/5">
              <p className="text-sm font-extrabold text-slate-900">Stay updated</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">Get course announcements and platform updates.</p>
              <form onSubmit={handleSubscribe} className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" maxLength={254} placeholder="Enter your email address" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-800/70 px-3.5 py-2.5 text-sm font-semibold text-white outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" />
                <button type="submit" disabled={submitting} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Subscribing..." : "Subscribe"}</button>
              </form>
              <p className="mt-2 min-h-4 text-xs font-bold text-slate-500" aria-live="polite">{status}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">Explore</p>
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
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">Learning &amp; Account</p>
            <div className="mt-4 flex flex-col items-start gap-1.5">
              <button type="button" onClick={() => goTo(COURSE_URL)} className="block w-fit border-0 bg-transparent py-1 text-left text-sm text-slate-300 transition hover:text-blue-300">Learning App</button>
              {isLoggedIn ? <>
                <button type="button" onClick={() => goTo(DASHBOARD_URL)} className="block w-fit border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition hover:text-blue-600">Dashboard</button>
                <button type="button" onClick={() => goTo(`${DASHBOARD_URL}/courses`)} className="block w-fit border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition hover:text-blue-600">My Courses</button>
                <button type="button" onClick={() => goTo(`${DASHBOARD_URL}/profile`)} className="block w-fit border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition hover:text-blue-600">Profile</button>
                <button type="button" onClick={() => goTo(`${DASHBOARD_URL}/notifications`)} className="block w-fit border-0 bg-transparent py-1 text-left text-sm text-slate-600 transition hover:text-blue-600">Notifications</button>
                <button type="button" onClick={handleLogout} className="block w-fit border-0 bg-transparent py-1 text-left text-sm text-red-400 transition hover:text-red-300">Logout</button>
              </> : <><FooterLink to="/login">Sign In</FooterLink><FooterLink to="/register">Create Account</FooterLink></>}
              <FooterLink to="/contact">Learning Support</FooterLink>
              <FooterLink to="/contact">Help Center</FooterLink>
            </div>
          </div>

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">ApnaAcademy Apps</p>
            <div className="mt-4 space-y-2.5">
              <AppCard icon={Dashboard} title="Student Dashboard" description="Profile & progress" onClick={() => goTo(DASHBOARD_URL)} />
              <AppCard icon={MenuBook} title="Learning App" description="Courses & lessons" onClick={() => goTo(COURSE_URL)} />
              <AppCard icon={School} title="DSA Practice" description="Practice & challenges" accent="violet" onClick={() => goTo(DSA_URL)} />
              {isAdmin && <AppCard icon={Settings} title="Admin Portal" description="Administration" accent="slate" onClick={() => goTo(ADMIN_URL)} />}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-700/70 pt-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div><p className="text-xs leading-5 text-slate-500">© {new Date().getFullYear()} ApnaAcademy. All rights reserved.</p><p className="mt-1 text-[11px] leading-5 text-slate-500">Built for practical learning, structured progress and career-focused skill development.</p></div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2"><FooterLink to="/privacy-policy">Privacy Policy</FooterLink><FooterLink to="/refund-policy">Refund Policy</FooterLink><FooterLink to="/about">About</FooterLink><FooterLink to="/contact">Support</FooterLink><FooterLink to="/contact">Contact</FooterLink></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
