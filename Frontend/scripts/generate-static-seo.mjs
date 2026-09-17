import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const siteUrl = (process.env.VITE_SITE_URL || "").trim().replace(/\/$/, "");

if (!siteUrl) {
  throw new Error("VITE_SITE_URL is required before generating static SEO pages.");
}

const origin = siteUrl;
const distDir = resolve(process.cwd(), "dist");
const indexPath = resolve(distDir, "index.html");
const logoUrl = `${origin}/favicon.png`;

const pages = [
  { path: "/", title: "ApnaAcademy | Learn Skills. Build Your Future.", description: "Learn practical, career-focused skills with ApnaAcademy courses, guided learning and structured skill development.", type: "WebSite", indexable: true },
  { path: "/courses", title: "Online Courses | ApnaAcademy", description: "Explore ApnaAcademy's practical online courses for web development, programming, data science, AI and career-focused skills.", type: "CollectionPage", indexable: true },
  { path: "/pricing", title: "Course Pricing | ApnaAcademy", description: "Explore ApnaAcademy's course pricing and choose a practical learning plan for your skill-development goals.", type: "WebPage", indexable: true },
  { path: "/about", title: "About ApnaAcademy | Practical Online Learning", description: "Learn about ApnaAcademy, our practical learning approach, career-focused courses and mission to make skill development accessible.", type: "WebPage", indexable: true },
  { path: "/contact", title: "Contact ApnaAcademy | Support & Enquiries", description: "Contact ApnaAcademy for course, learning platform, support and general enquiries.", type: "WebPage", indexable: true },
  { path: "/blog", title: "ApnaAcademy Blog | Learning & Career Resources", description: "Read ApnaAcademy learning resources, career guidance and practical technology content for students and aspiring developers.", type: "WebPage", indexable: true },
  { path: "/privacy-policy", title: "Privacy Policy | ApnaAcademy", description: "Read the ApnaAcademy privacy policy and information about data handling.", type: "WebPage", indexable: true },
  { path: "/refund-policy", title: "Refund Policy | ApnaAcademy", description: "Read the ApnaAcademy refund policy and applicable terms.", type: "WebPage", indexable: true },
];

const blogPosts = [
  {
    title: "How to Build Job-Ready Web Development Skills",
    date: "2026-09-14",
    description: "A practical roadmap for frontend, backend, APIs, databases and real-world projects.",
  },
  {
    title: "Why Project-Based Learning Works",
    date: "2026-09-10",
    description: "Move from passive tutorials to structured projects and measurable progress.",
  },
  {
    title: "A Better Way to Prepare for Technical Interviews",
    date: "2026-09-05",
    description: "Balance DSA, computer science fundamentals, projects and communication.",
  },
];

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const escapeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

const replaceLinkHref = (html, rel, href) =>
  html.replace(
    new RegExp(`(<link[^>]*\\brel\\s*=\\s*["']${rel}["'][^>]*\\bhref\\s*=\\s*["'])[^"']*(["'][^>]*>)`, "i"),
    `$1${escapeHtml(href)}$2`
  );

const replaceOrAddMeta = (html, attrs, value) => {
  const attrPattern = Object.entries(attrs)
    .map(([key, val]) => `\\b${key}\\s*=\\s*["']${String(val).replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}["']`)
    .join("\\s+");
  const tagPattern = new RegExp(`<meta[^>]*${attrPattern}[^>]*>`, "i");
  if (tagPattern.test(html)) {
    return html.replace(tagPattern, (tag) => {
      if (/\bcontent\s*=/.test(tag)) return tag.replace(/\bcontent\s*=\s*["'][^"']*["']/i, `content="${escapeHtml(value)}"`);
      return tag.replace(/\s*\/?>$/, ` content="${escapeHtml(value)}" />`);
    });
  }
  return html.replace(/<\/head>/i, `    <meta ${Object.entries(attrs).map(([k, v]) => `${k}="${escapeHtml(v)}"`).join(" ")} content="${escapeHtml(value)}" />\n  </head>`);
};

