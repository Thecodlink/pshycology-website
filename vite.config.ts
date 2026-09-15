// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } } etc...) if needed.
//
// DEPLOYMENT TARGET: GitHub Pages (sukoonnest.live via CNAME) — free static hosting.
// The build is fully prerendered SSG: every route ships as real HTML (head metadata,
// content and hydration markers intact — crawlers and social previews never execute
// JS). `nitro.preset: "static"` replaces the Cloudflare default; `pages` drives the
// prerender queue and the built-in sitemap; CNAME/robots/humans/security.txt live in
// public/ so they land in the emitted dist; scripts/postbuild-pages.mjs adds the
// GitHub-Pages 404.html SPA fallback and asserts the required files exist.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { SITE_URL } from "./src/lib/site";
import { services } from "./src/lib/services";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    server: { entry: "server" },
    pages: [
      { path: "/", sitemap: { priority: 1.0, changefreq: "weekly" } },
      { path: "/privacy", sitemap: { priority: 0.3, changefreq: "yearly" } },
      { path: "/disclaimer", sitemap: { priority: 0.3, changefreq: "yearly" } },
      // GitHub-Pages 404 fallback target (real route, never indexed).
      { path: "/404", prerender: { autoSubfolderIndex: true }, sitemap: { exclude: true } },
      ...services.map((s) => ({
        path: `/services/${s.slug}`,
        sitemap: { priority: 0.7, changefreq: "monthly" },
      })),
    ],
    sitemap: {
      enabled: true,
      outputPath: "sitemap.xml",
      host: SITE_URL,
    },
    // Only the declared pages above are rendered — no link-crawler, so hash
    // anchors (#about) and incidental links can never pollute the sitemap or
    // produce duplicate prerenders.
    prerender: { enabled: true, failOnError: true, crawlLinks: false },
  },
});
