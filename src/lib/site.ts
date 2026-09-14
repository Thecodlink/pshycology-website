/*
 * Central brand + site constants for metadata, JSON-LD and technical SEO.
 *
 * SITE_URL is intentionally blank until the production domain is connected.
 * Fill it in (e.g. "https://sukoonnest.example") and every absolute URL —
 * canonical, og:url, sitemap and JSON-LD — activates automatically. Until
 * then, root-relative asset URLs are emitted (crawlers resolve them against
 * the page URL) and canonical/og:url are omitted instead of pointing at a
 * guessed domain.
 */

import { EMAIL_HREF, LINKEDIN_HREF, WHATSAPP_HREF } from "./links";

export const SITE_URL = "";

export const SITE_NAME = "Sukoon Nest";

export const SITE_TITLE = "Sukoon Nest | Psychology & Career Counselling";

export const SITE_DESCRIPTION =
  "Compassionate psychology support and practical career guidance, available online and in person.";

export const OG_IMAGE = "/images/og/og-image.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 628;

export const absoluteUrl = (path = "/"): string | undefined =>
  SITE_URL ? `${SITE_URL}${path === "/" ? "" : path}` : undefined;

/**
 * Origin used for the XML sitemap. Prefers the configured SITE_URL and falls
 * back to the origin of the live request, so the sitemap is correct the moment
 * the site is deployed even before SITE_URL is filled in.
 */
export const sitemapOrigin = (request: Request): string => SITE_URL || new URL(request.url).origin;

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  ...(absoluteUrl() ? { url: absoluteUrl() } : {}),
  ...(absoluteUrl("/images/brand/logo.png") ? { logo: absoluteUrl("/images/brand/logo.png") } : {}),
  email: EMAIL_HREF.replace("mailto:", ""),
  telephone: WHATSAPP_HREF.replace("https://wa.me/", "+"),
  sameAs: [LINKEDIN_HREF],
});
