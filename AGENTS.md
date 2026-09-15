> [!IMPORTANT]
> This repository's `main` branch is published to GitHub. Avoid rewriting
> published history (force-pushing, or rebasing/amending/squashing commits that
> are already pushed) — it breaks the shared branch for everyone.

- Keep `main` in a working state: `bun run lint`, `bun x tsc --noEmit`, and
  `bun run build` must pass before pushing.
- Content data lives in `src/lib/` (`services.ts`, `steps.ts`, `inAction.ts`,
  `greetings.ts`, `site.ts`) — update there, never inline in components.
- All public-facing claims (titles, credentials, activity) must reflect the
  real assets already in the repo; never invent them.
- Image assets: never re-encode or crop source files blindly; use
  `bun run optimize:images` (content-aware, alpha-safe) and update references
  in the same change.
