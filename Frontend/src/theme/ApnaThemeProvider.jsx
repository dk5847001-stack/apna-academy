import { useEffect, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { createApnaTheme } from "./theme";

const getStoredMode = () => {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

export default function ApnaThemeProvider({ children }) {
  const [mode, setMode] = useState(getStoredMode);

  useEffect(() => {
    const sync = () => setMode(getStoredMode());

    window.addEventListener("storage", sync);
    window.addEventListener("apnaacademy-theme-change", sync);

    const observer = new MutationObserver(() => {
      sync();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("apnaacademy-theme-change", sync);
      observer.disconnect();
    };
  }, []);

  const theme = useMemo(() => createApnaTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
