import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const DSA_SETTINGS_KEY = "apnaacademy-dsa-settings";
export const THEME_KEY = "apnaacademy-theme";

const DEFAULT_SETTINGS = {
  theme: "system",
  density: "comfortable",
  reducedMotion: false,
  notifications: {
    dailyChallenge: true,
    submissions: true,
    announcements: true,
  },
  workspace: {
    sounds: false,
    wordWrap: true,
    autoSave: true,
    editorFontSize: 14,
  },
};

const cloneDefaults = () => JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

function readSettings() {
  try {
    const raw = localStorage.getItem(DSA_SETTINGS_KEY);
    if (!raw) return cloneDefaults();

    const parsed = JSON.parse(raw);
    return {
      ...cloneDefaults(),
      ...parsed,
      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(parsed.notifications || {}),
      },
      workspace: {
        ...DEFAULT_SETTINGS.workspace,
        ...(parsed.workspace || {}),
      },
    };
  } catch {
    return cloneDefaults();
  }
}

function resolveTheme(theme) {
  if (theme === "dark" || theme === "light") return theme;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", resolveTheme(theme) === "dark");
  root.style.colorScheme = resolveTheme(theme);
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(readSettings);

  useEffect(() => {
    try {
      localStorage.setItem(DSA_SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(THEME_KEY, settings.theme);
    } catch {
      // Settings remain usable for the current session if storage is unavailable.
    }

    applyTheme(settings.theme);
  }, [settings]);

  useEffect(() => {
    if (settings.theme !== "system") return undefined;

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;

    const handleChange = () => applyTheme("system");
    media.addEventListener?.("change", handleChange);

    return () => media.removeEventListener?.("change", handleChange);
  }, [settings.theme]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === DSA_SETTINGS_KEY && event.newValue) {
        try {
          setSettings(JSON.parse(event.newValue));
        } catch {
          // Ignore malformed external storage changes.
        }
      }

      if (event.key === THEME_KEY && event.newValue) {
        setSettings((current) => ({ ...current, theme: event.newValue }));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateSettings = (updater) => {
    setSettings((current) => {
      const next = typeof updater === "function" ? updater(current) : updater;
      return next;
    });
  };

  const setTheme = (theme) => updateSettings((current) => ({ ...current, theme }));

  const setDensity = (density) => updateSettings((current) => ({ ...current, density }));

  const setReducedMotion = (enabled) =>
    updateSettings((current) => ({ ...current, reducedMotion: enabled }));

  const setNotification = (key, enabled) =>
    updateSettings((current) => ({
      ...current,
      notifications: { ...current.notifications, [key]: enabled },
    }));

  const setWorkspace = (key, value) =>
    updateSettings((current) => ({
      ...current,
      workspace: { ...current.workspace, [key]: value },
    }));

  const resetSettings = () => setSettings(cloneDefaults());

  const value = useMemo(
    () => ({
      settings,
      setTheme,
      setDensity,
      setReducedMotion,
      setNotification,
      setWorkspace,
      resetSettings,
    }),
    [settings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}