const injectPageSeo = (template, page) => {
  const canonicalUrl = `${origin}${page.path === "/" ? "/" : page.path}`;
  let html = template.replace(/<title>[^<]*<\/title>/i, `<title>${escapeHtml(page.title)}</title>`);

  html = replaceOrAddMeta(html, { name: "description" }, page.description);
  html = replaceOrAddMeta(html, { name: "robots" }, page.indexable ? "index, follow, max-image-preview:large" : "noindex, nofollow, noarchive");
  html = replaceOrAddMeta(html, { name: "googlebot" }, page.indexable ? "index, follow" : "noindex, nofollow");
  html = replaceOrAddMeta(html, { property: "og:title" }, page.title);
  html = replaceOrAddMeta(html, { property: "og:description" }, page.description);
  html = replaceOrAddMeta(html, { property: "og:url" }, canonicalUrl);
  html = replaceOrAddMeta(html, { property: "og:type" }, "website");
  html = replaceOrAddMeta(html, { property: "og:image" }, logoUrl);
  html = replaceOrAddMeta(html, { property: "og:image:alt" }, "ApnaAcademy logo");
  html = replaceOrAddMeta(html, { name: "twitter:title" }, page.title);
  html = replaceOrAddMeta(html, { name: "twitter:description" }, page.description);
  html = replaceOrAddMeta(html, { name: "twitter:image" }, logoUrl);
  html = replaceOrAddMeta(html, { name: "twitter:card" }, "summary");
  html = replaceLinkHref(html, "canonical", canonicalUrl);

  html = html.replace(/<script[^>]*type=["']application\/ld\+json["'][^>]*data-apna-seo=["'][^"']+["'][^>]*>[\s\S]*?<\/script>/gi, "");

  const publisher = {
    "@type": "EducationalOrganization",
    name: "ApnaAcademy",
    url: `${origin}/`,
    logo: logoUrl,
    description: "ApnaAcademy is a modern online learning platform for practical courses, skill development and career-focused learning.",
  };

  let schema;
  if (page.type === "WebSite") {
    schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "ApnaAcademy",
      url: `${origin}/`,
      description: "ApnaAcademy is a modern online learning platform for practical courses, skill development and career-focused learning.",
      inLanguage: "en-IN",
    };
  } else if (page.path === "/blog") {
    schema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "ApnaAcademy Blog",
      description: page.description,
      url: canonicalUrl,
      inLanguage: "en-IN",
      publisher,
      blogPost: blogPosts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.date,
        dateModified: post.date,
        description: post.description,
        mainEntityOfPage: canonicalUrl,
        author: { "@type": "Organization", name: "ApnaAcademy", url: `${origin}/` },
        publisher,
      })),
    };
  } else {
    schema = {
      "@context": "https://schema.org",
      "@type": page.type,
      name: page.title,
      description: page.description,
      url: canonicalUrl,
      inLanguage: "en-IN",
      isPartOf: { "@type": "WebSite", name: "ApnaAcademy", url: `${origin}/` },
      publisher,
    };
  }

  html = html.replace(/<\/head>/i, `    <script type="application/ld+json" data-apna-seo="static-page">${escapeJson(schema)}</script>\n  </head>`);
  return html;
};

const template = await readFile(indexPath, "utf8");

for (const page of pages) {
  const outputPath = page.path === "/" ? indexPath : resolve(distDir, `.${page.path}/index.html`);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, injectPageSeo(template, page), "utf8");
}

const notFoundHtml = template
  .replace(/<title>[^<]*<\/title>/i, "<title>Page Not Found | ApnaAcademy</title>")
  .replace(/<\/head>/i, `    <meta name="robots" content="noindex, nofollow, noarchive" />\n    <meta name="googlebot" content="noindex, nofollow" />\n  </head>`);
await writeFile(resolve(distDir, "404.html"), notFoundHtml, "utf8");

console.log(`Static SEO HTML generated for ${pages.length} public routes plus 404.html`);
