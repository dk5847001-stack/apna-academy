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
        }),
    );
  } catch {
    return {};
  }
};

const env = { ...readDotEnv(".env"), ...readDotEnv(".env.local"), ...process.env };
const siteUrl = (env.VITE_DSA_URL || "http://localhost:5173").replace(/\/$/, "");
const isLocalBuild = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(siteUrl.replace(/^https?:\/\//i, ""));

const fail = (message) => {
  throw new Error("SEO validation failed: " + message);
};

const read = (file) => fs.readFileSync(file, "utf8");
const escapeRegExp = (value) => value.replace(/[.*+?^\${}()|[\]\\]/g, "\\$&");

const metaValue = (html, attr, key) => {
  const pattern = new RegExp(
    '<meta\\s+[^>]*' + attr + '=["\']' + escapeRegExp(key) + '["\'][^>]*content=["\']([^"\']*)["\'][^>]*>',
    "i",
  );
  return html.match(pattern)?.[1]?.trim() || "";
};

const count = (html, regex) => [...html.matchAll(regex)].length;

if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) fail("VITE_DSA_URL must be an absolute URL.");
if (!fs.existsSync(path.join(dist, "index.html"))) fail("dist/index.html is missing. Run the Vite build first.");

const rootHtml = read(path.join(dist, "index.html"));
const notFoundPath = path.join(dist, "404.html");
if (!fs.existsSync(notFoundPath)) fail("dist/404.html is missing.");
const notFoundHtml = read(notFoundPath);
if (!/noindex/i.test(metaValue(notFoundHtml, "name", "robots"))) fail("404.html must be noindex.");
if (/<link\\s+[^>]*rel=["']canonical["']/i.test(notFoundHtml)) fail("404.html must not contain a canonical URL.");
const sitemapPath = path.join(dist, "sitemap.xml");
const robotsPath = path.join(dist, "robots.txt");

if (!fs.existsSync(sitemapPath) || !fs.existsSync(robotsPath)) {
  fail("robots.txt or sitemap.xml is missing from dist.");
}

const robots = read(robotsPath);
const sitemap = read(sitemapPath);

if (!robots.includes("Sitemap: " + siteUrl + "/sitemap.xml")) {
  fail("robots.txt does not point to the configured sitemap.");
}
if (!sitemap.includes("<urlset")) fail("sitemap.xml is not a urlset.");
if (/%VITE_[A-Z0-9_]+%/.test(rootHtml + robots + sitemap)) {
  fail("unresolved Vite SEO placeholders remain in build output.");
}

const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

if (!locs.length) fail("sitemap.xml contains no URLs.");
if (new Set(locs).size !== locs.length) fail("sitemap.xml contains duplicate URLs.");
if (locs.length > 50000) fail("sitemap.xml exceeds the 50,000 URL limit.");

const privateRoutes = new Set([
  "/progress",
  "/submissions",
  "/bookmarks",
  "/profile",
  "/settings",
  "/practice/code",
  "/unlock",
]);

const publicExactRoutes = new Set([
  "/",
  "/practice",
  "/topics",
  "/companies",
  "/daily-challenge",
  "/study-plans",
]);

const publicDynamicPrefixes = ["/practice/", "/study-plans/", "/companies/"];

for (const url of locs) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    fail("invalid sitemap URL: " + url);
  }

  if (parsed.origin !== siteUrl) fail("sitemap URL is outside the configured site origin: " + url);
  if (parsed.search || parsed.hash) fail("query/hash URL found in sitemap: " + url);
  if (/%[0-9A-F]{2}/i.test(parsed.pathname)) {
    fail("percent-encoded path found in sitemap; use canonical readable slugs: " + url);
  }

  const pathname = parsed.pathname.replace(/\/$/, "") || "/";
  if (privateRoutes.has(pathname)) fail("private route found in sitemap: " + pathname);

  const allowed =
    publicExactRoutes.has(pathname) ||
    publicDynamicPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (!allowed) fail("unexpected URL in sitemap: " + url);
}

const htmlForUrl = (url) => {
  const pathname = new URL(url).pathname.replace(/\/$/, "") || "/";
  return pathname === "/" ? path.join(dist, "index.html") : path.join(dist, pathname.slice(1), "index.html");
};

const validateHtml = (url, html) => {
  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() || "";
  const description = metaValue(html, "name", "description");
  const robotsValue = metaValue(html, "name", "robots");
  const googlebot = metaValue(html, "name", "googlebot");
  const canonicalMatches = [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
  const ogUrl = metaValue(html, "property", "og:url");
  const ogTitle = metaValue(html, "property", "og:title");
  const ogDescription = metaValue(html, "property", "og:description");
  const twitterTitle = metaValue(html, "name", "twitter:title");
  const twitterDescription = metaValue(html, "name", "twitter:description");
  const jsonLdScripts = [...html.matchAll(/<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];

  if (count(html, /<title>/gi) !== 1) fail("expected exactly one title: " + url);
  if (title.length < 10 || title.length > 70) fail("title length " + title.length + " is outside 10–70: " + url);
  if (description.length < 50 || description.length > 170) {
    fail("description length " + description.length + " is outside 50–170: " + url);
  }
  if (!/^index,\s*follow\b/i.test(robotsValue)) fail("public page is not index/follow: " + url);
  if (!/^index,\s*follow\b/i.test(googlebot)) fail("public page is not index/follow for Googlebot: " + url);
  if (canonicalMatches.length !== 1 || canonicalMatches[0][1] !== url) fail("canonical mismatch: " + url);
  if (ogUrl !== url) fail("og:url mismatch: " + url);
  if (!ogTitle || !ogDescription || !twitterTitle || !twitterDescription) {
    fail("social metadata incomplete: " + url);
  }
  if (!jsonLdScripts.length) fail("JSON-LD missing: " + url);

  for (const match of jsonLdScripts) {
    let parsed;
    try {
      parsed = JSON.parse(match[1]);
    } catch {
      fail("invalid JSON-LD: " + url);
    }
    if (parsed?.["@context"] !== "https://schema.org") {
      fail("JSON-LD context is not schema.org: " + url);
    }
  }

  if (!isLocalBuild && /(localhost|127\.0\.0\.1)/i.test(html)) {
    fail("localhost URL found in production HTML: " + url);
  }
  if (/%VITE_[A-Z0-9_]+%/.test(html)) fail("unresolved Vite placeholder found: " + url);
};

for (const url of locs) {
  const file = htmlForUrl(url);
  if (!fs.existsSync(file)) fail("missing static SEO page for sitemap URL: " + url);
  validateHtml(url, read(file));
}

// Every generated route directory must be represented in the sitemap.
const htmlRoutes = [];
const walk = (directory, prefix = "") => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === "assets" || entry.name.startsWith(".")) continue;
    const full = path.join(directory, entry.name);
    const route = prefix + "/" + entry.name;
    if (entry.isDirectory()) {
      if (fs.existsSync(path.join(full, "index.html"))) htmlRoutes.push(route);
      walk(full, route);
    }
  }
};
walk(dist);

for (const route of htmlRoutes) {
  const normalized = route.replace(/\/$/, "") || "/";
  if (!publicExactRoutes.has(normalized) && !publicDynamicPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    fail("unexpected generated HTML route: " + normalized);
  }
  if (!locs.includes(siteUrl + (normalized === "/" ? "/" : normalized))) {
    fail("generated HTML route is missing from sitemap: " + normalized);
  }
}

console.log(
  "DSA SEO validation passed: " +
  locs.length +
  " public URLs with title, description, canonical, robots, OG/Twitter, JSON-LD and static-page coverage.",
);
