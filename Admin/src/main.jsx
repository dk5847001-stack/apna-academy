import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AssessmentOutlined, AutoGraphOutlined, DashboardOutlined, HomeOutlined, NotificationsNoneOutlined, PeopleOutline, QuizOutlined, SchoolOutlined, ShoppingBagOutlined, SupportAgentOutlined, WorkspacePremiumOutlined } from "@mui/icons-material";
import "./index.css";
import App from "./App.jsx";
import Analytics from "./pages/Analytics.jsx";
import Users from "./pages/Users.jsx";
import Notifications from "./pages/Notifications.jsx";
import Purchases from "./pages/Purchases.jsx";
import Progress from "./pages/Progress.jsx";
import Certificates from "./pages/Certificates.jsx";
import Support from "./pages/Support.jsx";
import Assessments from "./pages/Assessments.jsx";
import { getCurrentAdmin } from "./services/adminCourse.service";
import { DASHBOARD_URL, FRONTEND_URL } from "./constants/config";

const routes = { "#analytics": Analytics, "#users": Users, "#notifications": Notifications, "#purchases": Purchases, "#progress": Progress, "#certificates": Certificates, "#support": Support, "#assessments": Assessments };

const navItems = [
  { href: "", label: "Courses", icon: SchoolOutlined, internal: true },
  { href: "#analytics", label: "Analytics", icon: AutoGraphOutlined, internal: true },
  { href: "#users", label: "Users", icon: PeopleOutline, internal: true },
  { href: "#notifications", label: "Notifications", icon: NotificationsNoneOutlined, internal: true },
  { href: "#purchases", label: "Purchases", icon: ShoppingBagOutlined, internal: true },
  { href: "#progress", label: "Progress", icon: AssessmentOutlined, internal: true },
  { href: "#certificates", label: "Certificates", icon: WorkspacePremiumOutlined, internal: true },
  { href: "#assessments", label: "Assessments", icon: QuizOutlined, internal: true },
  { href: "#support", label: "Support", icon: SupportAgentOutlined, internal: true },
];

const externalNavItems = [
  { href: DASHBOARD_URL, label: "Dashboard", icon: DashboardOutlined },
  { href: FRONTEND_URL, label: "Home", icon: HomeOutlined },
];

function ManagementSidebar({ hash }) {
  const go = (href) => {
    window.location.hash = href;
  };

  return (
    <aside className="fixed inset-y-0 left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 p-4 pb-2">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                <SchoolOutlined fontSize="small" />
              </div>
              <div>
                <div className="font-extrabold text-blue-950">Management</div>
                <div className="text-xs font-medium text-blue-700">Platform administration</div>
              </div>
            </div>
          </div>
        </div>

        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 pb-4 pr-2 scrollbar-thin" aria-label="Admin management navigation">
          {externalNavItems.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              <Icon fontSize="small" />
              <span>{label}</span>
            </a>
          ))}

          <div className="my-3 border-t border-slate-200" />

          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href ? hash === href : !hash;
            return (
              <button
                key={label}
                type="button"
                onClick={() => go(href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition ${active ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}
              >
                <Icon fontSize="small" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-slate-200 bg-white p-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ApnaAcademy</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">Admin Console</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileManagementNav({ hash }) {
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {externalNavItems.map(({ href, label, icon: Icon }) => (
          <a key={label} href={href} className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
            <Icon fontSize="small" />
            {label}
          </a>
        ))}
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href ? hash === href : !hash;
          return (
            <a key={label} href={href || "#"} className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              <Icon fontSize="small" />
              {label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

function ManagementHeader() {
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadAdmin = async () => {
      try {
        const currentAdmin = await getCurrentAdmin();
        if (mounted && currentAdmin?.role === "admin") {
          setAdmin(currentAdmin);
        }
      } catch {
        // The page-level auth guard remains responsible for handling access errors.
      }
    };

    loadAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  const adminName = admin?.name || "Administrator";
  const adminInitial = adminName.trim().charAt(0).toUpperCase() || "A";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
          <SchoolOutlined />
        </div>
        <div className="min-w-0">
          <div className="font-extrabold leading-tight text-slate-950">ApnaAcademy</div>
          <div className="text-xs font-medium text-slate-500">Admin Console</div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700 ring-1 ring-slate-300">
            {admin?.avatar ? (
              <img src={admin.avatar} alt={adminName} className="h-full w-full object-cover" />
            ) : (
              adminInitial
            )}
          </div>
          <div className="hidden min-w-0 sm:block">
            <div className="max-w-40 truncate text-sm font-semibold leading-tight text-slate-900">{adminName}</div>
            <div className="text-xs font-medium text-slate-500">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  );
}

const Root = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Page = routes[hash];
  const managementPage = Boolean(Page);

  return (
    <>
      <ManagementSidebar hash={hash} />
      {managementPage && <MobileManagementNav hash={hash} />}
      {managementPage ? (
        <>
          <ManagementHeader />
          <div className="min-h-screen bg-slate-50 lg:pl-64">
            <Page />
          </div>
        </>
      ) : (
        <App />
      )}
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
