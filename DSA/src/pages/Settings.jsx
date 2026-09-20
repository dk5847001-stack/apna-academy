import { useState } from "react";
import {
  Bell,
  Check,
  ChevronRight,
  Contrast,
  Keyboard,
  Monitor,
  Moon,
  RotateCcw,
  Save,
  Settings2,
  Sun,
  Volume2,
  VolumeX,
  WandSparkles,
} from "lucide-react";
import { useSettings } from "../context/SettingsContext.jsx";

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3 border-b border-slate-100 p-5 sm:p-6 dark:border-slate-800">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-black text-slate-950 dark:text-white">{title}</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="space-y-4 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-5 rounded-2xl border border-slate-200 p-4 transition hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700">
      <span className="min-w-0">
        <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">{label}</span>
        {description && <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{description}</span>}
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="block h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-slate-950 peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20 dark:bg-slate-700 dark:peer-checked:bg-blue-600" />
        <span className="pointer-events-none absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Choice({ active, icon: Icon, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white shadow-lg shadow-slate-950/10 dark:border-blue-500 dark:bg-blue-600"
          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-700"
      }`}
    >
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
        active ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800"
      }`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black">{title}</span>
        <span className={`mt-1 block text-xs leading-5 ${
          active ? "text-white/70" : "text-slate-500 dark:text-slate-400"
        }`}>{description}</span>
      </span>
      {active && <Check className="h-5 w-5 shrink-0" />}
    </button>
  );
}

export default function Settings() {
  const {
    settings,
    setTheme,
    setDensity,
    setReducedMotion,
    setNotification,
    setWorkspace,
    resetSettings,
  } = useSettings();
  const [saved, setSaved] = useState(false);
  const [permission, setPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  const flashSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch {
      setPermission("denied");
    }
  };

  const reset = () => {
    resetSettings();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <div className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl shadow-slate-950/10 sm:p-8 dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">DSA Preferences</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Settings</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              Personalize your DSA workspace. Preferences are stored locally on this device and do not change your account permissions or paid access.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Save className="h-4 w-4" />
            {saved ? "Preferences updated" : "Changes apply instantly"}
          </div>
        </div>
      </div>

      <Section icon={Monitor} title="Appearance" description="Choose how the DSA application looks on this device.">
        <div className="grid gap-3 md:grid-cols-3">
          <Choice active={settings.theme === "light"} icon={Sun} title="Light" description="Always use the light interface." onClick={() => setTheme("light")} />
          <Choice active={settings.theme === "dark"} icon={Moon} title="Dark" description="Always use the dark interface." onClick={() => setTheme("dark")} />
          <Choice active={settings.theme === "system"} icon={Monitor} title="System" description="Follow your device appearance." onClick={() => setTheme("system")} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Choice active={settings.density === "comfortable"} icon={WandSparkles} title="Comfortable" description="More breathing room for focused learning." onClick={() => setDensity("comfortable")} />
          <Choice active={settings.density === "compact"} icon={Contrast} title="Compact" description="Fit more problems and navigation items on screen." onClick={() => setDensity("compact")} />
        </div>
      </Section>

      <Section icon={Keyboard} title="Accessibility & workspace" description="Tune motion and coding-workspace behavior without affecting authentication or course access.">
        <Toggle
          checked={settings.reducedMotion}
          onChange={setReducedMotion}
          label="Reduce motion"
          description="Prefer minimal animations and transitions."
        />
        <Toggle
          checked={settings.workspace.wordWrap}
          onChange={(value) => setWorkspace("wordWrap", value)}
          label="Editor word wrap"
          description="Wrap long code lines inside the coding workspace."
        />
        <Toggle
          checked={settings.workspace.autoSave}
          onChange={(value) => setWorkspace("autoSave", value)}
          label="Auto-save draft"
          description="Keep coding drafts locally while you work. This does not submit code."
        />
        <Toggle
          checked={settings.workspace.sounds}
          onChange={(value) => setWorkspace("sounds", value)}
          label="Workspace sounds"
          description="Allow optional UI feedback sounds where supported."
        />
        <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Editor font size</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Applies to the DSA coding workspace.</p>
            </div>
            <select
              value={settings.workspace.editorFontSize}
              onChange={(event) => setWorkspace("editorFontSize", Number(event.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {[12, 13, 14, 15, 16, 18, 20].map((size) => (
                <option key={size} value={size}>{size}px</option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications" description="Control DSA notification preferences for this browser.">
        <Toggle checked={settings.notifications.dailyChallenge} onChange={(value) => setNotification("dailyChallenge", value)} label="Daily challenge" description="Allow reminders and updates related to the daily challenge." />
        <Toggle checked={settings.notifications.submissions} onChange={(value) => setNotification("submissions", value)} label="Submission updates" description="Allow result-related notifications from the DSA workspace." />
        <Toggle checked={settings.notifications.announcements} onChange={(value) => setNotification("announcements", value)} label="Platform announcements" description="Allow important ApnaAcademy DSA announcements." />

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Browser notification permission</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Status: <span className="font-bold capitalize">{permission}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={requestNotifications}
            disabled={permission === "granted" || permission === "unsupported"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Bell className="h-4 w-4" />
            {permission === "granted" ? "Permission granted" : "Enable notifications"}
          </button>
        </div>
      </Section>

      <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900/60 dark:bg-amber-950/20 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-amber-950 dark:text-amber-200">Reset DSA preferences</p>
            <p className="mt-1 text-xs leading-5 text-amber-800 dark:text-amber-300">Restore appearance, accessibility, notification, and workspace preferences to their defaults.</p>
          </div>
          <button type="button" onClick={reset} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-xs font-black text-amber-950 hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-950/40">
            <RotateCcw className="h-4 w-4" />
            Reset preferences
          </button>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={flashSaved} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
          <Check className="h-4 w-4" />
          Confirm preferences
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 pb-4 text-[11px] font-bold text-slate-400">
        {settings.workspace.sounds ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
        Settings are device-local. Your account, submissions, progress, and premium access remain server-controlled.
      </div>
    </div>
  );
}
