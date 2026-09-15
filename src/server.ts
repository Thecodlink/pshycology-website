import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { SITE_URL } from "./lib/site";
import { services } from "./lib/services";

function handleTechnicalSeoFiles(request: Request): Response | undefined {
  const url = new URL(request.url);
  const origin = SITE_URL || url.origin;

  if (url.pathname === "/sitemap.xml") {
    const locs = ["/", "/privacy", "/disclaimer", ...services.map((s) => `/services/${s.slug}`)];
    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      locs.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join("\n") +
      `\n</urlset>\n`;
    return new Response(xml, {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  if (url.pathname === "/robots.txt") {
    const body =
      `User-agent: Googlebot\nAllow: /\n\n` +
      `User-agent: Bingbot\nAllow: /\n\n` +
      `User-agent: Twitterbot\nAllow: /\n\n` +
      `User-agent: facebookexternalhit\nAllow: /\n\n` +
      `User-agent: *\nAllow: /\n\n` +
      `Sitemap: ${origin}/sitemap.xml\n`;
    return new Response(body, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    });
  }

  return undefined;
}

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

/*
 * Security headers for every origin-served response (SSR + the robots/sitemap
 * routes). Static assets are served by the Cloudflare assets layer before the
 * worker runs, so cache/TLS-level headers (HSTS, asset caching) belong to the
 * hosting configuration, not to application code.
 *
 * Deliberately NOT shipped here: a script `Content-Security-Policy`. The app
 * legitimately needs inline bootstrap (theme script, JSON-LD) and Vite's dev
 * preamble; a strict policy would require nonces at the edge. `frame-ancestors
 * 'self'` covers click-jacking — the highest-value directive — without
 * breaking anything. Revisit CSP with nonces if this moves to an edge we
 * fully control.
 */
function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("x-content-type-options", "nosniff");
  headers.set("referrer-policy", "strict-origin-when-cross-origin");
  headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");
  headers.set("content-security-policy", "frame-ancestors 'self'");
  headers.set("cross-origin-opener-policy", "same-origin");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const technical = handleTechnicalSeoFiles(request);
      if (technical) return withSecurityHeaders(technical);
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return withSecurityHeaders(await normalizeCatastrophicSsrResponse(response));
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
