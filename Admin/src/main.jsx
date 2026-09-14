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

const Root = () => {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Page = routes[hash];
  return Page ? <Page /> : <App />;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
