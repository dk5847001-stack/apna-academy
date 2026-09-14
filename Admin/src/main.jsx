import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
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

const ManagementNav = () => (
  <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
    <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
      <a href="#" className="mr-2 shrink-0 font-extrabold text-slate-900">
        ApnaAcademy Admin
      </a>
      {[
        ["#users", "Users"],
        ["#notifications", "Notifications"],
        ["#purchases", "Purchases"],
        ["#progress", "Progress"],
        ["#certificates", "Certificates"],
      ].map(([href, label]) => (
        <a
          key={href}
          href={href}
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
        >
          {label}
        </a>
      ))}
    </div>
  </nav>
);

const Root = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Page = routes[hash];
  return (
    <>
      {Page && <ManagementNav />}
      {Page ? <Page /> : <App />}
    </>
  );
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
