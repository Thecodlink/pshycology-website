import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { type NavLink, navLinks, navLinkClass, navLinkProps } from "@/lib/links";

/*
 * Site-wide header (logo, desktop nav, mobile menu, theme toggle, consultation
 * CTA). Extracted so the service-detail routes can share the exact same header
 * as the home page without duplicating markup.
 */
export const SiteNav = () => {
  const [active, setActive] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Scroll-spy: highlight the nav link for the section currently in view.
  useEffect(() => {
    const els = navLinks
      .map((l) => ({ id: l.id, el: document.getElementById(l.id) }))
      .filter((x) => x.el);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    els.forEach((x) => x.el && observer.observe(x.el));
    return () => observer.disconnect();
  }, []);

  return (
    <header className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
      <Link to="/" className="flex items-center gap-3" aria-label="Sukoon Nest home">
        <img
          src="/images/brand/logo.png"
          alt="Sukoon Nest"
          width={400}
          height={289}
          className="h-11 w-auto"
        />
        <small className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
          Growth · Calm · Clarity
        </small>
      </Link>
      <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
        {navLinks.map((link) => (
          <Link
            key={link.id}
            {...navLinkProps(link.href)}
            className={navLinkClass(active, link.id)}
          >
            {link.label}
          </Link>
        ))}
        <ThemeToggle />
      </nav>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        aria-expanded={mobileOpen}
        aria-controls="mobile-menu"
        onClick={() => setMobileOpen((v) => !v)}
      >
        <Menu />
      </Button>

      <div
        id="mobile-menu"
        className={cn(
          "absolute top-full right-0 z-40 mx-1 my-2 w-64 max-w-[calc(100vw-1rem)]",
          "overflow-hidden rounded-xl border border-border bg-card soft-shadow p-3",
          "transition-[max-height,opacity] duration-200 ease-out",
          mobileOpen
            ? "pointer-events-auto max-h-[70vh] opacity-100"
            : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <nav className="flex flex-col gap-2 text-sm font-medium" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              {...navLinkProps(link.href)}
              className={navLinkClass(active, link.id)}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex justify-center">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export type { NavLink };
