import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AssessmentOutlined,
  NotificationsNoneOutlined,
  PeopleOutline,
  SchoolOutlined,
  ShoppingBagOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";
import "./index.css";
import App from "./App.jsx";
import Users from "./pages/Users.jsx";
import Notifications from "./pages/Notifications.jsx";
import Purchases from "./pages/Purchases.jsx";
import Progress from "./pages/Progress.jsx";
import Certificates from "./pages/Certificates.jsx";

const routes = {
  "#users": Users,
  "#notifications": Notifications,
  "#purchases": Purchases,
  "#progress": Progress,
  "#certificates": Certificates,
};

const navItems = [
  { href: "", label: "Courses", icon: SchoolOutlined },
  { href: "#users", label: "Users", icon: PeopleOutline },
  { href: "#notifications", label: "Notifications", icon: NotificationsNoneOutlined },
  { href: "#purchases", label: "Purchases", icon: ShoppingBagOutlined },
  { href: "#progress", label: "Progress", icon: AssessmentOutlined },
  { href: "#certificates", label: "Certificates", icon: WorkspacePremiumOutlined },
];

function ManagementSidebar({ hash }) {
  const go = (href) => {
    window.location.hash = href;
  };

  return (
    <aside className="fixed inset-y-0 left-0 top-16 z-40 hidden w-64 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
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

        <nav className="space-y-1.5" aria-label="Admin management navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href ? hash === href : !hash;
            return (
              <button
                key={label}
                type="button"
                onClick={() => go(href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-bold transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon fontSize="small" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ApnaAcademy</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">Admin Console</p>
        </div>
      </div>
    </aside>
  );
}

function MobileManagementNav({ hash }) {
  return (
    <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-3 py-2 shadow-sm backdrop-blur lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href ? hash === href : !hash;
          return (
            <a
              key={label}
              href={href ? href : "#"}
              className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition ${
                active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
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
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
          <SchoolOutlined />
        </div>
        <div>
          <div className="font-extrabold leading-tight text-slate-950">ApnaAcademy</div>
          <div className="text-xs font-medium text-slate-500">Admin Console</div>
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
      <MobileManagementNav hash={hash} />
      {managementPage ? (
        <div className="min-h-screen bg-slate-50 lg:pl-64">
          <ManagementHeader />
          <Page />
        </div>
      ) : (
        <App />
      )}
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
