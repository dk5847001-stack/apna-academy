import { useEffect } from "react";
import { API_BASE_URL } from "../constants/config";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/dilkhush_10star?stkn=MXVubXJtbHdtODA0aA==", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-none stroke-current" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>` },
  { label: "Facebook", href: "https://www.facebook.com/share/1EkezcKBs2/", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.2Z"/></svg>` },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dilkhush-kumar-43a426372", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M5.2 7.4A1.9 1.9 0 1 0 5.2 3.6a1.9 1.9 0 0 0 0 3.8ZM3.6 20.4h3.2V9H3.6v11.4ZM9 9v11.4h3.2v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4v6.2h3.2v-6.9c0-3.4-.7-6-4.5-6-1.8 0-3 .9-3.5 1.8h-.1V9H9Z"/></svg>` },
  { label: "GitHub", href: "/contact", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-3.4-1.1-3.4-4.7 0-1 .4-1.8 1-2.5-.1-.3-.4-1.3.1-2.5 0 0 .8-.3 2.6 1a8.8 8.8 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.3 4.4-4.5 4.7.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.2 9.2 0 0 0 12 2.8Z"/></svg>` },
];

const FAQS = [
  ["What is ApnaAcademy?", "ApnaAcademy is a practical learning platform where students can explore structured courses, build useful skills, track their learning progress and earn verified certificates after completing the required course criteria."],
  ["How do I enroll in a course?", "Open the Courses section, choose the course you want to learn, review its details and continue with the available enrollment or purchase option."],
  ["Can I learn at my own pace?", "Yes. Courses are organized into structured modules and lessons so you can continue learning from where you stopped and track your progress throughout the learning journey."],
  ["How does course progress work?", "Your learning activity is tracked as you complete lessons. Course access and completion requirements are handled by the platform so your progress can be reflected accurately in the learning experience."],
  ["How can I get a certificate?", "After completing the applicable course requirements, including the required learning progress and assessment criteria, the certificate becomes available through the certificate section."],
  ["What should I do if I have a payment, course or account issue?", "Use the Contact page to send your issue to the ApnaAcademy support team. Include relevant details so the team can understand and respond to your request."],
];

const COMPANY_PATHS = [
  ["Google", "Search · Cloud · Engineering", "https://cdn.simpleicons.org/google"],
  ["Microsoft", "Cloud · Software · AI", "https://cdn.simpleicons.org/microsoft"],
  ["Amazon", "Cloud · Backend · Systems", "https://cdn.simpleicons.org/amazon"],
  ["Adobe", "Product · Design · Engineering", "https://cdn.simpleicons.org/adobe"],
  ["TCS", "IT Services · Technology", "https://cdn.simpleicons.org/tcs"],
  ["Infosys", "Digital · Consulting · IT", "https://cdn.simpleicons.org/infosys"],
  ["Accenture", "Technology · Consulting", "https://cdn.simpleicons.org/accenture"],
  ["Deloitte", "Technology · Analytics", "https://cdn.simpleicons.org/deloitte"],
];

