import { type FC, type ReactNode } from "react";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteNav } from "@/components/layout/SiteNav";
import { SectionFade } from "@/components/SectionFade/SectionFade";

/*
 * Shared shell for short legal/informational documents (Privacy Policy,
 * Disclaimer): the site's existing header, background and footer, a single
 * readable column, and restrained editorial typography — no new styling
 * system.
 */
export const LegalPage: FC<{ eyebrow: string; title: string; children: ReactNode }> = ({
  eyebrow,
  title,
  children,
}) => (
  <main id="main-content" className="botanical-bg min-h-screen">
    <SiteNav />
    <SectionFade>
      <section className="mx-auto w-full max-w-[46rem] px-5 pb-24 pt-10 lg:pt-14">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-peach">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-foreground sm:text-5xl">{title}</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-ink-soft sm:text-[15px]">
          {children}
        </div>
      </section>
    </SectionFade>
    <SiteFooter />
  </main>
);
