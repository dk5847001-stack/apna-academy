import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");

if (!siteUrl) {
  throw new Error(
    "VITE_SITE_URL is required for a Frontend build because canonical URLs, robots.txt and sitemap.xml must point to the real production origin."
  );
}

const origin = siteUrl;
const publicDir = resolve(process.cwd(), "public");
const indexHtmlPath = resolve(process.cwd(), "index.html");
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

let indexHtml = await readFile(indexHtmlPath, "utf8");

const replaceMetaContent = (html, attribute, value) => {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(<meta\\s+[^>]*${escapedAttribute}\\s*=\\s*[\"'][^\"']+[\"'][^>]*\\s+content\\s*=\\s*[\"'])[^\"']*([\"'])`,
    "i"
  );
  return html.replace(pattern, `$1${value}$2`);
};

const replaceCanonical = (html, value) =>
  html.replace(
    /(<link\\s+[^>]*rel\\s*=\\s*[\"']canonical[\"'][^>]*href\\s*=\\s*[\"'])[^\"']*([\"'])/i,
    `$1${value}$2`
  );

const ensureOgUrl = (html, value) => {
  if (/property\\s*=\\s*[\"']og:url[\"']/i.test(html)) {
    return replaceMetaContent(html, "property[\\s\\S]*?og:url", value);
  }

  const ogTypeMatch = html.match(/\\s*<meta\\s+property\\s*=\\s*[\"']og:type[\"'][^>]*>\\s*/i);
  if (!ogTypeMatch) {
    return html;
  }

  const tag = `\\n    <meta\\n      property="og:url"\\n      content="${value}"\\n    />\\n`;
  return html.replace(ogTypeMatch[0], `${ogTypeMatch[0]}${tag}`);
};

const originalIndexHtml = indexHtml;

indexHtml = ensureOgUrl(indexHtml, `${origin}/`);
indexHtml = replaceMetaContent(indexHtml, 'property\\s*=\\s*["']og:image', `${origin}/favicon.png`);
indexHtml = replaceMetaContent(indexHtml, 'name\\s*=\\s*["']twitter:image', `${origin}/favicon.png`);
indexHtml = replaceCanonical(indexHtml, `${origin}/`);

if (indexHtml === originalIndexHtml) {
  throw new Error(
    "Could not update Frontend index.html SEO URLs. Expected canonical or social metadata was not found."
  );
}

await writeFile(indexHtmlPath, indexHtml, "utf8");

console.log(`SEO files and production head metadata generated for ${origin}`);
