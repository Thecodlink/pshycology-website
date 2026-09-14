import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { inActionItems } from "@/lib/inAction";
import { howItWorksSteps } from "@/lib/steps";
import { services } from "@/lib/services";
import { absoluteUrl, sitemapOrigin } from "@/lib/site";

/**
 * Content-data invariants for the whole site. These lock the rules that keep
 * the gallery, steps and services honest and structurally valid:
 *   - every referenced public image actually exists on disk
 *     (a renamed/removed asset must fail the build, not 404 in production);
 *   - every media item carries descriptive alt text and sane intrinsic
 *     dimensions (the DriftWall sizes tiles from them — a zero/missing pair
 *     would break the no-crop layout contract);
 *   - no duplicate data keys (slugs, image paths) that would create
 *     competing routes or duplicate wall tiles;
 *   - SITE_URL placeholder semantics: absolute URLs stay undefined while the
 *     domain is unset, and the sitemap falls back to the live request origin.
 */
describe("content data integrity", () => {
  const publicFile = (url: string) => fs.existsSync(path.join("public", url));

  it("every in-action image exists and every entry is complete", () => {
    expect(inActionItems.length).toBe(12);
    const seen = new Set<string>();
    for (const item of inActionItems) {
      expect(item.image.startsWith("/images/"), item.image).toBe(true);
      expect(publicFile(item.image), `missing file for ${item.image}`).toBe(true);
      expect(item.alt.length, "alt text required").toBeGreaterThan(10);
      expect(item.alt).not.toMatch(/^(image|photo|img_\d+)/i);
      expect(item.title.length).toBeGreaterThan(2);
      expect(item.width).toBeGreaterThan(100);
      expect(item.height).toBeGreaterThan(100);
      expect(seen.has(item.image), `duplicate image ${item.image}`).toBe(false);
      seen.add(item.image);
    }
  });

  it("every step and service image exists; slugs are unique and url-safe", () => {
    const slugs = new Set<string>();
    for (const s of services) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(slugs.has(s.slug), `duplicate slug ${s.slug}`).toBe(false);
      slugs.add(s.slug);
      if (s.image) expect(publicFile(s.image), `missing ${s.image}`).toBe(true);
    }
    for (const st of howItWorksSteps) {
      expect(publicFile(st.image), `missing ${st.image}`).toBe(true);
      expect(st.imageAlt.length).toBeGreaterThan(10);
    }
  });

  it("SITE_URL placeholder behaviour (domain not yet connected)", () => {
    expect(absoluteUrl("/x")).toBeUndefined();
    const req = new Request("https://sukoon.example/services/foo?x=1");
    expect(sitemapOrigin(req)).toBe("https://sukoon.example");
  });

  it("every /images/ path referenced anywhere in src exists on disk", () => {
    // Regression guard for the asset-optimization pipeline: renamed/removed
    // files must fail the build, not render as black/404 boxes in production.
    const files: string[] = [];
    const walk = (d: string) =>
      fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
        const p = path.join(d, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e.name)) files.push(p);
      });
    walk("src");
    const refs = new Set<string>();
    for (const f of files) {
      for (const m of fs
        .readFileSync(f, "utf8")
        .matchAll(/["'`](\/images\/[\w./-]+\.\w{3,4})["'`]/g)) {
        const ref = m[1];
        if (ref && !ref.includes("${")) refs.add(ref);
      }
    }
    expect(refs.size).toBeGreaterThan(20);
    for (const ref of refs) expect(publicFile(ref), `referenced but missing: ${ref}`).toBe(true);
  });
});
