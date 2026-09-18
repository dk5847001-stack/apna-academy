import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
    const origin = getOrigin();
    const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
    const canonicalUrl = `${origin}${normalizedPath === "/" ? "/" : normalizedPath}`;
    const seo = getPublicSeo(normalizedPath);
    const privatePath = isPrivatePath(normalizedPath);
    const notFound = !seo && !privatePath;

    if (privatePath || notFound) {
      document.title = privatePath ? "ApnaAcademy DSA" : "Page Not Found | ApnaAcademy DSA";
      setRobots("noindex, nofollow, noarchive, nosnippet, noimageindex");
      removeCanonical();
      setSocial({ title: "", description: "", url: "", indexable: false });
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
  }, [pathname]);

  return null;
}
