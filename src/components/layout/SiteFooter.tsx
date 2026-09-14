import { Instagram, Linkedin, Mail } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { EMAIL_HREF, INSTAGRAM_HREF, LINKEDIN_HREF, navLinks, navLinkProps } from "@/lib/links";

/*
 * Site-wide footer (logo, footer nav, socials, copyright). Shared with the
 * service-detail routes so every page carries the same footer as the home page.
 */
export const SiteFooter = () => (
  <footer className="border-t border-border bg-card/70">
    <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-9 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center gap-3">
        <img
          src="/images/brand/logo.png"
          alt="Sukoon Nest"
          width={400}
          height={289}
          className="h-10 w-auto"
        />
        <small className="hidden text-[9px] uppercase tracking-[0.15em] text-muted-foreground sm:block">
          A safe space for growth &amp; calm
        </small>
      </div>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            {...navLinkProps(link.href)}
            className="text-muted-foreground hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex gap-1 text-primary [&>a]:grid [&>a]:size-11 [&>a]:place-items-center [&>a]:rounded-full [&>a]:transition-colors hover:[&>a]:bg-secondary">
        <a
          href={LINKEDIN_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Sukoon Nest on LinkedIn"
        >
          <Linkedin size={19} />
        </a>
        <a
          href={INSTAGRAM_HREF}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Sukoon Nest on Instagram"
        >
          <Instagram size={19} />
        </a>
        <a href={EMAIL_HREF} aria-label="Email Sukoon Nest">
          <Mail size={19} />
        </a>
      </div>
    </div>
    <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border px-5 py-5 text-[11px] text-muted-foreground lg:px-8">
      <span>© 2026 Sukoon Nest. All rights reserved.</span>
      <span>Privacy Policy &nbsp; | &nbsp; Disclaimer</span>
    </div>
  </footer>
);
