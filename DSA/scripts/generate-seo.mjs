import fs from "node:fs";
import path from "node:path";

// Vite loads .env files automatically, but this Node script does not.
// Read local Vite-style variables so SEO generation works consistently.
const readDotEnv = () => {
  const files = [".env", ".env.local"];
  const values = {};

  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    if (!fs.existsSync(filePath)) continue;

    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match || match[1] in values) continue;
      values[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }

  return values;
};

const dotEnv = readDotEnv();
const siteUrl = (process.env.VITE_DSA_URL || dotEnv.VITE_DSA_URL || "https://dsa.apnaacademy.me").replace(/\/$/, "");
const apiBaseUrl = (process.env.VITE_API_BASE_URL || dotEnv.VITE_API_BASE_URL || "https://api.apnaacademy.me/api/v1").replace(/\/$/, "");

if (!/^https?:\/\//i.test(siteUrl)) {
  throw new Error("VITE_DSA_URL must be an absolute URL.");
}
if (!/^https?:\/\//i.test(apiBaseUrl)) {
  throw new Error("VITE_API_BASE_URL must be an absolute API URL.");
}


const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });

const seoIndexUrl = apiBaseUrl + "/dsa/seo-index";
const response = await fetch(seoIndexUrl, { headers: { Accept: "application/json" } });
if (!response.ok) {
  throw new Error(`Unable to fetch DSA SEO index (${response.status}) from ${seoIndexUrl}`);
}

const payload = await response.json();
const index = payload?.data;
if (!index || !Array.isArray(index.problems) || !Array.isArray(index.studyPlans) || !Array.isArray(index.companies)) {
  throw new Error("DSA SEO index response is invalid.");
}

const clean = (value, fallback = "") =>
  String(value ?? fallback).replace(/\s+/g, " ").trim();

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toDate = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date.toISOString() : null;
};

const urls = [
  { path: "/", priority: "1.0" },
  { path: "/practice", priority: "0.9" },
  { path: "/topics", priority: "0.7" },
  { path: "/companies", priority: "0.7" },
  { path: "/daily-challenge", priority: "0.8" },
  { path: "/study-plans", priority: "0.9" },
  ...index.problems.map((item) => ({
    path: "/practice/" + encodeURIComponent(clean(item.slug)),
    priority: item.isPremium ? "0.6" : "0.8",
    lastmod: toDate(item.updatedAt),
  })),
  ...index.studyPlans.map((item) => ({
    path: "/study-plans/" + encodeURIComponent(clean(item.slug)),
    priority: "0.8",
    lastmod: toDate(item.updatedAt),
  })),
  ...index.companies.map((item) => ({
    path: "/companies/" + encodeURIComponent(
      clean(item.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    ),
    priority: "0.7",
  })),
];

const seen = new Set();
const sitemapEntries = [];

for (const item of urls) {
  if (!item.path || seen.has(item.path)) continue;
  seen.add(item.path);

  const lastmod = item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : "";
  sitemapEntries.push(
    `  <url><loc>${escapeXml(siteUrl + item.path)}</loc>${lastmod}<changefreq>weekly</changefreq><priority>${item.priority}</priority></url>`,
  );
}

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...sitemapEntries,
  "</urlset>",
  "",
].join("\n");

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);

const robots = [
  "# ApnaAcademy DSA crawler rules",
  "# Public pages are crawlable. Authenticated/private routes use route-level",
  "# noindex metadata so search engines can see the directive.",
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${siteUrl}/sitemap.xml`,
  "",
].join("\n");

fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

console.log(`Generated DSA SEO assets: ${seen.size} URLs (${index.problems.length} problems, ${index.studyPlans.length} study plans).`);
