import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowForward, ArrowUpward, AutoAwesome, Code, DesignServices, Email,
  Groups, LocationOn, Phone, RocketLaunch, School, Send, Star, Storage, Verified,
} from "@mui/icons-material";
import api from "../services/api";

const TEAM = [
  { name: "Harry Ali Khan", role: "Team Management", bio: "Focused on building a structured learning environment where students can learn, practice and grow with confidence.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-ZG7Em57ag-WD1-dICUGdF7lH1wJ-kYAdQ8XgryiMag&s=10", icon: Code, tone: "blue" },
  { name: "Shradha Khapra", role: "Team Director", bio: "Creates engaging learning experiences with a strong focus on clarity, accessibility and practical technology skills.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDE-SJTtsq58khCMm50OCqxyL5HHjlwROvDfsOUcF6Ww&s=10", icon: DesignServices, tone: "violet" },
  { name: "Alakh Panday", role: "Team Leader", bio: "Brings a practical, learner-first approach to technical education, systems and scalable digital learning.", image: "https://www.cioandleader.com/wp-content/uploads/2024/09/Alakh-Pandey-Founder-and-CEO-Physics-Wallah-PW.jpg", icon: Storage, tone: "indigo" },
  { name: "Sneha Patel", role: "Data Analytics", bio: "Turns learning data and user insights into thoughtful improvements for a smoother and more useful student experience.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGWPFfG2wBAHhPdOXIyP3JZGnHogJLqntEnjBrdcQnSQ&s=10", icon: DesignServices, tone: "cyan" },
];

const VALUES = [
  ["Practical by design", "Learning should move beyond theory. We focus on hands-on practice, projects and skills students can actually use.", Code],
  ["Progress that is visible", "Structured modules, assessments and progress tracking help learners understand where they are and what comes next.", Star],
  ["Built around learners", "We keep the experience simple, accessible and focused on helping students build confidence step by step.", Groups],
  ["Career focused", "Courses are designed around useful technical skills, project work and outcomes that support long-term growth.", School],
];

const PROCESS = [
  ["01", "Learn", "Understand concepts through structured lessons and focused explanations."],
  ["02", "Practice", "Apply what you learn with examples, challenges and hands-on work."],
  ["03", "Build", "Turn knowledge into meaningful projects that demonstrate real skills."],
  ["04", "Grow", "Track progress, complete assessments and keep building your career profile."],
];

const SUBJECTS = ["Course enquiry", "Account & login", "Payment & purchase", "Certificate", "Internship program", "Technical support", "Other"];

const TONES = {
  blue: { border: "border-blue-100", icon: "bg-blue-50 text-blue-600", badge: "bg-blue-600", text: "text-blue-700", gradient: "from-blue-500 to-indigo-500", wash: "from-blue-50 via-white to-indigo-50" },
  violet: { border: "border-violet-100", icon: "bg-violet-50 text-violet-600", badge: "bg-violet-600", text: "text-violet-700", gradient: "from-violet-500 to-fuchsia-500", wash: "from-violet-50 via-white to-fuchsia-50" },
  indigo: { border: "border-indigo-100", icon: "bg-indigo-50 text-indigo-600", badge: "bg-indigo-600", text: "text-indigo-700", gradient: "from-indigo-500 to-blue-500", wash: "from-indigo-50 via-white to-blue-50" },
  cyan: { border: "border-cyan-100", icon: "bg-cyan-50 text-cyan-600", badge: "bg-cyan-600", text: "text-cyan-700", gradient: "from-cyan-500 to-blue-500", wash: "from-cyan-50 via-white to-blue-50" },
};

