import fs from "node:fs/promises";
import path from "node:path";

const siteUrl = (
  process.env.VITE_COURSE_URL || process.env.VITE_SITE_URL || "https://course.apnaacademy.me"
).replace(/\/$/, "");

const apiBaseUrl = (
  process.env.VITE_API_BASE_URL || "https://api.apnaacademy.me/api/v1"
).replace(/\/$/, "");

if (!/^https:\/\//i.test(siteUrl)) {
  throw new Error("VITE_COURSE_URL must be an HTTPS absolute URL in production.");
}

const outputPath = path.resolve(process.cwd(), "dist", "sitemap.xml");
const pageSize = 50;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toIsoDate = (value, fallback) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString().split("T")[0];
};

const fetchPublishedCourses = async () => {
  const courses = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL(`${apiBaseUrl}/courses`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(pageSize));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Course API returned ${response.status} for ${url}`);
    }

    const payload = await response.json();
    const result = payload?.data;
    const pageCourses = Array.isArray(result?.courses)
      ? result.courses
      : Array.isArray(result)
        ? result
        : Array.isArray(payload?.courses)
          ? payload.courses
          : [];
    const pagination = result?.pagination || {};
    courses.push(...pageCourses);

    totalPages = Math.max(
      Number(pagination.totalPages) || 1,
      page,
    );
    page += 1;
  }

  return courses;
};

const buildSitemap = (courses) => {
  const fallbackLastmod = new Date().toISOString().split("T")[0];
  const entriesByUrl = new Map();

  entriesByUrl.set(`${siteUrl}/`, {
    url: `${siteUrl}/`,
    lastmod: fallbackLastmod,
  });

  courses.forEach((course) => {
    const slug = String(course?.slug || "").trim();
    if (!slug) return;

    const url = `${siteUrl}/courses/${encodeURIComponent(slug)}`;
    const lastmod = toIsoDate(
      course?.updatedAt || course?.createdAt,
      fallbackLastmod,
    );

    entriesByUrl.set(url, {
      url,
      lastmod,
    });
  });

  const entries = [...entriesByUrl.values()]
    .map(
      ({ url, lastmod }) =>
        `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${escapeXml(lastmod)}</lastmod>\n  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
};

const main = async () => {
  const courses = await fetchPublishedCourses();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, buildSitemap(courses), "utf8");
  console.log(`Generated ${outputPath} with ${courses.length} published course URL(s).`);
};

main().catch((error) => {
  console.error("Failed to generate sitemap:", error);
  process.exitCode = 1;
});
