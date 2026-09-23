import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(process.cwd(), "public");
const required = [
  "manifest.webmanifest",
  "sw.js",
  "offline.html",
  "favicon.png",
];

const missing = required.filter((file) => !existsSync(resolve(root, file)));

if (missing.length) {
  console.error(`PWA check failed. Missing: ${missing.join(", ")}`);
  process.exit(1);
}

const manifest = JSON.parse(
  readFileSync(resolve(root, "manifest.webmanifest"), "utf8")
);

const requiredManifest = {
  name: "ApnaAcademy",
  short_name: "ApnaAcademy",
  start_url: "/",
  scope: "/",
  display: "standalone",
};

for (const [key, expected] of Object.entries(requiredManifest)) {
  if (manifest[key] !== expected) {
    console.error(`PWA check failed: manifest.${key} must be ${expected}`);
    process.exit(1);
  }
}

if (!Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  console.error("PWA check failed: at least two manifest icons are required.");
  process.exit(1);
}

const indexHtml = readFileSync(resolve(process.cwd(), "index.html"), "utf8");

if (!indexHtml.includes('href="/manifest.webmanifest"')) {
  console.error("PWA check failed: manifest link is missing from index.html.");
  process.exit(1);
}

if (!indexHtml.includes('src="/src/main.jsx"')) {
  console.error("PWA check failed: Vite application entry is missing.");
  process.exit(1);
}

const sw = readFileSync(resolve(root, "sw.js"), "utf8");

if (!sw.includes('navigator')) {
  // Service-worker source itself does not need navigator; keep this branch out
  // of the validation path. Registration is validated below through main.jsx.
}

const mainJsx = readFileSync(resolve(process.cwd(), "src/main.jsx"), "utf8");

if (!mainJsx.includes('serviceWorker.register("/sw.js")')) {
  console.error("PWA check failed: service worker registration is missing.");
  process.exit(1);
}

console.log("PWA readiness check passed.");
console.log("Manifest, icons, service worker, offline fallback and registration are present.");
