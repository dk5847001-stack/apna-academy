import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnvFile } from "node:process";

try {
  loadEnvFile(resolve(process.cwd(), ".env"));
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}

const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");
if (!/^https?:\/\/[^\s/]+$/i.test(siteUrl)) {
  throw new Error("VITE_SITE_URL must be an absolute production URL.");
}

const distDir = resolve(process.cwd(), "dist");
const routes = ["/", "/courses", "/pricing", "/about", "/contact", "/blog", "/privacy-policy", "/refund-policy"];
const read = (path) => readFile(path, "utf8");
const fail = (message) => { throw new Error(`SEO validation failed: ${message}`); };

const indexHtml = await read(resolve(distDir, "index.html"));
const robots = await read(resolve(distDir, "robots.txt"));
const sitemap = await read(resolve(distDir, "sitemap.xml"));

if (/localhost|127\.0\.0\.1/i.test(indexHtml)) fail("production HTML contains a local URL");
if (!indexHtml.includes(siteUrl)) fail("configured production origin is missing from index.html");
if (!/<title>[^<]{10,70}<\/title>/i.test(indexHtml)) fail("title is missing or outside 10–70 characters");
if (!/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{50,}["']/i.test(indexHtml)) fail("description is missing or too short");
if (!/<link[^>]+rel=["']canonical["'][^>]+href=["']https?:\/\//i.test(indexHtml)) fail("absolute canonical URL is missing");
if (!/property=["']og:url["'][^>]+content=["']https?:\/\//i.test(indexHtml)) fail("absolute og:url is missing");
if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) fail("robots.txt sitemap URL is incorrect");

for (const route of routes) {
  const file = route === "/" ? resolve(distDir, "index.html") : resolve(distDir, `.${route}/index.html`);
  await access(file);
  const html = await read(file);
  const canonical = `${siteUrl}${route}`;
  if (!html.includes(canonical)) fail(`canonical/site URL missing for ${route}`);
  if (/localhost|127\.0\.0\.1/i.test(html)) fail(`local URL found in ${route}`);
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) fail(`sitemap is missing ${route}`);
}

console.log(`SEO build validation passed for ${routes.length} public routes.`);
