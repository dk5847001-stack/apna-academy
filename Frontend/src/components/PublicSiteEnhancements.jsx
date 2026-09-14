import { useEffect } from "react";
import { API_BASE_URL } from "../constants/config";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/dilkhush_10star?stkn=MXVubXJtbHdtODA0aA==", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-none stroke-current" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>` },
  { label: "Facebook", href: "https://www.facebook.com/share/1EkezcKBs2/", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.2Z"/></svg>` },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dilkhush-kumar-43a426372", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M5.2 7.4A1.9 1.9 0 1 0 5.2 3.6a1.9 1.9 0 0 0 0 3.8ZM3.6 20.4h3.2V9H3.6v11.4ZM9 9v11.4h3.2v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4v6.2h3.2v-6.9c0-3.4-.7-6-4.5-6-1.8 0-3 .9-3.5 1.8h-.1V9H9Z"/></svg>` },
  { label: "GitHub", href: "/contact", icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.7 0-1 .4-1.8 1-2.5-.1-.3-.4-1.3.1-2.5 0 0 .8-.3 2.6 1a8.8 8.8 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.3 4.4-4.5 4.7.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.2 9.2 0 0 0 12 2.8Z"/></svg>` },
];

const FAQS = [
  { question: "What is ApnaAcademy?", answer: "ApnaAcademy is a practical learning platform where students can explore structured courses, build useful skills, track their learning progress and earn verified certificates after completing the required course criteria." },
  { question: "How do I enroll in a course?", answer: "Open the Courses section, choose the course you want to learn, review its details and continue with the available enrollment or purchase option." },
  { question: "Can I learn at my own pace?", answer: "Yes. Courses are organized into structured modules and lessons so you can continue learning from where you stopped and track your progress throughout the learning journey." },
  { question: "How does course progress work?", answer: "Your learning activity is tracked as you complete lessons. Course access and completion requirements are handled by the platform so your progress can be reflected accurately in the learning experience." },
  { question: "How can I get a certificate?", answer: "After completing the applicable course requirements, including the required learning progress and assessment criteria, the certificate becomes available through the certificate section." },
  { question: "What should I do if I have a payment, course or account issue?", answer: "Use the Contact page to send your issue to the ApnaAcademy support team. Include relevant details so the team can understand and respond to your request." },
];

const STUDENT_PATHS = [
  { label: "Web Development", detail: "Build modern frontend and full-stack projects with practical, structured learning." },
  { label: "Data & AI", detail: "Strengthen programming, data and AI foundations through guided learning paths." },
  { label: "Career Preparation", detail: "Practice job-ready skills, assessments and projects that support your career journey." },
];

const COMPANY_PATHS = [
  { name: "Google", tone: "Search · Cloud · Engineering" },
  { name: "Microsoft", tone: "Cloud · Software · AI" },
  { name: "Amazon", tone: "Cloud · Backend · Systems" },
  { name: "Adobe", tone: "Product · Design · Engineering" },
  { name: "TCS", tone: "IT Services · Technology" },
  { name: "Infosys", tone: "Digital · Consulting · IT" },
  { name: "Accenture", tone: "Technology · Consulting" },
  { name: "Deloitte", tone: "Technology · Analytics" },
];

const addBlog = () => {
  document.querySelectorAll("nav").forEach((nav) => {
    if (nav.querySelector('[data-apna-blog="true"]')) return;
    const coursesLink = [...nav.querySelectorAll("a")].find((a) => a.textContent?.trim() === "Courses");
    if (!coursesLink) return;
    const link = document.createElement("a");
    link.href = "/blog";
    link.dataset.apnaBlog = "true";
    link.textContent = "Blog";
    link.className = coursesLink.className;
    link.style.textDecoration = "none";
    coursesLink.after(link);
  });
};

const getFooterBrandContainer = (footer) => {
  const brandText = [...footer.querySelectorAll("div")].find((element) => {
    const text = element.textContent?.replace(/\s+/g, " ").trim() || "";
    return text.includes("ApnaAcademy") && text.length < 500;
  });
  if (brandText) return brandText;
  return footer.querySelector("section") || footer.firstElementChild || footer;
};

