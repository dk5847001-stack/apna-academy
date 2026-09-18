import fs from "node:fs";
import path from "node:path";

const dist = path.join(process.cwd(), "dist");
const siteUrl = (process.env.VITE_DSA_URL || "").replace(/\/$/, "");

if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
  throw new Error("VITE_DSA_URL must be set to an absolute production URL.");
}
if (!fs.existsSync(path.join(dist, "index.html"))) {
  throw new Error("dist/index.html is missing. Run the Vite build first.");
}

const read = (file) => fs.readFileSync(file, "utf8");
const html = read(path.join(dist, "index.html"));
const required = [
  [html.includes(siteUrl), "production URL"],
  [!/(localhost|127\\.0\\.0\\.1)/i.test(html), "localhost URL absence"],
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
if (/(localhost|127\\.0\\.0\\.1)/i.test(sitemap)) {
  throw new Error("Sitemap contains a localhost URL.");
}

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!locs.length) throw new Error("Sitemap contains no URLs.");
if (new Set(locs).size !== locs.length) throw new Error("Sitemap contains duplicate URLs.");

const allowedPrefixes = [
  siteUrl + "/",
  siteUrl + "/practice/",
  siteUrl + "/study-plans/",
];
for (const url of locs) {
  if (!allowedPrefixes.some((prefix) => url === siteUrl + "/" || url.startsWith(prefix))) {
    throw new Error("Unexpected URL in sitemap: " + url);
  }
  if (/[?&]/.test(url)) throw new Error("Query URL found in sitemap: " + url);
}

const privateRoutes = ["/progress", "/submissions", "/bookmarks", "/profile", "/settings", "/practice/code", "/unlock"];
for (const route of privateRoutes) {
  if (locs.includes(siteUrl + route)) {
    throw new Error("Private route found in sitemap: " + route);
  }
}

console.log(`DSA SEO validation passed: ${locs.length} sitemap URLs.`);
