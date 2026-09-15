#!/usr/bin/env node
/*
 * Sukoon Nest — review service.
 *
 * A REAL backend: persistent SQLite (node:sqlite, zero native deps), server-side
 * validation, per-IP rate limiting, duplicate detection, honeypot trap, strict
 * CORS allow-list, and token-authenticated moderation. Nothing here is mocked:
 * submissions return 201 only after an INSERT has been committed, and the public
 * endpoint only ever reads rows with status='approved'.
 *
 * Run:  node review-server/server.mjs
 * Env:  PORT, REVIEW_DB_PATH, REVIEW_ADMIN_TOKEN, REVIEW_ALLOWED_ORIGINS,
 *       REVIEW_TRUST_PROXY (set "1" behind Render/Fly-style XFF proxies)
 */
import { createServer } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { DatabaseSync } from "node:sqlite";

const PORT = Number(process.env.PORT ?? 8787);
const DB_PATH = process.env.REVIEW_DB_PATH ?? new URL("./review.db", import.meta.url).pathname;
const ADMIN_TOKEN = process.env.REVIEW_ADMIN_TOKEN ?? "";
const TRUST_PROXY = process.env.REVIEW_TRUST_PROXY === "1";
const ALLOWED_ORIGINS = new Set(
  (process.env.REVIEW_ALLOWED_ORIGINS ?? "https://sukoonnest.live,https://www.sukoonnest.live")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

const MAX_BODY_BYTES = 8 * 1024;
const LIMITS = { name: [2, 40], text: [10, 600], service: 60 };
const RATE_WINDOW_MS = Number(process.env.REVIEW_RATE_WINDOW_MS ?? 60 * 60 * 1000);
const RATE_MAX = Number(process.env.REVIEW_RATE_MAX ?? 5);
const DUP_WINDOW_MS = 24 * 60 * 60 * 1000;

/* ---------------- database ---------------- */
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS reviews (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text        TEXT NOT NULL,
    service     TEXT,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    admin_note  TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_reviews_status_created
    ON reviews (status, created_at DESC);
`);

const insertReview = db.prepare(
  `INSERT INTO reviews (id, name, rating, text, service, status, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
);
const fetchApproved = db.prepare(
  `SELECT id, name, rating, text, service, created_at FROM reviews
   WHERE status = 'approved' ORDER BY created_at DESC LIMIT ? OFFSET ?`,
);
const fetchByStatus = db.prepare(
  `SELECT id, name, rating, text, service, status, admin_note, created_at, updated_at
   FROM reviews WHERE (?1 = '' OR status = ?1) ORDER BY created_at DESC LIMIT 200`,
);
const setStatus = db.prepare(
  `UPDATE reviews SET status = ?, admin_note = COALESCE(?, admin_note), updated_at = ? WHERE id = ?`,
);
const deleteById = db.prepare(`DELETE FROM reviews WHERE id = ?`);
const recentDuplicate = db.prepare(
  `SELECT COUNT(*) AS n FROM reviews WHERE name = ? AND text = ? AND created_at > ?`,
);

/* ---------------- helpers ---------------- */
function nowIso(ms = Date.now()) {
  return new Date(ms).toISOString();
}

function json(res, status, body, origin) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["access-control-allow-origin"] = origin;
    headers["vary"] = "origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

/* Reads with a size cap; on overflow the connection is NOT destroyed (that
 * surfaces as a network error client-side) — the caller short-circuits to 413. */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooBig = false;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY_BYTES) {
        tooBig = true;
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve({ body: Buffer.concat(chunks).toString("utf8"), tooBig }));
    req.on("error", reject);
  });
}

/* Server-side validation — mirrors and cannot be bypassed by the client. */
export function validateReview(raw) {
  const errors = {};
  if (typeof raw !== "object" || raw === null) return { errors: { form: "malformed request" } };
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const text = typeof raw.text === "string" ? raw.text.trim() : "";
  const service = typeof raw.service === "string" ? raw.service.trim() : "";
  const rating = raw.rating;
  if (name.length < LIMITS.name[0] || name.length > LIMITS.name[1])
    errors.name = "name must be 2-40 characters";
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)
    errors.rating = "rating must be a whole number from 1 to 5";
  if (text.length < LIMITS.text[0]) errors.text = "review must be at least 10 characters";
  if (text.length > LIMITS.text[1]) errors.text = "review must be 600 characters or fewer";
  if (service.length > LIMITS.service) errors.service = "service must be 60 characters or fewer";
  // Control characters are never legitimate user prose; also blocks header/log injection.
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(name + text + service))
    errors.form = "input contains invalid characters";
  return { errors, value: { name, rating, text, service: service || null } };
}

