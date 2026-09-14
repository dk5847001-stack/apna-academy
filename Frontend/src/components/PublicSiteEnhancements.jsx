import { useEffect } from "react";
import { API_BASE_URL } from "../constants/config";

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/dilkhush_10star?stkn=MXVubXJtbHdtODA0aA==",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-none stroke-current" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>`,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/share/1EkezcKBs2/",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.2Z"/></svg>`,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/dilkhush-kumar-43a426372",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M5.2 7.4A1.9 1.9 0 1 0 5.2 3.6a1.9 1.9 0 0 0 0 3.8ZM3.6 20.4h3.2V9H3.6v11.4ZM9 9v11.4h3.2v-6.3c0-1.7.3-3.3 2.4-3.3 2 0 2 1.9 2 3.4v6.2h3.2v-6.9c0-3.4-.7-6-4.5-6-1.8 0-3 .9-3.5 1.8h-.1V9H9Z"/></svg>`,
  },
  {
    label: "GitHub",
    href: "/contact",
    icon: `<svg viewBox="0 0 24 24" aria-hidden="true" class="h-5 w-5 fill-current"><path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.4-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.7 0-1 .4-1.8 1-2.5-.1-.3-.4-1.3.1-2.5 0 0 .8-.3 2.6 1a8.8 8.8 0 0 1 4.7 0c1.8-1.3 2.6-1 2.6-1 .5 1.2.2 2.2.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.3 4.4-4.5 4.7.4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.2 9.2 0 0 0 12 2.8Z"/></svg>`,
  },
];

const addBlog = () => {
  document.querySelectorAll("nav").forEach((nav) => {
    if (nav.querySelector('[data-apna-blog="true"]')) return;

    const coursesLink = [...nav.querySelectorAll("a")].find(
      (a) => a.textContent?.trim() === "Courses"
    );

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
    social.innerHTML = `
      <p class="mb-3 text-xs font-extrabold uppercase tracking-[.14em] text-slate-500">Follow us</p>
      <div class="flex items-center gap-2.5">
        ${SOCIALS.map(
          ({ label, href, icon }) => `
            <a
              href="${href}"
              ${label === "GitHub" ? "" : 'target="_blank" rel="noopener noreferrer"'}
              aria-label="${label}"
              title="${label}"
              class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md"
            >${icon}</a>
          `
        ).join("")}
      </div>
    `;

    brandContainer.append(social);
  }

  if (!brandContainer.querySelector('[data-apna-subscriber="true"]')) {
    const newsletter = document.createElement("div");
    newsletter.dataset.apnaSubscriber = "true";
    newsletter.className = "mt-5 w-full max-w-md";
    newsletter.innerHTML = `
      <p class="text-sm font-extrabold text-slate-900">Stay updated</p>
      <p class="mt-1 text-xs leading-5 text-slate-500">Get new course announcements, learning resources and platform updates.</p>
      <form class="mt-3 flex flex-col gap-2 sm:flex-row">
        <input required type="email" maxlength="254" autocomplete="email" placeholder="Enter your email address" aria-label="Email address" class="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
        <button type="submit" class="rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Subscribe</button>
      </form>
      <p data-status class="mt-2 min-h-5 text-xs font-bold"></p>
    `;

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
        const response = await fetch(`${API_BASE_URL}/subscribers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.message || "Subscription failed.");
        }

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

const addLegal = () => {
  const footer = document.querySelector("footer");
  if (!footer || footer.querySelector('[data-apna-legal="true"]')) return;

  const legal = document.createElement("div");
  legal.dataset.apnaLegal = "true";
  legal.className = "mx-auto flex max-w-7xl flex-wrap items-center gap-1 border-t border-slate-200 px-4 py-4 sm:px-6 lg:px-8";
  legal.innerHTML = `
    <span class="mr-2 text-xs font-bold text-slate-400">Legal</span>
    <a href="/privacy-policy" class="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 no-underline hover:bg-slate-100">Privacy Policy</a>
    <a href="/refund-policy" class="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 no-underline hover:bg-slate-100">Refund Policy</a>
  `;

  footer.append(legal);
};

export default function PublicSiteEnhancements() {
  useEffect(() => {
    addBlog();
    addSocialAndNewsletter();
    addLegal();

    const observer = new MutationObserver(() => {
      addBlog();
      addSocialAndNewsletter();
      addLegal();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