const addSocialAndNewsletter = () => {
  const footer = document.querySelector("footer");
  if (!footer) return;
  footer.querySelector('[data-apna-newsletter="true"]')?.remove();
  const brandContainer = getFooterBrandContainer(footer);
  if (!brandContainer) return;

  if (!brandContainer.querySelector('[data-apna-socials="true"]')) {
    const social = document.createElement("div");
    social.dataset.apnaSocials = "true";
    social.className = "mt-5 w-full";
    social.innerHTML = `<p class="mb-3 text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">Follow us</p><div class="flex items-center gap-2.5">${SOCIALS.map(({ label, href, icon }) => `<a href="${href}" ${label === "GitHub" ? "" : 'target="_blank" rel="noopener noreferrer"'} aria-label="${label}" title="${label}" class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md">${icon}</a>`).join("")}</div>`;
    brandContainer.append(social);
  }

  if (!brandContainer.querySelector('[data-apna-subscriber="true"]')) {
    const newsletter = document.createElement("div");
    newsletter.dataset.apnaSubscriber = "true";
    newsletter.className = "mt-5 w-full max-w-md";
    newsletter.innerHTML = `<p class="text-sm font-extrabold text-slate-900">Stay updated</p><p class="mt-1 text-xs leading-5 text-slate-500">Get new course announcements, learning resources and platform updates.</p><form class="mt-3 flex flex-col gap-2 sm:flex-row"><input required type="email" maxlength="254" autocomplete="email" placeholder="Enter your email address" aria-label="Email address" class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/><button type="submit" class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Subscribe</button></form><p data-status class="mt-2 min-h-5 text-xs font-bold"></p>`;
    brandContainer.append(newsletter);
    const form = newsletter.querySelector("form");
    const input = newsletter.querySelector("input");
    const status = newsletter.querySelector("[data-status]");
    const button = newsletter.querySelector("button");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = input.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "Please enter a valid email address.";
        status.className = "mt-2 min-h-5 text-xs font-bold text-red-600";
        return;
      }
      button.disabled = true;
      button.textContent = "Subscribing...";
      status.textContent = "";
      try {
        const response = await fetch(`${API_BASE_URL}/subscribers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data?.message || "Subscription failed.");
        status.textContent = data?.message || "Subscribed successfully.";
        status.className = "mt-2 min-h-5 text-xs font-bold text-emerald-600";
        input.value = "";
      } catch (error) {
        status.textContent = error?.message || "Unable to subscribe right now.";
        status.className = "mt-2 min-h-5 text-xs font-bold text-red-600";
      } finally {
        button.disabled = false;
        button.textContent = "Subscribe";
      }
    });
  }
};

const addHomeSuccessSections = () => {
  const existing = document.querySelector('[data-apna-success-sections="true"]');
  if (window.location.pathname !== "/") {
    existing?.remove();
    return;
  }
  if (existing) return;
  const main = document.querySelector("main");
  if (!main) return;

  const wrapper = document.createElement("div");
  wrapper.dataset.apnaSuccessSections = "true";
  wrapper.innerHTML = `
    <section class="border-t border-slate-200 bg-white py-16 sm:py-20">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
          <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.12em] text-blue-700">Student success</span>
          <h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Learn skills. Build projects. Grow with confidence.</h2>
          <p class="mt-4 text-sm leading-7 text-slate-500 sm:text-base">A focused learning journey for students who want practical skills, measurable progress and stronger career readiness.</p>
        </div>
        <div class="mt-10 grid gap-5 md:grid-cols-3">
          ${STUDENT_PATHS.map((item, index) => `<article class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-xl"><div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/20">0${index + 1}</div><h3 class="mt-6 text-lg font-black text-slate-950">${item.label}</h3><p class="mt-2 text-sm leading-6 text-slate-500">${item.detail}</p><div class="mt-6 h-1 w-12 rounded-full bg-blue-600 transition-all duration-300 group-hover:w-20"></div></article>`).join("")}
        </div>
        <div class="mt-10 flex flex-col items-center justify-between gap-4 rounded-3xl border border-blue-100 bg-blue-50/70 p-6 text-center sm:flex-row sm:text-left">
          <div><p class="text-sm font-black text-blue-950">Ready to start your learning journey?</p><p class="mt-1 text-sm text-blue-800/70">Explore courses and choose the path that matches your goals.</p></div>
          <a href="/courses" class="inline-flex shrink-0 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white no-underline shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Explore Courses</a>
        </div>
      </div>
    </section>
    <section class="border-t border-slate-200 bg-slate-950 py-16 sm:py-20">
      <div class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center">
          <span class="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.12em] text-blue-200">Industry aligned</span>
          <h2 class="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">Build skills for the companies you aspire to join.</h2>
          <p class="mt-4 text-sm leading-7 text-slate-400 sm:text-base">Prepare with concepts, projects and problem-solving practice relevant to modern technology careers.</p>
        </div>
        <div class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          ${COMPANY_PATHS.map((company) => `<div class="group flex min-h-28 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[.04] px-3 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/[.08]"><span class="text-lg font-black tracking-tight text-white sm:text-xl">${company.name}</span><span class="mt-2 text-[10px] font-bold leading-4 text-slate-500 transition-colors group-hover:text-slate-300">${company.tone}</span></div>`).join("")}
        </div>
        <div class="mx-auto mt-10 max-w-3xl text-center"><p class="text-xs leading-5 text-slate-500">Company names are shown for career-orientation and preparation context only. ApnaAcademy does not claim employment, partnership or placement affiliation with these companies unless explicitly stated elsewhere.</p></div>
      </div>
    </section>`;

  const faq = main.querySelector('[data-apna-faq="true"]');
  if (faq) faq.before(wrapper);
  else {
    const lastSection = [...main.children].reverse().find((child) => child.tagName === "SECTION");
    if (lastSection) lastSection.before(wrapper);
    else main.append(wrapper);
  }
};

const addFaq = () => {
  const existing = document.querySelector('[data-apna-faq="true"]');
  if (window.location.pathname !== "/") {
    existing?.remove();
    return;
  }
  if (existing) return;
  const main = document.querySelector("main");
  if (!main) return;

  const section = document.createElement("section");
  section.dataset.apnaFaq = "true";
  section.className = "border-t border-slate-200 bg-slate-50 py-16 sm:py-20";
  section.innerHTML = `<div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"><div class="mx-auto max-w-2xl text-center"><span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">Frequently Asked Questions</span><h2 class="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Everything you need to know.</h2><p class="mt-3 text-sm leading-6 text-slate-500 sm:text-base">Quick answers about courses, learning, progress, certificates and support on ApnaAcademy.</p></div><div class="mx-auto mt-10 max-w-4xl space-y-3">${FAQS.map((faq, index) => `<div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md" data-apna-faq-item><button type="button" aria-expanded="false" aria-controls="apna-faq-answer-${index}" class="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"><span class="text-sm font-extrabold leading-6 text-slate-900 sm:text-base">${faq.question}</span><span data-apna-faq-icon class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-xl font-medium text-slate-500 transition-transform duration-200">+</span></button><div id="apna-faq-answer-${index}" data-apna-faq-answer class="grid grid-rows-[0fr] transition-all duration-300"><div class="overflow-hidden"><p class="px-5 pb-5 text-sm leading-7 text-slate-600 sm:px-6">${faq.answer}</p></div></div></div>`).join("")}</div></div>`;

  const lastSection = [...main.children].reverse().find((child) => child.tagName === "SECTION");
  if (lastSection) lastSection.before(section);
  else main.append(section);

  const items = [...section.querySelectorAll("[data-apna-faq-item]")];
  items.forEach((item) => {
    const button = item.querySelector("button");
    const answer = item.querySelector("[data-apna-faq-answer]");
    const icon = item.querySelector("[data-apna-faq-icon]");
    button.addEventListener("click", () => {
      const wasOpen = button.getAttribute("aria-expanded") === "true";
      items.forEach((otherItem) => {
        const otherButton = otherItem.querySelector("button");
        const otherAnswer = otherItem.querySelector("[data-apna-faq-answer]");
        const otherIcon = otherItem.querySelector("[data-apna-faq-icon]");
        otherButton.setAttribute("aria-expanded", "false");
        otherAnswer.classList.remove("grid-rows-[1fr]");
        otherAnswer.classList.add("grid-rows-[0fr]");
        otherIcon.textContent = "+";
        otherIcon.classList.remove("rotate-45", "bg-blue-50", "text-blue-700");
        otherIcon.classList.add("bg-slate-50", "text-slate-500");
      });
      if (!wasOpen) {
        button.setAttribute("aria-expanded", "true");
        answer.classList.remove("grid-rows-[0fr]");
        answer.classList.add("grid-rows-[1fr]");
        icon.classList.remove("bg-slate-50", "text-slate-500");
        icon.classList.add("rotate-45", "bg-blue-50", "text-blue-700");
      }
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
    const enhance = () => {
      addBlog();
      addSocialAndNewsletter();
      addLegal();
      addHomeSuccessSections();
      addFaq();
    };
    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("popstate", enhance);
    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", enhance);
    };
  }, []);
  return null;
}
