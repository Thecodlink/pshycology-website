# Sukoon Nest

A calm, premium website for **Sukoon Nest** — psychology support, counselling and career guidance, available online and in person.

Designed and built by [@Thecodlink](https://github.com/Thecodlink).

## Highlights

- Editorial single-page experience with a six-step "How it works" scroll journey
- "In action" evidence wall — real research publications, speaking and conference work
- Multilingual greeting intro and soft route transitions (custom Sukoon Nest motion system)
- Testimonials marquee, FAQ, service detail pages, lightbox gallery
- SEO metadata, Open Graph images, structured data, dynamic `robots.txt` + `sitemap.xml`
- Accessible (keyboard, screen-reader, reduced-motion) and fully responsive

## Stack

TanStack Start · React 19 · Vite · TypeScript · Tailwind CSS v4 · GSAP · Motion (Framer)

## Development

Requires [Bun](https://bun.sh).

```sh
bun install
bun run dev        # http://localhost:8080
bun run build      # production build (.output)
bun run test       # vitest
bun run lint       # eslint
bun run format     # prettier
```

## Structure

```text
src/routes        pages (file-based routing: /, /services/$slug)
src/components    sections, gallery, motion system, UI primitives
src/lib           content data (services, steps, gallery), theme, SEO constants
public/           images, icons, manifest, favicon
scripts/          dev tooling (image optimizer)
```

## Deployment

The build outputs a Cloudflare Workers-compatible Nitro bundle (`.output/`), deployed via the connected hosting. Set `SITE_URL` in `src/lib/site.ts` once the custom domain is live — canonicals, Open Graph URLs and structured data activate from that single constant.

© Sukoon Nest. All rights reserved.
