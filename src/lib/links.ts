/*
 * Shared navigation + contact constants for Sukoon Nest.
 * Single source of truth so the WhatsApp number, LinkedIn/Instagram handles,
 * email and nav order stay identical across the home page, the service-detail
 * routes and the footer.
 */

import { cn } from "./utils";

export const WHATSAPP_HREF = "https://wa.me/919336566647";
export const LINKEDIN_HREF = "https://www.linkedin.com/in/sukoon-nest-381833379/";
export const INSTAGRAM_HREF = "https://www.instagram.com/sukoonnest2016/";
export const EMAIL_HREF = "mailto:sukoonest2016@gmail.com";

export const openWhatsApp = () => {
  if (typeof window !== "undefined") window.location.href = WHATSAPP_HREF;
};

/**
 * Opens the WhatsApp contact flow, optionally pre-filling a message so the
 * visitor can send their note without re-typing it. Reuses the single
 * configured WhatsApp number (never invents a new one).
 */
export const openWhatsAppWithMessage = (message?: string) => {
  if (typeof window !== "undefined") {
    const url = message ? `${WHATSAPP_HREF}?text=${encodeURIComponent(message)}` : WHATSAPP_HREF;
    window.location.href = url;
  }
};

export type NavLink = { label: string; href: string; id: string };

/* Hash-prefixed (`/#`) so these anchors resolve on every route, not just home. */
export const navLinks: NavLink[] = [
  { label: "Home", href: "/", id: "home" },
  { label: "About", href: "/#about", id: "about" },
  { label: "Services", href: "/#services", id: "services" },
  { label: "Experience", href: "/#experience", id: "experience" },
  { label: "Stories", href: "/#stories", id: "stories" },
  { label: "FAQ", href: "/#faq", id: "faq" },
  { label: "Contact", href: "/#contact", id: "contact" },
];

/* Props for rendering a nav href ("/" or "/#section")
 * as a client-side router link (rendered crawlable <a href> by Link). */
export const navLinkProps = (href: string): { to: "/"; hash?: string } => {
  const hashStart = href.indexOf("#");
  return hashStart === -1
    ? { to: "/" as const }
    : { to: "/" as const, hash: href.slice(hashStart + 1) };
};

export const navLinkClass = (active: string, id: string) =>
  cn(
    "border-b border-transparent pb-1 text-sm font-medium",
    "transition-colors duration-200",
    active === id ? "border-primary text-primary" : "text-muted-foreground hover:text-foreground",
  );

export const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};