const STUDENTS = [
  ["Aarav Sharma", "Software Engineer", "Google", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80", "https://cdn.simpleicons.org/google"],
  ["Ananya Verma", "Software Engineer", "Microsoft", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80", "https://cdn.simpleicons.org/microsoft"],
  ["Rohan Mehta", "SDE", "Amazon", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80", "https://cdn.simpleicons.org/amazon"],
  ["Priya Nair", "Frontend Engineer", "Adobe", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80", "https://cdn.simpleicons.org/adobe"],
  ["Vivek Kumar", "Software Engineer", "TCS", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80", "https://cdn.simpleicons.org/tcs"],
  ["Neha Singh", "Technology Analyst", "Accenture", "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80", "https://cdn.simpleicons.org/accenture"],
];

const addBlog = () => document.querySelectorAll("nav").forEach((nav) => {
  if (nav.querySelector('[data-apna-blog="true"]')) return;
  const courses = [...nav.querySelectorAll("a")].find((a) => a.textContent?.trim() === "Courses");
  if (!courses) return;
  const link = document.createElement("a");
  link.href = "/blog";
  link.dataset.apnaBlog = "true";
  link.textContent = "Blog";
  link.className = courses.className;
  link.style.textDecoration = "none";
  courses.after(link);
});

const footerBrand = (footer) => [...footer.querySelectorAll("div")].find((el) => (el.textContent || "").replace(/\s+/g, " ").trim().includes("ApnaAcademy") && (el.textContent || "").length < 500) || footer.firstElementChild || footer;

const addSocialAndNewsletter = () => {
  const footer = document.querySelector("footer");
  if (!footer) return;
  const brand = footerBrand(footer);
  if (!brand) return;
  if (!brand.querySelector('[data-apna-socials="true"]')) {
    const social = document.createElement("div");
    social.dataset.apnaSocials = "true";
    social.className = "mt-5 w-full";
    social.innerHTML = `<p class="mb-3 text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">Follow us</p><div class="flex gap-2.5">${SOCIALS.map((s) => `<a href="${s.href}" ${s.label === "GitHub" ? "" : 'target="_blank" rel="noopener noreferrer"'} aria-label="${s.label}" class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">${s.icon}</a>`).join("")}</div>`;
    brand.append(social);
  }
  if (brand.querySelector('[data-apna-subscriber="true"]')) return;
  const box = document.createElement("div");
  box.dataset.apnaSubscriber = "true";
  box.className = "mt-5 w-full max-w-md";
  box.innerHTML = `<p class="text-sm font-extrabold text-slate-900">Stay updated</p><p class="mt-1 text-xs text-slate-500">Get course announcements and platform updates.</p><form class="mt-3 flex flex-col gap-2 sm:flex-row"><input required type="email" maxlength="254" placeholder="Enter your email address" class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/><button class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white">Subscribe</button></form><p data-status class="mt-2 min-h-5 text-xs font-bold"></p>`;
  brand.append(box);
  const form = box.querySelector("form"), input = box.querySelector("input"), status = box.querySelector("[data-status]"), button = box.querySelector("button");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = input.value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { status.textContent = "Please enter a valid email address."; status.className = "mt-2 min-h-5 text-xs font-bold text-red-600"; return; }
    button.disabled = true; button.textContent = "Subscribing...";
    try {
      const res = await fetch(`${API_BASE_URL}/subscribers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Subscription failed.");
      status.textContent = data?.message || "Subscribed successfully."; status.className = "mt-2 min-h-5 text-xs font-bold text-emerald-600"; input.value = "";
    } catch (err) { status.textContent = err?.message || "Unable to subscribe right now."; status.className = "mt-2 min-h-5 text-xs font-bold text-red-600"; }
    finally { button.disabled = false; button.textContent = "Subscribe"; }
  });
};

const addHomeSuccessSections = () => {
  const old = document.querySelector('[data-apna-success-sections="true"]');
  if (window.location.pathname !== "/") { old?.remove(); return; }
  if (old) return;
  const main = document.querySelector("main");
  if (!main) return;
  const wrapper = document.createElement("div");
  wrapper.dataset.apnaSuccessSections = "true";
  wrapper.innerHTML = `
    <section class="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center"><span class="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.12em] text-blue-700">Student success</span><h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Students who turn learning into career momentum.</h2><p class="mt-4 text-sm leading-7 text-slate-500 sm:text-base">Professional success-story cards inspired by the outcome-focused presentation used by leading learning platforms.</p></div>
        <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">${STUDENTS.map(([name, role, company, photo, logo]) => `<article class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"><div class="relative h-64 overflow-hidden bg-slate-100"><img src="${photo}" alt="Student success profile" loading="lazy" class="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><div class="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-lg backdrop-blur"><div><p class="text-[10px] font-extrabold uppercase tracking-[.12em] text-slate-400">Career destination</p><p class="mt-0.5 text-sm font-black text-slate-900">${company}</p></div><img src="${logo}" alt="${company} logo" class="h-8 w-8 object-contain" loading="lazy"/></div></div><div class="p-6"><h3 class="text-lg font-black text-slate-950">${name}</h3><p class="mt-1 text-sm font-semibold text-blue-700">${role}</p><div class="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span class="text-xs font-bold text-slate-500">Skills → Projects → Career</span><span class="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-700">Success story</span></div></div></article>`).join("")}</div>
        <p class="mx-auto mt-7 max-w-3xl text-center text-[11px] leading-5 text-slate-400">The photographs and names in these cards are illustrative UI content. Replace them with verified ApnaAcademy student outcomes and approved photographs before publishing placement claims.</p>
      </div>
    </section>
    <section class="border-t border-slate-200 bg-white py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center"><span class="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.12em] text-slate-700">Companies students aspire to join</span><h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Industry names. Career-ready skills.</h2><p class="mt-4 text-sm leading-7 text-slate-500 sm:text-base">Explore the kinds of companies and technology environments that inspire modern career preparation.</p></div>
        <div class="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">${COMPANY_PATHS.map(([name, tone, logo]) => `<div class="group flex min-h-32 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 py-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><div class="flex h-12 w-12 items-center justify-center rounded-xl bg-white"><img src="${logo}" alt="${name} logo" loading="lazy" class="max-h-9 max-w-10 object-contain"/></div><p class="mt-3 text-sm font-black text-slate-900">${name}</p><p class="mt-1 text-[10px] font-bold leading-4 text-slate-400">${tone}</p></div>`).join("")}</div>
        <p class="mx-auto mt-7 max-w-3xl text-center text-[11px] leading-5 text-slate-400">Company names and logos are displayed for career-orientation context only. They do not indicate a partnership, sponsorship, endorsement or placement affiliation unless separately verified and stated.</p>
      </div>
    </section>`;
  const faq = main.querySelector('[data-apna-faq="true"]');
  if (faq) faq.before(wrapper); else main.append(wrapper);
};

const addFaq = () => {
  const old = document.querySelector('[data-apna-faq="true"]');
  if (window.location.pathname !== "/") { old?.remove(); return; }
  if (old) return;
  const main = document.querySelector("main");
  if (!main) return;
  const section = document.createElement("section");
  section.dataset.apnaFaq = "true";
  section.className = "border-t border-slate-200 bg-slate-50 py-16 sm:py-20";
  section.innerHTML = `<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><div class="mx-auto max-w-2xl text-center"><span class="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">Frequently Asked Questions</span><h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Everything you need to know.</h2><p class="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Quick answers about courses, learning, progress, certificates and support on ApnaAcademy.</p></div><div class="mx-auto mt-10 max-w-4xl space-y-3">${FAQS.map(([q, a]) => `<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" data-faq-item><button type="button" aria-expanded="false" class="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"><span class="text-sm font-extrabold leading-6 text-slate-900 sm:text-base">${q}</span><span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl text-slate-500 transition-transform" data-faq-icon>+</span></button><div class="grid grid-rows-[0fr] transition-all duration-300" data-faq-answer><div class="overflow-hidden"><p class="px-5 pb-5 text-sm leading-7 text-slate-600 sm:px-6">${a}</p></div></div></div>`).join("")}</div></div>`;
  main.append(section);
  [...section.querySelectorAll("[data-faq-item]")].forEach((item) => {
    const button = item.querySelector("button"), answer = item.querySelector("[data-faq-answer]"), icon = item.querySelector("[data-faq-icon]");
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") === "true";
      section.querySelectorAll("[data-faq-item]").forEach((other) => { other.querySelector("button").setAttribute("aria-expanded", "false"); other.querySelector("[data-faq-answer]").classList.remove("grid-rows-[1fr]"); other.querySelector("[data-faq-answer]").classList.add("grid-rows-[0fr]"); other.querySelector("[data-faq-icon]").textContent = "+"; other.querySelector("[data-faq-icon]").classList.remove("rotate-45", "bg-blue-50", "text-blue-700"); });
      if (!open) { button.setAttribute("aria-expanded", "true"); answer.classList.remove("grid-rows-[0fr]"); answer.classList.add("grid-rows-[1fr]"); icon.classList.add("rotate-45", "bg-blue-50", "text-blue-700"); }
    });
  });
};

const addLegal = () => {
  const footer = document.querySelector("footer");
  if (!footer || footer.querySelector('[data-apna-legal="true"]')) return;
  const legal = document.createElement("div");
  legal.dataset.apnaLegal = "true";
  legal.className = "mx-auto flex max-w-7xl flex-wrap items-center gap-1 border-t border-slate-200 px-4 py-4 sm:px-6 lg:px-8";
  legal.innerHTML = `<span class="mr-2 text-xs font-bold text-slate-400">Legal</span><a href="/privacy-policy" class="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 no-underline hover:bg-slate-100">Privacy Policy</a><a href="/refund-policy" class="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 no-underline hover:bg-slate-100">Refund Policy</a>`;
  footer.append(legal);
};

export default function PublicSiteEnhancements() {
  useEffect(() => {
    const enhance = () => { addBlog(); addSocialAndNewsletter(); addLegal(); addHomeSuccessSections(); addFaq(); };
    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", enhance);
    return () => { observer.disconnect(); window.removeEventListener("popstate", enhance); };
  }, []);
  return null;
}
