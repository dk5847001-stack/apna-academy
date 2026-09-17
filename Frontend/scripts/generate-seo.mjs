import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");
const isProduction = process.env.NODE_ENV === "production" || process.env.CI === "true";

if (!siteUrl) {
  if (isProduction) {
    throw new Error(
      "VITE_SITE_URL is required for a production Frontend build. Example: https://your-domain.com"
    );
  }
  console.warn("VITE_SITE_URL is not set; using http://localhost:5173 for local SEO files.");
}

const origin = siteUrl || "http://localhost:5173";
const publicDir = resolve(process.cwd(), "public");
await mkdir(publicDir, { recursive: true });

const publicRoutes = [
  { path: "/", priority: "1.0" },
  { path: "/courses", priority: "0.9" },
  { path: "/pricing", priority: "0.8" },
  { path: "/about", priority: "0.7" },
  { path: "/contact", priority: "0.6" },
  { path: "/blog", priority: "0.8" },
  { path: "/privacy-policy", priority: "0.3" },
  { path: "/refund-policy", priority: "0.3" },
];

const xmlEscape = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const urls = publicRoutes
  .map(
    ({ path, priority }) => `  <url>\n    <loc>${xmlEscape(`${origin}${path}`)}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  )
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\nDisallow: /login\nDisallow: /register\nDisallow: /forgot-password\nDisallow: /reset-password\n\nSitemap: ${origin}/sitemap.xml\n`;

await writeFile(resolve(publicDir, "sitemap.xml"), sitemap, "utf8");
await writeFile(resolve(publicDir, "robots.txt"), robots, "utf8");

console.log(`SEO files generated for ${origin}`);
