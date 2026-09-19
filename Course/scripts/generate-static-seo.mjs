import fs from "node:fs/promises";
import path from "node:path";

const siteUrl = (
  process.env.VITE_COURSE_URL || "https://course.apnaacademy.me"
).replace(/\/$/, "");

const apiBaseUrl = (
  process.env.VITE_API_BASE_URL || "https://api.apnaacademy.me/api/v1"
).replace(/\/$/, "");

if (!/^https:\/\//i.test(siteUrl)) {
  throw new Error("VITE_COURSE_URL must be an HTTPS absolute URL.");
}

const distRoot = path.resolve(process.cwd(), "dist");
const sourceIndexPath = path.join(distRoot, "index.html");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const cleanText = (value, fallback = "") =>
  String(value || fallback).replace(/\s+/g, " ").trim();

const truncate = (value, max) => {
  const text = cleanText(value);
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
};

const absoluteUrl = (value, fallback) => {
  const raw = cleanText(value, fallback);
  try {
    return new URL(raw, siteUrl).toString();
  } catch {
    return fallback;
  }
};

const fetchPublishedCourses = async () => {
  const courses = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = new URL(`${apiBaseUrl}/courses`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", "50");

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

    courses.push(...pageCourses);
    const pagination = result?.pagination || {};
    totalPages = Math.max(Number(pagination.totalPages) || 1, page);
    page += 1;
  }

  return courses.filter((course) => String(course?.slug || "").trim());
};

const buildCourseSchema = (course, canonical, image) => {
  const title = cleanText(course?.title, "ApnaAcademy Course");
  const description = truncate(
    course?.description || course?.shortDescription,
    5000,
  );
  const category = cleanText(course?.category, "Development");
  const level = cleanText(course?.level, "beginner");
  const language = cleanText(course?.language, "English");
  const instructorName = cleanText(course?.instructor?.name);
  const instructorImage = absoluteUrl(course?.instructor?.avatar, "");
  const tags = Array.isArray(course?.tags)
    ? course.tags.map((tag) => cleanText(tag)).filter(Boolean)
    : [];
  const durationDays = Number(course?.durationDays) || 0;
  const price = Number(course?.price);

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: title,
    description: description || "Practical online course from ApnaAcademy.",
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    about: { "@type": "Thing", name: category },
    ...(tags.length ? { teaches: tags } : {}),
    keywords: [title, category, level, language, ...tags].filter(Boolean).join(", "),
    provider: { "@type": "Organization", name: "ApnaAcademy", url: siteUrl },
    educationalLevel: level,
    inLanguage: language,
    courseMode: "online",
    ...(durationDays > 0
      ? {
          timeRequired: `P${durationDays}D`,
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "online",
            inLanguage: language,
            courseWorkload: `P${durationDays}D`,
            ...(instructorName
              ? {
                  instructor: {
                    "@type": "Person",
                    name: instructorName,
                    ...(instructorImage ? { image: instructorImage } : {}),
                  },
                }
              : {}),
          },
        }
      : {}),
    ...(instructorName
      ? {
          instructor: {
            "@type": "Person",
            name: instructorName,
            ...(instructorImage ? { image: instructorImage } : {}),
          },
        }
      : {}),
    ...(Number.isFinite(price) && price > 0
      ? {
          offers: {
            "@type": "Offer",
            price: price.toFixed(2),
            priceCurrency: "INR",
            url: canonical,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
    isAccessibleForFree: !(Number.isFinite(price) && price > 0),
    ...(image ? { image } : {}),
  };
};

const buildBreadcrumb = (course, canonical) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "ApnaAcademy", item: `${siteUrl}/` },
    { "@type": "ListItem", position: 2, name: "Courses", item: `${siteUrl}/` },
    {
      "@type": "ListItem",
      position: 3,
      name: cleanText(course?.title, "Course"),
      item: canonical,
    },
  ],
});

const injectHead = (html, { title, description, canonical, image, schema }) => {
  const tags = `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <meta name="googlebot" content="index, follow, max-image-preview:large" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="ApnaAcademy" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <script type="application/ld+json">${escapeJson(schema.course)}</script>
    <script type="application/ld+json">${escapeJson(schema.breadcrumb)}</script>
  `;

  return html.replace("</head>", `${tags}\n  </head>`);
};

const main = async () => {
  const template = await fs.readFile(sourceIndexPath, "utf8");
  const courses = await fetchPublishedCourses();

  for (const course of courses) {
    const slug = String(course.slug).trim();
    const canonical = `${siteUrl}/courses/${encodeURIComponent(slug)}`;
    const title = `${cleanText(course.title, "Course")} | ApnaAcademy`;
    const description =
      truncate(course.shortDescription || course.description, 160) ||
      "Explore this practical online course at ApnaAcademy.";
    const image = absoluteUrl(course.thumbnail, `${siteUrl}/favicon.png`);

    const html = injectHead(template, {
      title,
      description,
      canonical,
      image,
      schema: {
        course: buildCourseSchema(course, canonical, image),
        breadcrumb: buildBreadcrumb(course, canonical),
      },
    });

    const outputDir = path.join(distRoot, "courses", slug);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, "index.html"), html, "utf8");
  }

  console.log(`Generated static SEO HTML for ${courses.length} course detail page(s).`);
};

main().catch((error) => {
  console.error("Failed to generate static course SEO pages:", error);
  process.exitCode = 1;
});
