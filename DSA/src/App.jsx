import { Route, Routes } from "react-router-dom";
import DSALayout from "./components/layout/DSALayout.jsx";
import Overview from "./pages/Overview.jsx";
import Problems from "./pages/Problems.jsx";
import ProblemDetails from "./pages/ProblemDetails.jsx";

function Placeholder({ title }) {
  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-14">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">ApnaAcademy DSA</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">This DSA module is planned for the next implementation phase. The shared workspace and backend-connected problem library are already available.</p>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<DSALayout />}>
        <Route index element={<Overview />} />
        <Route path="practice" element={<Problems />} />
        <Route path="practice/:slug" element={<ProblemDetails />} />
        <Route path="practice/code" element={<div />} />
        <Route path="topics" element={<Placeholder title="DSA Topics" />} />
        <Route path="companies" element={<Placeholder title="Company Questions" />} />
        <Route path="daily-challenge" element={<Placeholder title="Daily Challenge" />} />
        <Route path="study-plans" element={<Placeholder title="Study Plans" />} />
        <Route path="progress" element={<Placeholder title="My Progress" />} />
        <Route path="submissions" element={<Placeholder title="Submissions" />} />
        <Route path="bookmarks" element={<Placeholder title="Bookmarks" />} />
        <Route path="leaderboard" element={<Placeholder title="Leaderboard" />} />
        <Route path="unlock" element={<Placeholder title="Unlock All DSA" />} />
        <Route path="profile" element={<Placeholder title="Profile" />} />
        <Route path="settings" element={<Placeholder title="Settings" />} />
        <Route path="*" element={<Placeholder title="Page Not Found" />} />
      </Route>
    </Routes>
  );
}
