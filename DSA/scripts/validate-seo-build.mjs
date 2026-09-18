import fs from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
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

if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
  throw new Error("VITE_DSA_URL must be an absolute URL.");
}
if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error("dist/index.html is missing. Run the Vite build first.");
}

const read = (file) => fs.readFileSync(file, "utf8");
const html = read(path.join(dist, "index.html"));
const required = [
  [html.includes(siteUrl), "production URL"],
  [siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1") || !/(localhost|127\\.0\\.0\\.1)/i.test(html), "site URL consistency"],
  [html.includes("application/ld+json"), "JSON-LD"],
  [html.includes('rel="canonical"'), "canonical"],
  [html.includes('name="robots"'), "robots metadata"],
];

for (const [ok, label] of required) {
  if (!ok) throw new Error("SEO validation failed: " + label);
}

const robotsPath = path.join(dist, "robots.txt");
const sitemapPath = path.join(dist, "sitemap.xml");
if (!fs.existsSync(robotsPath) || !fs.existsSync(sitemapPath)) {
  throw new Error("robots.txt or sitemap.xml is missing from dist.");
}

const robots = read(robotsPath);
const sitemap = read(sitemapPath);
if (!robots.includes("Sitemap: " + siteUrl + "/sitemap.xml")) {
  throw new Error("robots.txt does not point to the production sitemap.");
}
if (!sitemap.includes("<urlset")) throw new Error("Invalid sitemap.xml.");
if (!siteUrl.includes("localhost") && !siteUrl.includes("127.0.0.1") && /(localhost|127\\.0\\.0\\.1)/i.test(sitemap)) {
  throw new Error("Sitemap contains a localhost URL.");
}

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!locs.length) throw new Error("Sitemap contains no URLs.");
if (new Set(locs).size !== locs.length) throw new Error("Sitemap contains duplicate URLs.");
if (locs.length > 50000) throw new Error("Sitemap exceeds the single-file 50,000 URL limit.");

const allowedPrefixes = [
  siteUrl + "/",
  siteUrl + "/practice/",
  siteUrl + "/study-plans/",
  siteUrl + "/companies/",
];
for (const url of locs) {
  if (!allowedPrefixes.some((prefix) => url === siteUrl + "/" || url.startsWith(prefix))) {
    throw new Error("Unexpected URL in sitemap: " + url);
  }
  if (/[?&]/.test(url)) throw new Error("Query URL found in sitemap: " + url);
}

const privateRoutes = ["/progress", "/submissions", "/bookmarks", "/profile", "/settings", "/practice/code", "/unlock"];
for (const url of locs) {
  const pathname = new URL(url).pathname.replace(/\/$/, "") || "/";
  const file = pathname === "/" ? path.join(dist, "index.html") : path.join(dist, pathname.slice(1), "index.html");
  if (!fs.existsSync(file)) {
    throw new Error("Missing static SEO page for sitemap URL: " + url);
  }
  const routeHtml = read(file);
  if (!routeHtml.includes("rel=\"canonical\"")) throw new Error("Missing canonical on: " + url);
  if (!routeHtml.includes(url)) throw new Error("Canonical/SEO URL mismatch on: " + url);
}

for (const route of privateRoutes) {
  if (locs.includes(siteUrl + route)) {
    throw new Error("Private route found in sitemap: " + route);
  }
}

console.log(`DSA SEO validation passed: ${locs.length} sitemap URLs.`);
