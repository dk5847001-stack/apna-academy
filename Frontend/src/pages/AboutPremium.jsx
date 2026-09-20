import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowForward, ArrowUpward, Code, DesignServices, Email, Groups, LinkedIn, LocationOn, Phone, Send, School, Star, Storage } from "@mui/icons-material";
import api from "../services/api";

const TEAM = [
  { name: "Harry Ali Khan", role: "Team Management", bio: "Focused on building a structured learning environment where students can learn, practice and grow with confidence.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-ZG7Em57ag-WD1-dICUGdF7lH1wJ-kYAdQ8XgryiMag&s=10", icon: Code, tone: "bg-blue-50 text-blue-600", linkedin: null },
  { name: "Shradha Khapra", role: "Team Director", bio: "Creates engaging learning experiences with a strong focus on clarity, accessibility and practical technology skills.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDE-SJTtsq58khCMm50OCqxyL5HHjlwROvDfsOUcF6Ww&s=10", icon: DesignServices, tone: "bg-violet-50 text-violet-600", linkedin: null },
  { name: "Alakh Panday", role: "Team Leader", bio: "Brings a practical, learner-first approach to technical education, systems and scalable digital learning.", image: "https://www.cioandleader.com/wp-content/uploads/2024/09/Alakh-Pandey-Founder-and-CEO-Physics-Wallah-PW.jpg", icon: Storage, tone: "bg-indigo-50 text-indigo-600", linkedin: null },
  { name: "Sneha Patel", role: "Data Analytics", bio: "Turns learning data and user insights into thoughtful improvements for a smoother and more useful student experience.", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGWPFfG2wBAHhPdOXIyP3JZGnHogJLqntEnjBrdcQnSQ&s=10", icon: DesignServices, tone: "bg-pink-50 text-pink-600", linkedin: null },
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

export default function AboutPremium() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const change = (e) => { setForm((v) => ({ ...v, [e.target.name]: e.target.value })); setNotice(""); setError(""); };

  const submit = async (e) => {
    e.preventDefault();
    const data = { name: form.name.trim(), email: form.email.trim(), subject: form.subject.trim(), message: form.message.trim() };
    if (data.name.length < 2 || !/^\S+@\S+\.\S+$/.test(data.email) || data.subject.length < 3 || data.message.length < 10) { setError("Please enter valid details and a message of at least 10 characters."); return; }
    try { setLoading(true); await api.post("/messages", data); setForm({ name: "", email: "", subject: "", message: "" }); setNotice("Message sent successfully. Our team will review it soon."); }
    catch (err) { setError(err?.response?.data?.message || "Unable to send your message. Please try again."); }
    finally { setLoading(false); }
  };

  return <main className="min-h-screen overflow-x-hidden bg-white text-slate-900">
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50/70">
      <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" /><div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24">
        <div><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><Groups fontSize="small" />About Us</span><h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Building a Better<br /><span className="text-blue-600">Learning</span> Future</h1><p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">At ApnaAcademy, we are passionate about creating opportunities for students to learn, build skills and achieve their career goals through practical, hands-on learning.</p><div className="mt-8 flex flex-wrap gap-x-7 gap-y-4">{[["10K+","Students",School],["50+","Courses",School],["4.8/5","Average Rating",Star]].map(([value,label,Icon])=><div key={label} className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-600"><Icon fontSize="small" /></span><span><b className="block text-sm font-black">{value}</b><small className="text-[11px] text-slate-500">{label}</small></span></div>)}</div></div>
        <div className="relative mx-auto w-full max-w-xl"><div className="absolute -inset-5 rounded-[2.5rem] bg-blue-100/50 blur-2xl" /><div className="relative rounded-3xl border border-white bg-white p-2 shadow-[0_25px_70px_rgba(15,23,42,.12)]"><img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=88" alt="Students learning together" className="aspect-[4/3] w-full rounded-[1.35rem] object-cover" /></div></div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-white">
      <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-blue-100/45 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-72 w-72 rounded-full bg-violet-100/45 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-3 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-2 flex items-center justify-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 sm:text-[11px]">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-blue-300 sm:w-16" />
            <span>Meet Our Team</span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-violet-300 sm:w-16" />
          </div>
          <h2 className="text-3xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.35rem]">
            The People Behind{" "}
            <span className="relative inline-block bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Your Success
              <span className="absolute -bottom-1 left-1/2 h-1 w-[86%] -translate-x-1/2 rounded-full bg-blue-600 sm:-bottom-2" />
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-xs leading-6 text-slate-500 sm:mt-5 sm:text-base sm:leading-7">
            A passionate team bringing education, technology and learner-first thinking together.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-10 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {TEAM.map(({ name, role, bio, image, icon: Icon, linkedin }, index) => {
            const a = [
              { border: "border-blue-200", wash: "from-blue-50 via-white to-indigo-50", blob: "bg-blue-200/65", tag: "bg-blue-600", text: "text-blue-700", line: "from-blue-500 to-indigo-500", note: "Build • Learn • Grow" },
              { border: "border-violet-200", wash: "from-violet-50 via-white to-fuchsia-50", blob: "bg-violet-200/65", tag: "bg-violet-600", text: "text-violet-700", line: "from-violet-500 to-fuchsia-500", note: "Learn • Create • Inspire" },
              { border: "border-emerald-200", wash: "from-emerald-50 via-white to-teal-50", blob: "bg-emerald-200/65", tag: "bg-emerald-700", text: "text-emerald-700", line: "from-emerald-500 to-teal-500", note: "Learn • Solve • Grow" },
              { border: "border-orange-200", wash: "from-orange-50 via-white to-amber-50", blob: "bg-orange-200/65", tag: "bg-orange-500", text: "text-orange-700", line: "from-orange-400 to-amber-500", note: "Create • Connect • Impact" },
            ][index % 4];

            return (
              <article key={name} className={`group relative overflow-hidden rounded-2xl border bg-white shadow-[0_8px_28px_rgba(15,23,42,.055)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(15,23,42,.1)] sm:rounded-[1.35rem] ${a.border}`}>
                <div className={`relative h-[118px] overflow-hidden bg-gradient-to-br ${a.wash} sm:h-[160px]`}>
                  <div className={`absolute left-[-14px] top-4 h-24 w-28 rounded-[48%_52%_58%_42%] rotate-[-8deg] ${a.blob} sm:left-2 sm:top-5 sm:h-36 sm:w-40`} />
                  <div className={`absolute left-5 top-9 h-16 w-20 rounded-[55%_45%_45%_55%] bg-white/60 rotate-[7deg] sm:left-10 sm:top-12 sm:h-24 sm:w-28`} />
                  <div className={`absolute right-2 top-2 max-w-[46%] text-right font-serif text-[7px] font-bold italic leading-tight sm:right-4 sm:top-4 sm:text-[10px] ${a.text}`}>
                    {a.note}
                    <span className={`mt-1 ml-auto block h-0.5 w-7 rotate-[-4deg] rounded-full bg-gradient-to-r ${a.line} sm:w-11`} />
                  </div>

                  <div className="absolute bottom-0 left-2 z-[1] h-[104px] w-[62%] overflow-hidden rounded-t-[42%] rounded-b-[22%] sm:left-4 sm:h-[142px] sm:w-[66%]">
                    <img
                      src={image}
                      alt={`${name} — ${role}`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.035]"
                    />
                  </div>

                  <span className={`absolute bottom-2 left-2 z-[2] inline-flex max-w-[90%] items-center gap-1 rounded-full px-2 py-1 text-[6px] font-black uppercase tracking-[0.045em] text-white shadow-md ${a.tag} sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1.5 sm:text-[8px]`}>
                    <Icon sx={{ fontSize: 10 }} /> {role}
                  </span>

                  <span className={`absolute bottom-0 right-2 h-8 w-8 rounded-full bg-gradient-to-br opacity-20 blur-lg ${a.line} sm:right-5 sm:h-12 sm:w-12`} />
                </div>

                <div className="relative px-2.5 pb-2.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3.5">
                  <div className={`absolute right-2.5 top-3 h-0.5 w-6 rounded-full bg-gradient-to-r ${a.line} sm:right-4 sm:top-4 sm:w-10`} />
                  <h3 className="pr-8 text-[12px] font-black leading-tight text-slate-950 sm:text-lg">{name}</h3>
                  <p className={`mt-0.5 text-[6.5px] font-black uppercase tracking-[0.12em] sm:text-[9px] ${a.text}`}>{role}</p>
                  <p className="mt-1.5 line-clamp-2 text-[7.5px] leading-4 text-slate-500 sm:mt-2 sm:text-[10px] sm:leading-5">{bio}</p>

                  <div className="mt-2 flex flex-wrap gap-1 sm:mt-3 sm:gap-1.5">
                    {(index === 0 ? ["Strategy", "Product"] : index === 1 ? ["Design", "Creativity"] : index === 2 ? ["Data", "Technology"] : ["Content", "Community"]).map((tag) => (
                      <span key={tag} className={`rounded-full bg-slate-50 px-1.5 py-0.5 text-[6px] font-bold ring-1 ring-slate-100 sm:px-2 sm:py-1 sm:text-[8px] ${a.text}`}>{tag}</span>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 sm:mt-3 sm:pt-3">
                    <div className="flex gap-1">
                      {linkedin ? (
                        <a href={linkedin} target="_blank" rel="noreferrer" aria-label={`${name} LinkedIn`} className="grid h-6 w-6 place-items-center rounded-full bg-slate-50 text-slate-500 transition hover:bg-blue-600 hover:text-white sm:h-7 sm:w-7">
                          <LinkedIn sx={{ fontSize: 12 }} />
                        </a>
                      ) : (
                        <>
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-50 text-[8px] font-black text-slate-400 sm:h-7 sm:w-7 sm:text-[9px]">in</span>
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-50 text-[8px] font-black text-slate-400 sm:h-7 sm:w-7 sm:text-[9px]">𝕏</span>
                        </>
                      )}
                    </div>
                    <span className={`grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br text-white shadow-sm transition group-hover:translate-x-0.5 sm:h-7 sm:w-7 ${a.line}`} aria-hidden="true">
                      <ArrowForward sx={{ fontSize: 12 }} />
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 text-center text-[9px] font-bold tracking-wide text-slate-400 sm:mt-8 sm:text-xs">
          <span>Different Skills</span><span className="mx-2 text-blue-400">•</span><span>Same Goal</span><span className="mx-2 text-violet-400">•</span><span>Your Growth</span>
        </div>
      </div>
    </section>

    <section className="border-y border-slate-100 bg-slate-50/70"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><School fontSize="small" />Why ApnaAcademy</span><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Learning that feels <span className="text-blue-600">useful.</span></h2><p className="mt-4 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">We combine structured education with practical execution so learners can turn concepts into confidence and projects.</p></div><div className="grid gap-4 sm:grid-cols-2">{VALUES.map(([title,text,Icon])=><div key={title} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon fontSize="small" /></span><h3 className="mt-4 text-sm font-black">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-500">{text}</p></div>)}</div></div></div></section>

    <section className="bg-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mx-auto max-w-2xl text-center"><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><Code fontSize="small" />How We Help You Grow</span><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">From learning to <span className="text-blue-600">real skills</span></h2><p className="mt-4 text-sm leading-7 text-slate-500">A simple journey designed to keep learners moving forward.</p></div><div className="mt-10 grid gap-4 md:grid-cols-4">{PROCESS.map(([number,title,text],index)=><div key={number} className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"><span className="text-3xl font-black text-blue-100">{number}</span><h3 className="mt-3 text-base font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>{index < PROCESS.length-1 && <span className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-300 md:flex">›</span>}</div>)}</div></div></section>

    <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="grid gap-8 sm:grid-cols-3"><div><p className="text-3xl font-black">10K+</p><p className="mt-1 text-xs font-semibold text-slate-400">Learners reached</p></div><div><p className="text-3xl font-black">50+</p><p className="mt-1 text-xs font-semibold text-slate-400">Practical courses</p></div><div><p className="text-3xl font-black">80%</p><p className="mt-1 text-xs font-semibold text-slate-400">Progress-focused completion target</p></div></div></div></section>

    <section className="border-y border-blue-100 bg-gradient-to-b from-blue-50/70 to-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"><div className="mb-9 max-w-2xl"><span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700"><Email fontSize="small" />Get In Touch</span><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Contact Us</h2><p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">Have questions, feedback, or need support? We&apos;re here to help! Send us a message and we&apos;ll get back to you as soon as possible.</p></div><div className="grid gap-7 lg:grid-cols-[1.12fr_.88fr]"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,.06)] sm:p-7"><form onSubmit={submit} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label><span className="mb-2 block text-xs font-extrabold text-slate-700">Full Name <em className="text-red-500">*</em></span><input required name="name" value={form.name} onChange={change} placeholder="Enter your name" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label><label><span className="mb-2 block text-xs font-extrabold text-slate-700">Email Address <em className="text-red-500">*</em></span><input required type="email" name="email" value={form.email} onChange={change} placeholder="Enter your email" className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label></div><label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-700">Subject <em className="text-red-500">*</em></span><select required name="subject" value={form.subject} onChange={change} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"><option value="">Select a subject</option>{SUBJECTS.map((s)=><option key={s}>{s}</option>)}</select></label><label className="block"><span className="mb-2 block text-xs font-extrabold text-slate-700">Message <em className="text-red-500">*</em></span><textarea required minLength={10} maxLength={5000} rows={5} name="message" value={form.message} onChange={change} placeholder="Your message here..." className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></label>{error&&<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}{notice&&<div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700">{notice}</div>}<button disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:opacity-60">{loading?"Sending...":"Send Message"}<Send fontSize="small" /></button></form></div><div className="space-y-5"><div className="relative overflow-hidden rounded-3xl border border-white bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,.08)]"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=88" alt="Modern learning workspace" loading="lazy" className="aspect-[5/3] w-full rounded-[1.35rem] object-cover" /><div className="absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="text-xs font-black">Let&apos;s Build Your Future Together</p><p className="mt-1 text-[11px] text-slate-500">We&apos;re here when you need us.</p></div></div><div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6"><div className="space-y-5"><a href="mailto:support@apnaacademy.in" className="flex items-start gap-3 no-underline"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"><Email fontSize="small" /></span><span><b className="block text-xs">Email Us</b><small className="text-xs text-slate-500">support@apnaacademy.in</small></span></a><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"><Phone fontSize="small" /></span><span><b className="block text-xs">Call Us</b><small className="text-xs text-slate-500">+91 98765 43210</small></span></div><div className="flex items-start gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-600"><LocationOn fontSize="small" /></span><span><b className="block text-xs">Location</b><small className="text-xs leading-5 text-slate-500">Noida, Uttar Pradesh, India</small></span></div></div></div></div></div></div></section>

    <section className="bg-white"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-7 sm:flex-row sm:items-center sm:p-9"><div><p className="text-lg font-black">Ready to start learning?</p><p className="mt-1 text-sm text-slate-500">Explore practical courses and build skills that move you forward.</p></div><Link to="/courses" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white no-underline hover:bg-blue-700">Explore Courses <ArrowForward fontSize="small" /></Link></div></div></section>
    <button type="button" onClick={() => window.scrollTo({top:0,behavior:"smooth"})} aria-label="Back to top" className="fixed bottom-5 right-5 z-20 grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-lg hover:text-blue-600"><ArrowUpward fontSize="small" /></button>
  </main>;
}
