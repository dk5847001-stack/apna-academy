import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getDsaProblem, getDsaStudyPlan } from "../services/dsa.service.js";

const SITE_NAME = "ApnaAcademy DSA";

const PUBLIC_SEO = {
  "/": {
    title: "ApnaAcademy DSA — Practice & Coding",
    description:
      "Practice data structures and algorithms, explore DSA topics, prepare by company, follow study plans and improve coding skills with ApnaAcademy DSA.",
  },
  "/practice": {
    title: "DSA Problems — Practice Coding | ApnaAcademy",
    description:
      "Practice data structures and algorithms problems with structured topics, difficulty levels and coding-focused preparation on ApnaAcademy.",
  },
  "/topics": {
    title: "DSA Topics — Data Structures & Algorithms | ApnaAcademy",
    description:
      "Explore DSA topics and practice problems topic by topic with structured data structures and algorithms preparation.",
  },
  "/companies": {
    title: "DSA Company Preparation | ApnaAcademy",
    description:
      "Practice company-focused data structures and algorithms problems and prepare with structured DSA resources on ApnaAcademy.",
  },
  "/daily-challenge": {
    title: "Daily DSA Challenge | ApnaAcademy",
    description:
      "Take on a daily data structures and algorithms challenge and build consistent coding practice with ApnaAcademy.",
  },
  "/study-plans": {
    title: "DSA Study Plans | ApnaAcademy",
    description:
      "Follow structured DSA study plans for consistent data structures and algorithms practice and coding preparation.",
  },
};

const PRIVATE_PREFIXES = [
  "/progress",
  "/submissions",
  "/bookmarks",
  "/profile",
  "/settings",
  "/practice/code",
];

function upsertMeta(selector, attrs, content) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function removeMeta(selector) {
  document.head.querySelectorAll(selector).forEach((element) => element.remove());
}

function upsertLink(rel, href) {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
}

function removeCanonical() {
  document.head.querySelectorAll('link[rel="canonical"]').forEach((element) => element.remove());
}

function getOrigin() {
  return (
    import.meta.env.VITE_DSA_URL ||
    window.location.origin
  ).replace(/\/$/, "");
}

function isPrivatePath(pathname) {
  return PRIVATE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

function clampText(value, maxLength) {
  const text = String(value || "").replace(/\\s+/g, " ").trim();
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function getPublicSeo(pathname) {
  if (PUBLIC_SEO[pathname]) return PUBLIC_SEO[pathname];

  if (pathname.startsWith("/practice/") && pathname !== "/practice/code") {
    return {
      title: "DSA Problem Practice | ApnaAcademy",
      description:
        "Practice a data structures and algorithms problem with focused problem-solving and coding preparation on ApnaAcademy.",
    };
  }

  if (pathname.startsWith("/study-plans/")) {
    return {
      title: "DSA Study Plan | ApnaAcademy",
      description:
        "Follow a structured data structures and algorithms study plan with ApnaAcademy.",
    };
  }

  return null;
}

function removeJsonLd() {
  document.head.querySelectorAll('script[data-apna-dsa-jsonld="true"]').forEach((element) => element.remove());
}

function setJsonLd(graph) {
  removeJsonLd();
  if (!graph?.length) return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.apnaDsaJsonld = "true";
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": graph,
  });
  document.head.appendChild(script);
}

function breadcrumbGraph(origin, pathname, title) {
  const parts = pathname.split("/").filter(Boolean);
  const items = [{ name: "DSA", url: `${origin}/` }];
  let path = "";
  parts.forEach((part) => {
    path += `/${part}`;
    items.push({
      name: part
        .replace(/-/g, " ")
        .replace(/\\b\\w/g, (letter) => letter.toUpperCase()),
      url: `${origin}${path}`,
    });
  });
  if (items.length) items[items.length - 1].name = title;

  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function baseGraph({ origin, pathname, title, description, pageType = "WebPage" }) {
  const url = `${origin}${pathname === "/" ? "/" : pathname}`;
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      url: `${origin}/`,
      name: SITE_NAME,
      inLanguage: "en-IN",
    },
    {
      "@type": "EducationalOrganization",
      "@id": `${origin}/#organization`,
      name: "ApnaAcademy",
      url: `${origin}/`,
    },
    {
      "@type": pageType,
      "@id": `${url}#webpage`,
      url,
      name: title,
      description,
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#organization` },
      inLanguage: "en-IN",
    },
    breadcrumbGraph(origin, pathname, title),
  ];
  return graph;
}

function problemGraph({ origin, pathname, title, description, problem }) {
  const url = `${origin}${pathname}`;
  const graph = baseGraph({
    origin,
    pathname,
    title,
    description,
    pageType: "WebPage",
  });
  graph.push({
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: problem.title || title,
    description,
    learningResourceType: "DSA Problem",
    isPartOf: { "@id": `${origin}/#website` },
  });
  return graph;
}

function studyPlanGraph({ origin, pathname, title, description, plan }) {
  const url = `${origin}${pathname}`;
  const graph = baseGraph({
    origin,
    pathname,
    title,
    description,
    pageType: "WebPage",
  });
  graph.push({
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: plan.title || title,
    description,
    learningResourceType: "DSA Study Plan",
    isPartOf: { "@id": `${origin}/#website` },
  });
  return graph;
}

