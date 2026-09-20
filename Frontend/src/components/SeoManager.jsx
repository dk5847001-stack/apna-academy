import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "ApnaAcademy";
const SITE_DESCRIPTION =
  "ApnaAcademy is a modern online learning platform for practical courses, skill development and career-focused learning.";

const BLOG_POSTS = [
  { title: "How to Build Job-Ready Web Development Skills", date: "2026-09-14", description: "A practical roadmap from web fundamentals to React, Node.js, APIs, databases and deployment." },
  { title: "Why Project-Based Learning Works", date: "2026-09-10", description: "How structured projects turn concepts into practical skills, debugging experience and portfolio evidence." },
  { title: "A Better Way to Prepare for Technical Interviews", date: "2026-09-05", description: "A balanced approach to DSA, computer science fundamentals, projects and technical communication." },
  { title: "DSA Roadmap: From Basics to Interview Practice", date: "2026-09-03", description: "A structured path through core data structures, algorithms and problem-solving practice." },
  { title: "How to Choose Your First Programming Language", date: "2026-08-30", description: "A practical guide to choosing Java, C++, Python or JavaScript based on your learning and project goals." },
  { title: "How to Build a Strong Developer Portfolio", date: "2026-08-26", description: "What to include in a developer portfolio to demonstrate projects, technical decisions and practical ability." },
  { title: "What Makes a Good Full Stack Project?", date: "2026-08-22", description: "Key features that turn a basic application into a useful full-stack project with authentication, APIs, data and deployment." },
  { title: "AI and Machine Learning Learning Path for Beginners", date: "2026-08-18", description: "A beginner-friendly sequence for Python, data handling, machine learning concepts and practical AI projects." },
  { title: "How to Study Consistently While in College", date: "2026-08-14", description: "A realistic weekly system for balancing classes, DSA, projects, revision and long-term skill development." },
];

const PAGE_SEO = {
  "/": {
    title: "ApnaAcademy | Learn Skills. Build Your Future.",
    description:
      "Learn practical, career-focused skills with ApnaAcademy courses, guided learning and structured skill development.",
    type: "website",
    indexable: true,
  },
  "/courses": {
    title: "Online Courses | ApnaAcademy",
    description:
      "Explore ApnaAcademy's practical online courses for web development, programming, data science, AI and career-focused skills.",
    type: "website",
    indexable: true,
  },
  "/pricing": {
    title: "Course Pricing | ApnaAcademy",
    description:
      "Explore ApnaAcademy's course pricing and choose a practical learning plan for your skill-development goals.",
    type: "website",
    indexable: true,
  },
  "/about": {
    title: "About ApnaAcademy | Practical Online Learning",
    description:
      "Learn about ApnaAcademy, our practical learning approach, career-focused courses and mission to make skill development accessible.",
    type: "website",
    indexable: true,
  },
  "/contact": {
    title: "Contact ApnaAcademy | Support & Enquiries",
    description:
      "Contact ApnaAcademy for course, learning platform, support and general enquiries.",
    type: "website",
    indexable: true,
  },
  "/blog": {
    title: "ApnaAcademy Blog | Learning & Career Resources",
    description:
      "Read ApnaAcademy learning resources, career guidance and practical technology content for students and aspiring developers.",
    type: "website",
    indexable: true,
  },
  "/privacy-policy": {
    title: "Privacy Policy | ApnaAcademy",
    description:
      "Read the ApnaAcademy privacy policy and information about data handling.",
    type: "website",
    indexable: true,
  },
  "/refund-policy": {
    title: "Refund Policy | ApnaAcademy",
    description:
      "Read the ApnaAcademy refund policy and applicable terms.",
    type: "website",
    indexable: true,
  },
  "/login": {
    title: "Login | ApnaAcademy",
    description: "Sign in to your ApnaAcademy account.",
    type: "website",
    indexable: false,
  },
  "/register": {
    title: "Create Your Account | ApnaAcademy",
    description:
      "Create an ApnaAcademy account to access courses and learning features.",
    type: "website",
    indexable: false,
  },
  "/forgot-password": {
    title: "Forgot Password | ApnaAcademy",
    description:
      "Reset your ApnaAcademy account password securely.",
    type: "website",
    indexable: false,
  },
  "/reset-password": {
    title: "Reset Password | ApnaAcademy",
    description: "Reset your ApnaAcademy account password.",
    type: "website",
    indexable: false,
  },
};

