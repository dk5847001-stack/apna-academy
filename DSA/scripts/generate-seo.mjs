import fs from "node:fs";
import path from "node:path";

const siteUrl = (process.env.VITE_DSA_URL || "").replace(/\/$/, "");
if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) {
  throw new Error("VITE_DSA_URL must be set to an absolute production URL.");
}

const publicDir = path.join(process.cwd(), "public");
fs.mkdirSync(publicDir, { recursive: true });

const robots = fs.readFileSync(path.join(publicDir, "robots.txt"), "utf8")
  .replace(/Sitemap:\s*.*$/m, "Sitemap: " + siteUrl + "/sitemap.xml");
fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

const staticRoutes = ["/", "/practice", "/topics", "/companies", "/daily-challenge", "/study-plans"];
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...staticRoutes.map((route) => "  <url><loc>" + siteUrl + route + "</loc></url>"),
  "</urlset>",
  "",
].join("\n");
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);

const indexPath = path.join(process.cwd(), "index.html");
let html = fs.readFileSync(indexPath, "utf8");
html = html.replace(/%VITE_DSA_URL%/g, siteUrl);
fs.writeFileSync(indexPath, html);

console.log("Generated DSA robots.txt, sitemap.xml and production SEO URLs.");