function listItemGraph({ origin, pathname, title, description, items, itemType }) {
  const url = `${origin}${pathname}`;
  const graph = baseGraph({
    origin,
    pathname,
    title,
    description,
    pageType: "CollectionPage",
  });
  const list = (items || []).slice(0, 100).map((item, index) => {
    const slug = item.slug;
    const itemUrl = slug
      ? `${origin}${itemType === "problem" ? "/practice/" : "/study-plans/"}${encodeURIComponent(slug)}`
      : null;
    return itemUrl
      ? {
          "@type": "ListItem",
          position: index + 1,
          url: itemUrl,
          name: item.title || item.name || slug,
        }
      : null;
  }).filter(Boolean);

  if (list.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#itemlist`,
      url,
      numberOfItems: list.length,
      itemListElement: list,
    });
  }
  return graph;
}

function setRobots(content) {
  upsertMeta('meta[name="robots"]', { name: "robots" }, content);
  upsertMeta('meta[name="googlebot"]', { name: "googlebot" }, content);
  upsertMeta('meta[name="bingbot"]', { name: "bingbot" }, content);
}

function setSocial({ title, description, url, indexable }) {
  if (!indexable) {
    removeMeta('meta[property^="og:"]');
    removeMeta('meta[name^="twitter:"]');
    return;
  }

  upsertMeta('meta[property="og:type"]', { property: "og:type" }, "website");
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name" }, SITE_NAME);
  upsertMeta('meta[property="og:title"]', { property: "og:title" }, title);
  upsertMeta('meta[property="og:description"]', { property: "og:description" }, description);
  upsertMeta('meta[property="og:url"]', { property: "og:url" }, url);
  upsertMeta(
    'meta[property="og:image"]',
    { property: "og:image" },
    `${getOrigin()}/favicon.png`
  );
  upsertMeta(
    'meta[property="og:image:alt"]',
    { property: "og:image:alt" },
    `ApnaAcademy DSA — ${title}`
  );
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card" }, "summary_large_image");
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title" }, title);
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description" }, description);
  upsertMeta(
    'meta[name="twitter:image"]',
    { name: "twitter:image" },
    `${getOrigin()}/favicon.png`
  );
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    let cancelled = false;
    const origin = getOrigin();
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const canonicalUrl = `${origin}${normalizedPath === "/" ? "/" : normalizedPath}`;
    const privatePath = isPrivatePath(normalizedPath);
    const baseSeo = getPublicSeo(normalizedPath);

    const applySeo = (seo) => {
      if (cancelled) return;
      if (!seo) {
        document.title = "Page Not Found | ApnaAcademy DSA";
        setRobots("noindex, nofollow, noarchive, nosnippet, noimageindex");
        removeCanonical();
        setSocial({ title: "", description: "", url: "", indexable: false });\n        removeJsonLd();
        return;
      }

      document.title = seo.title;
      upsertMeta('meta[name="description"]', { name: "description" }, seo.description);
      setRobots("index, follow, max-image-preview:large");
      upsertLink("canonical", canonicalUrl);
      setSocial({
        title: seo.title,
        description: seo.description,
        url: canonicalUrl,
        indexable: true,
      });
    };

    if (privatePath) {
      document.title = "ApnaAcademy DSA";
      setRobots("noindex, nofollow, noarchive, nosnippet, noimageindex");
      removeCanonical();
      setSocial({ title: "", description: "", url: "", indexable: false });
      return () => { cancelled = true; };
    }

    if (!baseSeo) {
      applySeo(null);
      return () => { cancelled = true; };
    }

    applySeo(baseSeo);

    const problemMatch = normalizedPath.match(/^\/practice\/([^/]+)$/);
    const planMatch = normalizedPath.match(/^\/study-plans\/([^/]+)$/);

    if (problemMatch && problemMatch[1] !== "code") {
      getDsaProblem(decodeURIComponent(problemMatch[1]))
        .then((problem) => {
          if (!problem) return applySeo(null);
          const topics = (problem.topics || []).slice(0, 3).join(", ");
          const difficulty = problem.difficulty ? ` — ${problem.difficulty}` : "";
          const title = clampText(`${problem.title || "DSA Problem"}${difficulty} | ApnaAcademy`, 65);
          const description = clampText(
            problem.description ||
              `Practice ${problem.title || "this DSA problem"} with examples, constraints and coding preparation on ApnaAcademy.`,
            160
          );
          applySeo({ title, description, topics });
          setJsonLd(problemGraph({
            origin,
            pathname: normalizedPath,
            title,
            description,
            problem,
          }));
        })
        .catch(() => {
          // Keep the stable route-level SEO on transient API failures.
        });
    } else if (planMatch) {
      getDsaStudyPlan(decodeURIComponent(planMatch[1]))
        .then((plan) => {
          if (!plan) return applySeo(null);
          const duration = plan.durationDays ? ` — ${plan.durationDays} Days` : "";
          const title = clampText(`${plan.title || "DSA Study Plan"}${duration} | ApnaAcademy`, 65);
          const description = clampText(
            plan.description ||
              `Follow the ${plan.title || "DSA study plan"} for structured data structures and algorithms preparation on ApnaAcademy.`,
            160
          );
          applySeo({ title, description });
          setJsonLd(studyPlanGraph({
            origin,
            pathname: normalizedPath,
            title,
            description,
            plan,
          }));
        })
        .catch(() => {
          // Keep the stable route-level SEO on transient API failures.
        });
    }

    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