/* In-memory per-IP bucket; enough for this traffic scale and resets on restart
 * (SQLite duplicate-window check is the durable second layer). */
const buckets = new Map();
function rateLimited(ip) {
  const t = Date.now();
  const arr = (buckets.get(ip) ?? []).filter((x) => t - x < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    buckets.set(ip, arr);
    return true;
  }
  arr.push(t);
  buckets.set(ip, arr);
  return false;
}

function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function clientIp(req) {
  if (TRUST_PROXY) {
    const fwd = req.headers["x-forwarded-for"];
    if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  }
  return req.socket.remoteAddress ?? "unknown";
}

/* ---------------- admin dashboard (token lives only in the operator's browser
 * memory; every request is still authorized server-side) ---------------- */
const ADMIN_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Review moderation – Sukoon Nest</title>
<style>
 body{font:15px/1.6 system-ui,sans-serif;background:#fdfdfb;color:#1f332c;margin:0;padding:2rem}
 main{max-width:44rem;margin:auto} h1{font-weight:500} input,button{font:inherit}
 .card{border:1px solid #e3e6df;background:#fff;border-radius:14px;padding:1rem;margin:1rem 0}
 .row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center} button{border:1px solid #d8ddd5;background:#fff;border-radius:9px;padding:.4rem .8rem;cursor:pointer}
 button.ok{background:#6f927b;color:#fff;border-color:#6f927b} button.no{background:#b0413e;color:#fff;border-color:#b0413e}
 #bar{display:flex;gap:.5rem;margin-bottom:1rem} select{padding:.4rem}
</style></head><body><main>
<h1>Review moderation</h1>
<div id="bar" class="row">
 <input id="tok" type="password" placeholder="admin token" style="flex:1;min-width:12rem;padding:.5rem">
 <select id="flt"><option value="pending">pending</option><option value="">all</option><option value="approved">approved</option><option value="rejected">rejected</option></select>
 <button onclick="load()">Refresh</button>
</div><div id="list"></div>
<script>
const T=sessionStorage;T.getItem('rtok')&&(tok.value=T.getItem('rtok'));
async function api(p,o={}){const h={'content-type':'application/json',authorization:'Bearer '+(tok.value||''),...(o.headers||{})};
 const r=await fetch(p,{...o,headers:h});if(r.status==401)list.innerHTML='<p>Unauthorized — check the token.</p>';return r;}
async function load(){T.setItem('rtok',tok.value);const r=await api('/api/admin/reviews?status='+flt.value);if(!r.ok&&r.status!=200)return;
 const {reviews}=await r.json();list.innerHTML=reviews.map(v=>
 '<div class="card"><b>'+esc(v.name)+'</b> — '+v.rating+'★ <span style="opacity:.6">'+new Date(v.created_at).toLocaleString()+'</span>'+
 (v.service?'<div style="font-size:.85em;opacity:.75">'+esc(v.service)+'</div>':'')+
 '<p>'+esc(v.text)+'</p><div class="row"><button class=ok onclick="act(\\''+v.id+'\\','approved')">Approve</button>'+
 '<button class=no onclick="act(\\''+v.id+'\\','rejected')">Reject</button></div></div>').join('')||'<p>Nothing here.</p>';}
async function act(id,s){await api('/api/admin/reviews/'+id+'/'+s,{method:'POST'});load();}
function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
load();
</script></main></body></html>`;

/* ---------------- HTTP surface ---------------- */
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const origin = req.headers.origin;
  const path = url.pathname;

  if (req.method === "OPTIONS") {
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      res.writeHead(204, {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "GET,POST,DELETE,OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
        vary: "origin",
      });
    } else res.writeHead(204);
    return res.end();
  }

  try {
    if (req.method === "GET" && path === "/healthz") return json(res, 200, { ok: true });

    if (req.method === "GET" && path === "/api/reviews") {
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 10));
      const offset = Math.max(0, Number(url.searchParams.get("offset")) || 0);
      const reviews = fetchApproved.all(limit, offset);
      return json(res, 200, { reviews, limit, offset }, origin);
    }

    if (req.method === "POST" && path === "/api/reviews") {
      const { body, tooBig } = await readBody(req);
      if (tooBig) return json(res, 413, { errors: { form: "payload too large" } }, origin);
      const raw = JSON.parse(body || "{}");
      if (typeof raw.website === "string" && raw.website.trim() !== "") {
        // Honeypot: bots fill hidden fields. Answer identically, persist nothing.
        return json(res, 201, { id: randomUUID(), status: "pending" }, origin);
      }
      const ip = clientIp(req);
      if (rateLimited(ip))
        return json(res, 429, { errors: { form: "too many submissions" } }, origin);
      const { errors, value } = validateReview(raw);
      if (Object.keys(errors).length) return json(res, 400, { errors }, origin);
      const dup = recentDuplicate.get(value.name, value.text, nowIso(Date.now() - DUP_WINDOW_MS));
      if (dup?.n > 0)
        return json(
          res,
          409,
          { errors: { form: "an identical review was already shared today" } },
          origin,
        );
      const id = randomUUID();
      const ts = nowIso();
      insertReview.run(id, value.name, value.rating, value.text, value.service, ts, ts);
      return json(res, 201, { id, status: "pending" }, origin);
    }

    if (path === "/admin" || path === "/admin/") {
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      });
      return res.end(ADMIN_HTML);
    }

    if (path.startsWith("/api/admin/")) return await handleAdmin(req, res, url);

    return json(res, 404, { error: "not found" }, origin);
  } catch (err) {
    // Log server-side (never the review content), return a generic message.
    console.error(`[review-server] ${req.method} ${path} ->`, err.message);
    const status = err.status ?? 500;
    return json(res, status, { errors: { form: "something went wrong on our side" } }, origin);
  }
});

async function handleAdmin(req, res, url) {
  if (!ADMIN_TOKEN) return json(res, 503, { errors: { form: "moderation is not configured" } });
  const auth = req.headers.authorization ?? "";
  if (!auth.startsWith("Bearer ") || !safeEqual(auth.slice(7), ADMIN_TOKEN))
    return json(res, 401, { errors: { form: "unauthorized" } });

  const m = url.pathname.match(/^\/api\/admin\/reviews\/([\w-]+)\/(approve|reject)$/);
  if (req.method === "GET" && url.pathname === "/api/admin/reviews") {
    const status = url.searchParams.get("status") ?? "";
    return json(res, 200, { reviews: fetchByStatus.all(status) });
  }
  if (req.method === "POST" && m) {
    const next = m[2] === "approve" ? "approved" : "rejected";
    const note = (await peekNote(req)).slice(0, 200);
    const r = setStatus.run(next, note || null, nowIso(), m[1]);
    return r.changes
      ? json(res, 200, { id: m[1], status: next })
      : json(res, 404, { errors: { form: "not found" } });
  }
  if (req.method === "DELETE" && /^\/api\/admin\/reviews\/[\w-]+$/.test(url.pathname)) {
    const r = deleteById.run(url.pathname.split("/").pop());
    return r.changes
      ? json(res, 200, { deleted: true })
      : json(res, 404, { errors: { form: "not found" } });
  }
  return json(res, 404, { errors: { form: "not found" } });
}

async function peekNote(req) {
  try {
    const { body, tooBig } = await readBody(req);
    if (tooBig) return "";
    const parsed = JSON.parse(body || "{}");
    return typeof parsed.adminNote === "string" ? parsed.adminNote : "";
  } catch {
    return "";
  }
}

if (import.meta.main ?? !process.env.REVIEW_SERVER_AS_MODULE) {
  if (!ADMIN_TOKEN)
    console.warn(
      "[review-server] REVIEW_ADMIN_TOKEN unset — public endpoints work, /admin is disabled.",
    );
  server.listen(PORT, () => console.log(`[review-server] listening on :${PORT}, db=${DB_PATH}`));
}
export { server };
