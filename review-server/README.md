# Sukoon Nest — review service

> **Deployed:** https://sukoonnest-reviews-production.up.railway.app (Railway project `sukoonnest-reviews`, Dockerfile build, `/data` volume for SQLite). GitHub Actions variable `REVIEW_API_URL` points the Pages build at it. Moderation: `<that-url>/admin` — token stored in Railway env `REVIEW_ADMIN_TOKEN` (not in the repo).

The real backend behind the website's "Your experience matters" section.
**Zero npm dependencies**: Node's built-in HTTP server + `node:sqlite`
(persistent, embedded). The GitHub Pages frontend is static and cannot write
data — this service is what makes reviews genuinely persistent.

```
Browser (Pages: sukoonnest.live)                This service (any Node host)
  ReviewsSection ── POST /api/reviews ────────▶  validate → rate-limit → dup/honeypot
      ▲                                          → INSERT status='pending' → 201 {id}
      └── GET /api/reviews (approved only) ◀───   SQLite (WAL) ./review.db
  /admin dashboard ─ Bearer token ───────────▶   pending list → approve / reject / delete
```

## Schema (`reviews`)

| column | notes |
| --- | --- |
| id | `crypto.randomUUID()` (TEXT PK) |
| name | 2–40 chars, server-trimmed |
| rating | INTEGER, CHECK 1–5 |
| text | 10–600 chars, server-trimmed, control chars rejected |
| service | optional free-text ≤60 (validated, not trusted) |
| status | `pending` \| `approved` \| `rejected` — CHECK enforced |
| admin_note | internal only; never returned by the public API |
| created_at / updated_at | server-generated ISO timestamps |

Index: `idx_reviews_status_created (status, created_at DESC)` — serves the
public query (`status='approved' ORDER BY created_at DESC LIMIT/OFFSET`) and
moderation listing.

## API

Public (CORS restricted to `REVIEW_ALLOWED_ORIGINS`):
- `POST /api/reviews` → `201 {id,status:"pending"}` · `400 {errors}` · `409` duplicate (24h) · `413` >8KB · `429` rate limit (default 5/IP/hour)
- `GET /api/reviews?limit=&offset=` → approved only, newest first, limit ≤ 50
- `GET /healthz`

Admin (all requests need `Authorization: Bearer $REVIEW_ADMIN_TOKEN`; constant-time compared; `/admin` is a no-index HTML dashboard using the same server-enforced token):
- `GET /api/admin/reviews?status=pending|approved|rejected|`
- `POST /api/admin/reviews/{id}/approve` · `/reject` (optional body `{adminNote}`)
- `DELETE /api/admin/reviews/{id}`

Pending/rejected reviews are **never** serialized by any public route. Review
text reaches the page only as escaped React text — no HTML rendering path.

## Security / anti-spam
- Server-side validation mirrors the client (client checks are UX only)
- Per-IP in-memory rate bucket + 24h identical-content duplicate check
- Hidden honeypot field (`website`): bots fill it → request is answered
  identically but never stored (no signal to adapt to)
- Payload cap 8 KB; control-character rejection; generic error bodies with
  server-side logging (content never logged)
- No tokens/keys in the frontend: only the public API base URL is baked in

## Run locally

```bash
node review-server/server.mjs                 # needs Node ≥ 22 (node:sqlite)
REVIEW_ADMIN_TOKEN=$(openssl rand -hex 32) node review-server/server.mjs
node --test review-server/server.test.mjs     # 11 real end-to-end tests
```

Frontend against it:
```bash
VITE_REVIEW_API_URL=http://localhost:8787 bun run dev
```
and open http://localhost:8888 (or dev server) → the Reviews section is live.

## Deploy (free tier friendly)

1. Deploy `review-server/` (Dockerfile included) to any Node/Docker host —
   Render/Railway/Fly. Set env: `REVIEW_ADMIN_TOKEN`,
   `REVIEW_ALLOWED_ORIGINS=https://sukoonnest.live`, `REVIEW_TRUST_PROXY=1`
   (proxy hosts), mount a persistent disk at `/data` (Render disk) —
   **SQLite on ephemeral filesystem = reviews lost on restart**. If your host
   has no disk, point `REVIEW_DB_PATH` at a Postgres alternative or choose a
   host with volumes (Render/ Railway/Fly all do).
2. In GitHub: Settings → Secrets and variables → Actions → repository
   variable `REVIEW_API_URL=https://<your-service>.onrender.com`
   (already wired as `VITE_REVIEW_API_URL` in `pages.yml`). Push → Pages
   frontend talks to your backend.
3. Moderate at `https://<service>/admin` (enter the token once per browser
   tab). The token never ships to sukoonnest.live.

## Privacy
Only what's shown publicly is stored: display name, rating, text, optional
service, timestamps. No emails, no clinical data (form warns against it), no
PII. IP is used only in-memory for rate limiting and never persisted.
