/*
 * End-to-end tests for the review service against the REAL server and a REAL
 * (temporary) SQLite database over real HTTP. Run:
 *   node --test review-server/
 * or: REVIEW_SERVER_AS_MODULE=1 bun test review-server/server.test.mjs
 */
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const TMP = mkdtempSync(path.join(tmpdir(), "reviewdb-"));
process.env.REVIEW_DB_PATH = path.join(TMP, "t.db");
process.env.REVIEW_ADMIN_TOKEN = "test-token-123";
process.env.REVIEW_ALLOWED_ORIGINS = "https://sukoonnest.live";
process.env.REVIEW_SERVER_AS_MODULE = "1";
process.env.PORT = "0";
// The suite itself must not trip the anti-spam bucket; a dedicated spawned
// server with a tiny budget proves rate limiting below.
process.env.REVIEW_RATE_MAX = "10000";

const { server, validateReview } = await import("./server.mjs");

let base;
before(async () => {
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => {
  server.close();
  rmSync(TMP, { recursive: true, force: true });
});

const post = (p, body, headers = {}) =>
  fetch(base + p, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });

const good = {
  name: "Asha R",
  rating: 5,
  text: "Sessions were thoughtful and genuinely helped me prioritise.",
};

test("valid submission persists as pending", async () => {
  const r = await post("/api/reviews", good);
  assert.equal(r.status, 201);
  const j = await r.json();
  assert.match(j.id, /[\w-]{36}/);
  assert.equal(j.status, "pending");
  const pub = await (await fetch(base + "/api/reviews")).json();
  assert.equal(pub.reviews.length, 0, "pending must NOT be public");
});

test("server-side validation rejects bad payloads", async () => {
  const cases = [
    { ...good, rating: 0 },
    { ...good, rating: 6 },
    { ...good, rating: "5" },
    { ...good, name: "x" },
    { ...good, text: "too short" },
    { ...good, name: "a".repeat(50) },
    { name: "a\u001b[31mb", rating: 4, text: "control characters should be rejected outright." },
    { rating: 4, text: "missing name entirely here" },
  ];
  for (const c of cases) {
    const r = await post("/api/reviews", c);
    assert.equal(r.status, 400, JSON.stringify(c));
  }
});

test("oversized payload is refused", async () => {
  const r = await post("/api/reviews", { ...good, text: "z".repeat(9000) });
  assert.ok([400, 413].includes(r.status));
});

test("duplicate review within window is 409", async () => {
  const uniq = {
    ...good,
    name: "Dup Tester",
    text: "A distinctive review body used only for the duplicate-submission check.",
  };
  assert.equal((await post("/api/reviews", uniq)).status, 201);
  assert.equal((await post("/api/reviews", uniq)).status, 409);
});

test("moderation requires the token; approve makes it public; reject hides it", async () => {
  const pending = await fetch(base + "/api/admin/reviews?status=pending");
  assert.equal(pending.status, 401);

  const id = (await (await post("/api/reviews", good)).json()).id ?? null;
  // the duplicate above returned 409; make a fresh unique one
  const fresh = await post("/api/reviews", {
    ...good,
    text: "A completely different set of words about the practice.",
  });
  const fid = (await fresh.json()).id;

  const ok = { authorization: "Bearer test-token-123" };
  assert.equal(
    (await fetch(base + "/api/admin/reviews?status=pending", { headers: ok })).status,
    200,
  );
  assert.equal((await post(`/api/admin/reviews/${fid}/approve`, {}, ok)).status, 200);
  const pub = await (await fetch(base + "/api/reviews")).json();
  assert.equal(pub.reviews.length, 1);
  assert.equal(pub.reviews[0].id, fid);
  assert.equal(pub.reviews[0].status, undefined, "admin-only fields never leak publicly");

  const rej = await post("/api/reviews", {
    ...good,
    text: "Yet another distinct review body for rejection testing.",
  });
  const rid = (await rej.json()).id;
  assert.equal((await post(`/api/admin/reviews/${rid}/reject`, {}, ok)).status, 200);
  const pub2 = await (await fetch(base + "/api/reviews")).json();
  assert.equal(pub2.reviews.length, 1, "rejected reviews must not appear");
  assert.ok(id === null);
});

test("wrong token cannot mutate", async () => {
  const pub = await (await fetch(base + "/api/reviews")).json();
  const fid = pub.reviews[0].id;
  const r = await post(`/api/admin/reviews/${fid}/reject`, {}, { authorization: "Bearer nope" });
  assert.equal(r.status, 401);
});

test("delete works and is authorized", async () => {
  const fid = (await (await fetch(base + "/api/reviews")).json()).reviews[0].id;
  const ok = { authorization: "Bearer test-token-123" };
  const del = await fetch(base + `/api/admin/reviews/${fid}`, { method: "DELETE", headers: ok });
  assert.equal(del.status, 200);
  assert.equal((await (await fetch(base + "/api/reviews")).json()).reviews.length, 0);
});

test("CORS: allowed origin answered, foreign origin gets none", async () => {
  const a = await fetch(base + "/api/reviews", { headers: { origin: "https://sukoonnest.live" } });
  assert.equal(a.headers.get("access-control-allow-origin"), "https://sukoonnest.live");
  const b = await fetch(base + "/api/reviews", { headers: { origin: "https://evil.example" } });
  assert.equal(b.headers.get("access-control-allow-origin"), null);
});

test("honeypot submissions are accepted but never stored", async () => {
  const r = await post("/api/reviews", {
    ...good,
    name: "BotMaster",
    text: "Visit my miracle supplement site totally legitimate review text.",
    website: "http://spam.example",
  });
  assert.equal(r.status, 201);
  const pub = await (await fetch(base + "/api/reviews")).json();
  assert.equal(pub.reviews.length, 0);
  const admin = await fetch(base + "/api/admin/reviews?status=pending", {
    headers: { authorization: "Bearer test-token-123" },
  });
  const { reviews } = await admin.json();
  assert.ok(!reviews.some((x) => x.name === "BotMaster"), "honeypot must not persist");
});

test("rate limiting engages after the window budget (isolated server)", async () => {
  const { spawn } = await import("node:child_process");
  const port = 18923;
  const child = spawn(process.execPath, ["server.mjs"], {
    cwd: new URL(".", import.meta.url).pathname,
    env: {
      ...process.env,
      PORT: String(port),
      REVIEW_RATE_MAX: "2",
      REVIEW_DB_PATH: path.join(TMP, "rate.db"),
    },
    stdio: "ignore",
  });
  try {
    const b = `http://127.0.0.1:${port}`;
    for (
      let i = 0;
      i < 25 &&
      !(await fetch(b + "/healthz")
        .then((r) => r.ok)
        .catch(() => false));
      i++
    )
      await new Promise((r) => setTimeout(r, 200));
    const codes = [];
    for (let i = 0; i < 5; i++) {
      const r = await fetch(b + "/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...good,
          text: `Rate probe number ${i} with distinct review content here.`,
        }),
      });
      codes.push(r.status);
    }
    assert.ok(codes.includes(429), "expected 429 after repeated submissions: " + codes.join(","));
  } finally {
    child.kill();
  }
});

test("validateReview unit: trims and shape", () => {
  const { errors, value } = validateReview({
    name: "  Rob  ",
    rating: 4,
    text: "  Some reasonably long review text.  ",
    service: "",
  });
  assert.deepEqual(errors, {});
  assert.equal(value.name, "Rob");
  assert.equal(value.text, "Some reasonably long review text.");
  assert.equal(value.service, null);
});
