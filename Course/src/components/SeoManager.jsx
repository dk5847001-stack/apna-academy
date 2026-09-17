import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const APP_NAME = "ApnaAcademy";
const DEFAULT_DESCRIPTION =
  "Explore practical online courses with structured lessons, projects and skill-focused learning at ApnaAcademy.";
const SITE_URL = String(import.meta.env.VITE_COURSE_URL || window.location.origin).replace(/\/$/, "");
const DEFAULT_IMAGE = `${SITE_URL}/favicon.svg`;

const PRIVATE_PATTERNS = [
  /^\/courses\/[^/]+\/learn(?:\/|$)/,
  /^\/courses\/[^/]+\/assessment(?:\/|$)/,
  /^\/courses\/[^/]+\/certificate(?:\/|$)/,
  /^\/certificate\/verify(?:\/|$)/,
];

const setMeta = (selector, attributes, content) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
};

const setLink = (rel, href) => {
  let node = document.head.querySelector(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement("link");
    node.setAttribute("rel", rel);
    document.head.appendChild(node);
  }
  node.setAttribute("href", href);
};

const setJsonLd = (id, value) => {
  let node = document.head.querySelector(`script[data-apna-seo="${id}"]`);
  if (!node) {
    node = document.createElement("script");
    node.type = "application/ld+json";
    node.dataset.apnaSeo = id;
    document.head.appendChild(node);
  }
  node.textContent = JSON.stringify(value);
};

const removeJsonLd = (id) => {
  document.head.querySelector(`script[data-apna-seo="${id}"]`)?.remove();
};

const cleanText = (value, fallback = "") =>
  String(value || fallback).replace(/\s+/g, " ").trim();

const courseDescription = (course) =>
  cleanText(
    course?.shortDescription || course?.description,
    DEFAULT_DESCRIPTION,
  ).slice(0, 160);

const getCourseSlug = (pathname) => {
  const match = pathname.match(/^\/courses\/([^/]+)\/?$/);
  return match ? decodeURIComponent(match[1]) : "";
};

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isCatalog = pathname === "/" || pathname === "";
    const courseSlug = getCourseSlug(pathname);
    const isCourseDetails = Boolean(courseSlug);
    const isPrivate = PRIVATE_PATTERNS.some((pattern) => pattern.test(pathname));

    let active = true;

    const apply = (course = null) => {
      if (!active) return;

      let title = `${APP_NAME} | Practical Online Courses`;
      let description = DEFAULT_DESCRIPTION;
      let canonical = `${SITE_URL}${isCatalog ? "/" : pathname}`;
      let image = DEFAULT_IMAGE;
      let type = "website";
      let robots = "index, follow, max-image-preview:large";

      if (isPrivate) {
        title = `${APP_NAME} | Learning`;
        description = "Private learning area for ApnaAcademy students.";
        robots = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      } else if (isCourseDetails) {
        const courseTitle = cleanText(course?.title, courseSlug.replace(/[-_]+/g, " "));
        title = `${courseTitle} | ${APP_NAME}`;
        description = courseDescription(course);
        canonical = `${SITE_URL}/courses/${encodeURIComponent(courseSlug)}`;
        image = cleanText(course?.thumbnail, DEFAULT_IMAGE);
        type = "article";
      } else if (pathname !== "/") {
        robots = "noindex, nofollow, noarchive, nosnippet, noimageindex";
      }

      document.documentElement.lang = "en";
      document.title = title;
      setMeta('meta[name="description"]', { name: "description" }, description);
      setMeta('meta[name="robots"]', { name: "robots" }, robots);
      setMeta('meta[name="googlebot"]', { name: "googlebot" }, robots);
      setMeta('meta[name="bingbot"]', { name: "bingbot" }, robots);
      setMeta('meta[property="og:type"]', { property: "og:type" }, type);
      setMeta('meta[property="og:title"]', { property: "og:title" }, title);
      setMeta('meta[property="og:description"]', { property: "og:description" }, description);
      setMeta('meta[property="og:url"]', { property: "og:url" }, canonical);
      setMeta('meta[property="og:site_name"]', { property: "og:site_name" }, APP_NAME);
      setMeta('meta[property="og:image"]', { property: "og:image" }, image);
      setMeta('meta[property="og:image:alt"]', { property: "og:image:alt" }, title);
      setMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
      setMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title);
      setMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
      setMeta('meta[name="twitter:image"]', { name: "twitter:image" }, image);

      setLink("canonical", canonical);

      if (isPrivate || (!isCatalog && !isCourseDetails)) {
        removeJsonLd("course");
        removeJsonLd("breadcrumb");
        removeJsonLd("catalog");
        return;
      }

      const breadcrumb = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: APP_NAME,
            item: `${SITE_URL}/`,
          },
          ...(isCourseDetails
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Courses",
                  item: `${SITE_URL}/`,
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: cleanText(course?.title, courseSlug),
                  item: canonical,
                },
              ]
            : []),
        ],
      };
      setJsonLd("breadcrumb", breadcrumb);

      if (isCourseDetails && course) {
        const courseSchema = {
          "@context": "https://schema.org",
          "@type": "Course",
          name: cleanText(course.title),
          description,
          url: canonical,
          provider: {
            "@type": "Organization",
            name: APP_NAME,
            url: SITE_URL,
          },
          educationalLevel: cleanText(course.level, "beginner"),
          inLanguage: cleanText(course.language, "English"),
          ...(Number(course.durationDays) > 0
            ? { timeRequired: `P${Number(course.durationDays)}D` }
            : {}),
          ...(course.instructor?.name
            ? {
                instructor: {
                  "@type": "Person",
                  name: cleanText(course.instructor.name),
                },
              }
            : {}),
          ...(Number(course.price) > 0
            ? {
                offers: {
                  "@type": "Offer",
                  price: Number(course.price).toFixed(2),
                  priceCurrency: "INR",
                  url: canonical,
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
          ...(course.thumbnail ? { image: image } : {}),
        };
        setJsonLd("course", courseSchema);
        removeJsonLd("catalog");
      } else {
        removeJsonLd("course");
        setJsonLd("catalog", {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${APP_NAME} Courses`,
          description,
          url: `${SITE_URL}/`,
        });
      }
    };

    if (isCourseDetails && !isPrivate) {
      const eventHandler = (event) => {
        const course = event.detail;
        if (course?.slug && String(course.slug) === String(courseSlug)) apply(course);
      };
      window.addEventListener("apnaacademy-course-loaded", eventHandler);
      apply(null);
      return () => {
        active = false;
        window.removeEventListener("apnaacademy-course-loaded", eventHandler);
      };
    }

    apply(null);
    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
}