export default function AboutPremium() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const change = (e) => {
    setForm((v) => ({ ...v, [e.target.name]: e.target.value }));
    setNotice("");
    setError("");
  };

  const submit = async (e) => {
    e.preventDefault();
    const data = { name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() };
    if (data.name.length < 2 || !/^\S+@\S+\.\S+$/.test(data.email) || data.subject.length < 3 || data.message.length < 10) {
      setError("Please enter valid details and a message of at least 10 characters.");
      return;
    }
    try {
      setLoading(true);
      await api.post("/messages", data);
      setForm({ name: "", email: "", subject: "", message: "" });
      setNotice("Message sent successfully. Our team will review it soon.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#f7faff] text-slate-900">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute right-[-9rem] top-[30rem] h-96 w-96 rounded-full bg-indigo-200/25 blur-3xl" />
        <div className="absolute bottom-[18rem] left-[28%] h-80 w-80 rounded-full bg-cyan-100/35 blur-3xl" />
      </div>

      <section className="relative overflow-hidden border-b border-blue-100/80">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700">
              <AutoAwesome sx={{ fontSize: 15 }} /> About ApnaAcademy
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Building a better
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 bg-clip-text text-transparent">learning future.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              At ApnaAcademy, we are passionate about creating opportunities for students to learn, build skills and achieve their career goals through practical, hands-on learning.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white no-underline shadow-[0_10px_25px_rgba(37,99,235,.18)] transition hover:-translate-y-0.5 hover:bg-blue-700">Explore Courses <ArrowForward sx={{ fontSize: 18 }} /></Link>
              <Link to="/contact" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-extrabold text-slate-700 no-underline shadow-sm backdrop-blur transition hover:border-blue-200 hover:bg-blue-50">Contact Us</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-slate-600">
              {["Practical Learning", "Student Focused", "Career Ready"].map((item) => (
                <span key={item} className="flex items-center gap-2"><Verified sx={{ fontSize: 18 }} className="!text-blue-600" />{item}</span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-blue-200/40 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/90 bg-white/75 p-2 shadow-[0_28px_80px_rgba(37,99,235,.14)] backdrop-blur-xl">
              <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=88" alt="Students learning together" className="aspect-[4/3] w-full rounded-[1.55rem] object-cover" />
              <div className="absolute -bottom-5 left-5 right-5 rounded-2xl border border-blue-100/80 bg-white/90 p-4 shadow-xl backdrop-blur-xl sm:left-8 sm:right-8">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-lg font-black text-slate-950">10K+</p><p className="text-[10px] font-bold text-slate-500">Learners</p></div>
                  <div><p className="text-lg font-black text-slate-950">50+</p><p className="text-[10px] font-bold text-slate-500">Courses</p></div>
                  <div><p className="text-lg font-black text-blue-600">4.8/5</p><p className="text-[10px] font-bold text-slate-500">Experience</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100/70 bg-white/65 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["10K+", "Learners", Groups], ["50+", "Practical Courses", School], ["100+", "Learning Modules", RocketLaunch], ["4.8/5", "Learning Experience", Star]].map(([value, label, Icon]) => (
              <div key={label} className="group rounded-2xl border border-blue-100/80 bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,.04)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-105"><Icon /></div>
                  <div><p className="text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-sm font-semibold text-slate-500">{label}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <span className="inline-flex rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-blue-700 shadow-sm">Our Purpose</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Creating a better learning journey</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">ApnaAcademy brings structured learning, practical skills, measurable progress and digital achievements together in one modern platform.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {[
              [School, "Our Mission", "Make meaningful learning more accessible.", "Our goal is to create a learning environment where students can discover useful skills, follow structured learning paths, track their progress and build confidence through practical learning."],
              [RocketLaunch, "Our Vision", "Build a better digital learning journey.", "We envision a platform where technology, structured education and practical experiences come together to help learners continuously improve and prepare for real-world opportunities."],
            ].map(([Icon, label, title, text]) => (
              <article key={label} className="group rounded-[1.75rem] border border-blue-100/80 bg-white/90 p-7 shadow-[0_14px_45px_rgba(15,23,42,.05)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon /></div>
                <p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-blue-600">{label}</p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100/70 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <span className="inline-flex rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-blue-700">Why ApnaAcademy</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Learning that feels <span className="text-blue-600">useful.</span></h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">We combine structured education with practical execution so learners can turn concepts into confidence and projects.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(([title, text, Icon]) => (
              <article key={title} className="group rounded-2xl border border-blue-100/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon /></span>
                <h3 className="mt-5 text-lg font-black text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><Code sx={{ fontSize: 15 }} /> How We Help You Grow</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">From learning to <span className="text-blue-600">real skills</span></h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">A simple journey designed to keep learners moving forward.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {PROCESS.map(([number, title, text], index) => (
              <div key={number} className="relative rounded-3xl border border-blue-100/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
                <span className="text-4xl font-black text-blue-100">{number}</span>
                <h3 className="mt-3 text-base font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                {index < PROCESS.length - 1 && <span className="absolute -right-3 top-1/2 z-10 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-blue-100 bg-white text-blue-400 shadow-sm md:flex">›</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          <div className="grid items-center gap-8 rounded-[2rem] border border-blue-100/80 bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-10 shadow-[0_24px_70px_rgba(37,99,235,.10)] sm:px-10 sm:py-12 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><Verified /></div><p className="text-sm font-extrabold text-blue-600">Built around learners</p></div>
              <h2 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">Simple. Practical. Career focused.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">Every part of the platform is designed to keep learning clear, structured and focused on meaningful progress.</p>
            </div>
            <Link to="/courses" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white no-underline shadow-sm transition hover:bg-blue-700">Explore Courses <ArrowForward sx={{ fontSize: 18 }} /></Link>
          </div>
        </div>
      </section>

      <section className="border-t border-blue-100/70">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><Groups sx={{ fontSize: 15 }} /> Meet Our Team</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">The people behind <span className="text-blue-600">your success.</span></h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600">A passionate team bringing education, technology and learner-first thinking together.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {TEAM.map(({ name, role, bio, image, icon: Icon, tone }) => {
              const a = TONES[tone];
              return (
                <article key={name} className={"group overflow-hidden rounded-2xl border bg-white shadow-[0_10px_30px_rgba(15,23,42,.04)] transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl " + a.border}>
                  <div className={"relative overflow-hidden bg-gradient-to-br p-2 sm:p-3 " + a.wash}>
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
                    <img src={image} alt={name + " — " + role} loading="lazy" className="aspect-[1/1] w-full rounded-[1rem] object-cover object-center transition duration-500 group-hover:scale-[1.03] sm:rounded-2xl" />
                    <span className={"absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[7px] font-black uppercase tracking-wide text-white shadow-md sm:bottom-5 sm:left-5 sm:px-2.5 sm:py-1.5 sm:text-[8px] " + a.badge}><Icon sx={{ fontSize: 11 }} /> {role}</span>
                  </div>
                  <div className="p-3 sm:p-5">
                    <h3 className="text-xs font-black text-slate-950 sm:text-lg">{name}</h3>
                    <p className={"mt-0.5 text-[7px] font-black uppercase tracking-[.12em] sm:text-[9px] " + a.text}>{role}</p>
                    <p className="mt-2 line-clamp-3 text-[8px] leading-4 text-slate-500 sm:text-sm sm:leading-6">{bio}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                      <span className={"h-1 w-8 rounded-full bg-gradient-to-r sm:w-12 " + a.gradient} />
                      <span className={"flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm " + a.gradient}><ArrowForward sx={{ fontSize: 13 }} /></span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-blue-100/70 bg-white/65 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-9 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><Email sx={{ fontSize: 15 }} /> Get In Touch</span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Contact Us</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">Have questions, feedback, or need support? We&apos;re here to help. Send us a message and we&apos;ll get back to you as soon as possible.</p>
          </div>
          <div className="grid gap-7 lg:grid-cols-[1.12fr_.88fr]">
            <div className="rounded-[1.75rem] border border-blue-100/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,.06)] backdrop-blur-sm sm:p-7">
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label><span className="mb-2 block text-xs font-extrabold text-slate-700">Full Name <em className="text-red-500">*</em></span><input required name="name" value={form.name} onChange={change} placeholder="Enter your name" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" /></label>
                  <label><span className="mb-2 block text-xs font-extrabold text-slate-700">Email Address <em className="text-red-500">*</em></span><input required type="email" name="email" value={form.email} onChange={change} placeholder="Enter your email" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" /></label>
                </div>
                <label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-700">Subject <em className="text-red-500">*</em></span><select required name="subject" value={form.subject} onChange={change} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"><option value="">Select a subject</option>{SUBJECTS.map((s) => <option key={s}>{s}</option>)}</select></label>
                <label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-700">Message <em className="text-red-500">*</em></span><textarea required minLength={10} maxLength={5000} rows={5} name="message" value={form.message} onChange={change} placeholder="Your message here..." className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10" /></label>
                {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
                {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{notice}</div>}
                <button disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60">{loading ? "Sending..." : "Send Message"} <Send fontSize="small" /></button>
              </form>
            </div>
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/75 p-2 shadow-[0_18px_50px_rgba(15,23,42,.08)] backdrop-blur-xl">
                <img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=88" alt="Modern learning workspace" loading="lazy" className="aspect-[5/3] w-full rounded-[1.35rem] object-cover" />
                <div className="absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-black">Let&apos;s Build Your Future Together</p><p className="mt-1 text-[11px] text-slate-500">We&apos;re here when you need us.</p></div>
              </div>
              <div className="rounded-[1.75rem] border border-blue-100/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm sm:p-6">
                <div className="space-y-5">
                  <a href="mailto:support@apnaacademy.in" className="flex items-start gap-3 no-underline"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"><Email fontSize="small" /></span><span><b className="block text-xs text-slate-900">Email Us</b><small className="text-xs text-slate-500">support@apnaacademy.in</small></span></a>
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"><Phone fontSize="small" /></span><span><b className="block text-xs text-slate-900">Call Us</b><small className="text-xs text-slate-500">+91 98765 43210</small></span></div>
                  <div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"><LocationOn fontSize="small" /></span><span><b className="block text-xs text-slate-900">Location</b><small className="text-xs leading-5 text-slate-500">Noida, Uttar Pradesh, India</small></span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-5 rounded-[1.75rem] border border-blue-100/80 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-7 shadow-[0_20px_60px_rgba(37,99,235,.08)] sm:flex-row sm:items-center sm:p-9">
            <div><p className="text-lg font-black text-slate-950">Ready to start learning?</p><p className="mt-1 text-sm text-slate-500">Explore practical courses and build skills that move you forward.</p></div>
            <Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white no-underline shadow-sm transition hover:bg-blue-700">Explore Courses <ArrowForward fontSize="small" /></Link>
          </div>
        </div>
      </section>

      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Back to top" className="fixed bottom-5 right-5 z-20 grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white/90 text-slate-600 shadow-lg backdrop-blur transition hover:text-blue-600"><ArrowUpward fontSize="small" /></button>
    </main>
  );
}