const upsertMeta = (selector, attributes, content) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attributes).forEach(([key, value]) =>
      element.setAttribute(key, value)
    );
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
};

const upsertLink = (selector, rel, href) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

const upsertJsonLd = (id, data) => {
  let element = document.head.querySelector(
    `script[data-apna-seo="${id}"]`
  );
  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.dataset.apnaSeo = id;
    document.head.appendChild(element);
  }
  element.textContent = JSON.stringify(data);
};

const removeJsonLd = (id) =>
  document.head
    .querySelector(`script[data-apna-seo="${id}"]`)
    ?.remove();

const toAbsoluteUrl = (origin, value) => {
  if (!value) return "";
  try {
    return new URL(value, origin).href;
  } catch {
    return "";
  }
};

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const normalizedPath =
      pathname === "/" ? "/" : pathname.replace(/\/$/, "");

    const page = PAGE_SEO[normalizedPath] || {
      title: "Page Not Found | ApnaAcademy",
      description:
        "The requested ApnaAcademy page could not be found.",
      type: "website",
      indexable: false,
    };

    const origin = (
      import.meta.env.VITE_SITE_URL || window.location.origin
    ).replace(/\/$/, "");

    const canonicalUrl = `${origin}${normalizedPath === "/" ? "/" : normalizedPath}`;
    const imageUrl = `${origin}/favicon.png`;

    document.documentElement.lang = "en";
    document.title = page.title;

    upsertMeta(
      'meta[name="description"]',
      { name: "description" },
      page.description
    );
    upsertMeta(
      'meta[name="robots"]',
      { name: "robots" },
      page.indexable
        ? "index, follow, max-image-preview:large"
        : "noindex, nofollow, noarchive"
    );
    upsertMeta(
      'meta[name="googlebot"]',
      { name: "googlebot" },
      page.indexable ? "index, follow" : "noindex, nofollow"
    );
    upsertMeta('meta[property="og:type"]', { property: "og:type" }, page.type);
    upsertMeta(
      'meta[property="og:title"]',
      { property: "og:title" },
      page.title
    );
    upsertMeta(
      'meta[property="og:description"]',
      { property: "og:description" },
      page.description
    );
    upsertMeta(
      'meta[property="og:url"]',
      { property: "og:url" },
      canonicalUrl
    );
    upsertMeta(
      'meta[property="og:site_name"]',
      { property: "og:site_name" },
      SITE_NAME
    );
    upsertMeta(
      'meta[property="og:locale"]',
      { property: "og:locale" },
      "en_IN"
    );
    upsertMeta(
      'meta[property="og:image"]',
      { property: "og:image" },
      imageUrl
    );
    upsertMeta(
      'meta[property="og:image:alt"]',
      { property: "og:image:alt" },
      `${SITE_NAME} logo`
    );
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary");
    upsertMeta(
      'meta[name="twitter:title"]',
      { name: "twitter:title" },
      page.title
    );
    upsertMeta(
      'meta[name="twitter:description"]',
      { name: "twitter:description" },
      page.description
    );
    upsertMeta(
      'meta[name="twitter:image"]',
      { name: "twitter:image" },
      imageUrl
    );
    upsertLink(
      'link[rel="canonical"]',
      "canonical",
      canonicalUrl
    );

    const breadcrumbItems = [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: `${origin}/`,
      },
    ];

    if (normalizedPath !== "/") {
      const segmentName = normalizedPath
        .slice(1)
        .split("/")
        .filter(Boolean)
        .map((segment) => segment.replace(/-/g, " "))
        .join(" ");

      breadcrumbItems.push({
        "@type": "ListItem",
        position: 2,
        name: segmentName.replace(/\b\w/g, (char) =>
          char.toUpperCase()
        ),
        item: canonicalUrl,
      });
    }

    const organizationEntity = {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      url: `${origin}/`,
      logo: imageUrl,
      description: SITE_DESCRIPTION,
    };

    upsertJsonLd("breadcrumb", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: breadcrumbItems,
    });

    upsertJsonLd("webpage", {
      "@context": "https://schema.org",
      "@type": normalizedPath === "/courses" ? "CollectionPage" : "WebPage",
      name: page.title,
      description: page.description,
      url: canonicalUrl,
      inLanguage: "en-IN",
      isPartOf: {
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${origin}/`,
      },
      publisher: organizationEntity,
    });

    if (normalizedPath === "/courses") {
      upsertJsonLd("course-list", {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "ApnaAcademy Online Courses",
        url: canonicalUrl,
        itemListElement: [],
      });

      const loadCourseList = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || ""}/courses`,
            {
              headers: { Accept: "application/json" },
            }
          );

          const payload = await response.json();
          const data = payload?.data;
          const courses = Array.isArray(data)
            ? data
            : Array.isArray(payload?.courses)
            ? payload.courses
            : Array.isArray(data?.courses)
            ? data.courses
            : [];

          const items = courses
            .filter((course) => course?.slug && course?.title)
            .map((course, index) => {
              const courseUrl = `${import.meta.env.VITE_COURSE_URL || "https://course.apnaacademy.me"}/courses/${encodeURIComponent(
                course.slug
              )}`;

              const item = {
                "@type": "ListItem",
                position: index + 1,
                name: course.title,
                url: courseUrl,
                item: {
                  "@type": "Course",
                  name: course.title,
                  description:
                    course.shortDescription ||
                    course.description ||
                    `Practical ${course.title} course from ApnaAcademy.`,
                  url: courseUrl,
                  provider: {
                    "@type": "Organization",
                    name: SITE_NAME,
                    sameAs: `${origin}/`,
                  },
                },
              };

              const image = toAbsoluteUrl(origin, course.thumbnail);
              if (image) item.item.image = image;

              if (course.instructor?.name) {
                item.item.instructor = {
                  "@type": "Person",
                  name: course.instructor.name,
                };
              }

              return item;
            });

          upsertJsonLd("course-list", {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "ApnaAcademy Online Courses",
            url: canonicalUrl,
            numberOfItems: items.length,
            itemListElement: items,
          });
        } catch {
          // Keep the valid empty ItemList if the public API is unavailable.
        }
      };

      loadCourseList();
    } else {
      removeJsonLd("course-list");
    }

    if (normalizedPath === "/blog") {
      const blogPosts = BLOG_POSTS.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.date,
        dateModified: post.date,
        description: post.description,
        mainEntityOfPage: `${origin}/blog`,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
          url: `${origin}/`,
        },
        publisher: organizationEntity,
      }));

      upsertJsonLd("blog", {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "ApnaAcademy Blog",
        description: page.description,
        url: canonicalUrl,
        inLanguage: "en-IN",
        publisher: organizationEntity,
        blogPost: blogPosts,
      });
    } else {
      removeJsonLd("blog");
    }

    if (normalizedPath === "/") {
      upsertJsonLd("website", {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${origin}/`,
        description: SITE_DESCRIPTION,
        inLanguage: "en-IN",
      });
      upsertJsonLd("organization", {
        "@context": "https://schema.org",
        ...organizationEntity,
      });
    } else {
      removeJsonLd("website");
      removeJsonLd("organization");
    }
  }, [pathname]);

  return null;
}
