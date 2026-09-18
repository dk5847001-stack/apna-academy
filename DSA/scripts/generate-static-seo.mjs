import fs from "node:fs";
import path from "node:path";

const readDotEnv = (file) => {
  try {
    const text = fs.readFileSync(path.join(process.cwd(), file), "utf8");
    return Object.fromEntries(
      text.split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
        })
    );
  } catch {
    return {};
  }
};

const env = { ...readDotEnv(".env"), ...readDotEnv(".env.local"), ...process.env };
const siteUrl = (env.VITE_DSA_URL || "http://localhost:5173").replace(/\/$/, "");
const apiBaseUrl = (env.VITE_API_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");

if (!/^https?:\/\//i.test(siteUrl)) throw new Error("VITE_DSA_URL must be an absolute URL.");
if (!/^https?:\/\//i.test(apiBaseUrl)) throw new Error("VITE_API_BASE_URL must be an absolute URL.");

const dist = path.join(process.cwd(), "dist");
const templatePath = path.join(dist, "index.html");
if (!fs.existsSync(templatePath)) throw new Error("dist/index.html is missing.");

const response = await fetch(apiBaseUrl + "/dsa/seo-index", { headers: { Accept: "application/json" } });
if (!response.ok) throw new Error(`Unable to fetch DSA SEO index (${response.status}).`);
const payload = await response.json();
const index = payload?.data;
if (!index || !Array.isArray(index.problems) || !Array.isArray(index.studyPlans)) {
  throw new Error("Invalid DSA SEO index response.");
}

const clean = (value, fallback = "") => String(value ?? fallback).replace(/\s+/g, " ").trim();
const clamp = (value, max, fallback) => {
  const text = clean(value, fallback);
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
};
const escapeHtml = (value) => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const escapeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");
const canonical = (route) => siteUrl + route;
const slugRoute = (base, slug) => base + encodeURIComponent(clean(slug));

const replaceOrAdd = (html, regex, tag) => regex.test(html) ? html.replace(regex, tag) : html.replace("</head>", tag + "\n</head>");
const setMeta = (html, attr, key, content) => {
  const safe = escapeHtml(content);
  const regex = new RegExp(`<meta\\s+[^>]*${attr}=["']${key.replace(/[.*+?^\${}()|[\\]\\]/g, "\\\\$&")}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${safe}">`;
  return replaceOrAdd(html, regex, tag);
};
const setCanonical = (html, url) => replaceOrAdd(html, /<link\s+[^>]*rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${escapeHtml(url)}">`);
const setJsonLd = (html, graph) => replaceOrAdd(
  html,
  /<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i,
  `<script type="application/ld+json">${escapeJson({ "@context": "https://schema.org", "@graph": graph })}</script>`,
);

const breadcrumb = (route, title) => {
  const parts = route.split("/").filter(Boolean);
  const itemList = [{ "@type": "ListItem", position: 1, name: "DSA", item: canonical("/") }];
  let current = "";
  parts.forEach((part, index) => {
    current += "/" + part;
    itemList.push({ "@type": "ListItem", position: index + 2, name: part.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()), item: canonical(current) });
  });
  if (parts.length) itemList[itemList.length - 1].name = title;
  return { "@type": "BreadcrumbList", itemListElement: itemList };
};

const render = ({ route, title, description, type, extra }) => {
  let html = fs.readFileSync(templatePath, "utf8");
  html = html.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "name", "robots", "index, follow, max-image-preview:large");
  html = setMeta(html, "name", "googlebot", "index, follow, max-image-preview:large");
  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", canonical(route));
  html = setMeta(html, "property", "og:type", type === "CollectionPage" ? "website" : "article");
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);
  html = setCanonical(html, canonical(route));

  const graph = [
    { "@type": "WebSite", name: "ApnaAcademy", url: canonical("/") },
    { "@type": type, name: title, description, url: canonical(route) },
    breadcrumb(route, title),
    ...(extra || []),
  ];
  return setJsonLd(html, graph);
};

const routes = [
  { route: "/", title: "ApnaAcademy DSA – Data Structures & Algorithms", description: "Practice Data Structures and Algorithms with interview problems, topics, company patterns, daily challenges and structured study plans.", type: "WebPage" },
  { route: "/practice", title: "DSA Practice – Coding Problems | ApnaAcademy", description: "Practice published Data Structures and Algorithms problems with difficulty, topics, companies and coding patterns.", type: "CollectionPage" },
  { route: "/topics", title: "DSA Topics – Data Structures & Algorithms | ApnaAcademy", description: "Explore published DSA topics and practice problems organized by core data structures and algorithm concepts.", type: "CollectionPage" },
  { route: "/companies", title: "Company DSA Problems | ApnaAcademy", description: "Explore published DSA problems organized by company and interview preparation patterns.", type: "CollectionPage" },
  { route: "/daily-challenge", title: "Daily DSA Challenge | ApnaAcademy", description: "Build a consistent DSA practice habit with the ApnaAcademy daily coding challenge.", type: "WebPage" },
  { route: "/study-plans", title: "DSA Study Plans | ApnaAcademy", description: "Follow structured DSA study plans with focused practice schedules and curated coding problems.", type: "CollectionPage" },
];

const writeRoute = (route, html) => {
  const dir = route === "/" ? dist : path.join(dist, route.slice(1));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
};

for (const item of routes) {
  writeRoute(item.route, render(item));
}

for (const problem of index.problems) {
  const route = slugRoute("/practice/", problem.slug);
  const title = clamp(clean(problem.title) + (problem.difficulty ? " – " + clean(problem.difficulty) : ""), 65, "DSA Problem | ApnaAcademy");
  const description = clamp(problem.description, 160, "Practice this published Data Structures and Algorithms problem on ApnaAcademy.");
  const extra = [{
    "@type": "LearningResource",
    name: clean(problem.title),
    description,
    learningResourceType: "Coding Problem",
    educationalLevel: clean(problem.difficulty),
    url: canonical(route),
    isPartOf: { "@type": "WebSite", name: "ApnaAcademy", url: canonical("/") },
  }];
  writeRoute(route, render({ route, title, description, type: "WebPage", extra }));
}

for (const plan of index.studyPlans) {
  const route = slugRoute("/study-plans/", plan.slug);
  const title = clamp(clean(plan.title) + (plan.durationDays ? " – " + plan.durationDays + " Day Plan" : ""), 65, "DSA Study Plan | ApnaAcademy");
  const description = clamp(plan.description, 160, "Follow this structured DSA study plan on ApnaAcademy.");
  const extra = [{
    "@type": "LearningResource",
    name: clean(plan.title),
    description,
    learningResourceType: "Study Plan",
    educationalLevel: clean(plan.level),
    timeRequired: plan.durationDays ? "P" + Number(plan.durationDays) + "D" : undefined,
    url: canonical(route),
  }];
  writeRoute(route, render({ route, title, description, type: "WebPage", extra }));
}

console.log(`Generated static DSA SEO pages: ${routes.length + index.problems.length + index.studyPlans.length}.`);
