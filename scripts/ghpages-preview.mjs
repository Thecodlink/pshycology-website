/*
 * Local GitHub-Pages emulator (dev verification only — not for production).
 * Mirrors Pages' resolution order: exact file → directory/index.html →
 * 404.html with a 404 status. Run after a build: `bun run preview:pages`.
 */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const DIST = path.resolve(".output/public");
const PORT = Number(process.env.PORT ?? 8888);
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

const send = (res, status, file) => {
  res.writeHead(status, { "content-type": MIME[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const safe = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, "");
    const target = path.join(DIST, safe);
    if (!target.startsWith(DIST)) {
      res.writeHead(403);
      return res.end();
    }
    if (fs.existsSync(target) && fs.statSync(target).isFile()) return send(res, 200, target);
    const asDir = path.join(target, "index.html");
    if (fs.existsSync(asDir)) return send(res, 200, asDir);
    return send(res, 404, path.join(DIST, "404.html"));
  })
  .listen(PORT, () => console.log(`GitHub-Pages emulator: http://localhost:${PORT}`));
