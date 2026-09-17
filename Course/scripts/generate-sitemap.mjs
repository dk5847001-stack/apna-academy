import fs from "node:fs/promises";
import path from "node:path";

const siteUrl = (
  process.env.VITE_COURSE_URL || process.env.VITE_SITE_URL || "http://localhost:5173"
).replace(/\/$/, "");

const apiBaseUrl = (
  process.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"
).replace(/\/$/, "");

const outputPath = path.resolve(process.cwd(), "dist", "sitemap.xml");
const pageSize = 50;

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

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
    const pageCourses = Array.isArray(result?.courses) ? result.courses : [];
    const pagination = result?.pagination || {};

    courses.push(...pageCourses);
    totalPages = Math.max(Number(pagination.totalPages) || 1, page);
    page += 1;
  }

  return courses;
};

const buildSitemap = (courses) => {
  const urls = [
    `${siteUrl}/`,
    ...courses
      .map((course) => course?.slug)
      .filter(Boolean)
      .map((slug) => `${siteUrl}/courses/${encodeURIComponent(slug)}`),
  ];

  const uniqueUrls = [...new Set(urls)];
  const lastmod = new Date().toISOString().split("T")[0];

  const entries = uniqueUrls
    .map(
      (url) => `  <url>\n    <loc>${escapeXml(url)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
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
