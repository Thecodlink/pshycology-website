/*
 * Post-build integrity pass for the GitHub Pages artifact (runs via `postbuild`).
 * Fails loudly if anything GitHub Pages needs is missing from .output/public/.
 *
 * 404.html strategy: GitHub Pages serves this file (status 404) for unknown
 * paths. Rather than hydrating a mismatched SSR payload (which logs React
 * hydration errors for every deep-link visitor), it is a tiny branded,
 * self-contained shell that forwards to /404 — a REAL prerendered route that
 * renders the exact same not-found experience with perfectly matched
 * hydration. It carries no JS bundle dependency and no flash of layout.
 */
import fs from "node:fs";
import path from "node:path";

const DIST = ".output/public";
const required = [
  "index.html",
  "CNAME",
  "robots.txt",
  "sitemap.xml",
  "humans.txt",
  ".well-known/security.txt",
  "manifest.webmanifest",
  "favicon.ico",
  "apple-touch-icon.png",
  "icons/pwa-192.png",
  "icons/pwa-512.png",
  "images/og/og-image.jpg",
  "images/brand/logo.png",
  "404/index.html",
];

const shell = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Page not found – Sukoon Nest</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center;
             background: #fdfdfb; font: 15px/1.5 system-ui, -apple-system, sans-serif; }
      .box { text-align: center; padding: 1.5rem; }
      img { height: 44px; width: auto; opacity: .85; }
      a { color: #6f927b; }
      noscript p { color: #52645c; font-size: 14px; }
    </style>
  </head>
  <body>
    <main class="box">
      <img src="/images/brand/logo.png" alt="Sukoon Nest" width="400" height="289" />
      <p>Hang on — taking you to a safe place…</p>
      <noscript><p>Or <a href="/">return home</a>.</p></noscript>
    </main>
    <script>location.replace("/404/" + (location.search || ""));</script>
  </body>
</html>
`;
fs.writeFileSync(path.join(DIST, "404.html"), shell);

const missing = required.filter((f) => !fs.existsSync(path.join(DIST, f)));
if (missing.length) {
  console.error("postbuild-pages: MISSING from .output/public/:", missing.join(", "));
  process.exit(1);
}

console.log(
  "postbuild-pages: ok —",
  required.length,
  "required files present; 404.html redirect shell written",
);
