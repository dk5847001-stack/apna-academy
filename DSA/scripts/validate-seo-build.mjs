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
const publicRoutes = ["/", "/practice", "/topics", "/companies", "/daily-challenge", "/study-plans"];
const privateRoutes = ["/progress", "/submissions", "/bookmarks", "/profile", "/settings", "/practice/code", "/unlock"];

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

const robots = read(path.join(dist, "robots.txt"));
const sitemap = read(path.join(dist, "sitemap.xml"));
if (!robots.includes("Sitemap: " + siteUrl + "/sitemap.xml")) {
  throw new Error("robots.txt does not point to the production sitemap.");
}
if (!sitemap.includes("<urlset")) throw new Error("Invalid sitemap.xml.");

for (const route of publicRoutes) {
  const file = route === "/" ? path.join(dist, "index.html") : path.join(dist, route.slice(1), "index.html");
  if (!fs.existsSync(file)) throw new Error("Missing static SEO route: " + route);
  const routeHtml = read(file);
  if (!routeHtml.includes(siteUrl)) throw new Error("Missing production URL in: " + route);
}

for (const route of privateRoutes) {
  if (sitemap.includes(siteUrl + route)) {
    throw new Error("Private route found in sitemap: " + route);
  }
}

console.log("DSA SEO validation passed.");
