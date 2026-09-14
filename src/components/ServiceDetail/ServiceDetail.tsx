import type { FC } from "react";
import { motion } from "motion/react";

import { AnimatedContent } from "@/components/AnimatedContent/AnimatedContent";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import SlideArrowButton from "@/components/buttons/SlideArrowButton";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { openWhatsApp } from "@/lib/links";

import type { Service } from "@/lib/services";

export interface ServiceDetailProps {
  service: Service;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/**
 * Reusable, editorial two-column service-detail template.
 *
 *  Desktop: left column (≈46%) holds the editorial copy — number, clamp()
 *  headline, short description — while the right column (≈54%) holds a large,
 *  dominant service image. On scroll the image rests in its own 4:3 frame and
 *  lifts subtly on hover.
 *
 *  Mobile: the image slides between the description and "What we work on", preserving
 *  a natural top-to-bottom editorial flow.
 */
export const ServiceDetail: FC<ServiceDetailProps> = ({ service }) => {
  return (
    <section
      id={`service-${service.slug}`}
      aria-labelledby="service-detail-title"
      className={cn("relative mx-auto max-w-[1320px] px-5 pt-6 pb-20", "lg:px-8 lg:pt-8 lg:pb-24")}
    >
      {/*
        Faint editorial number placed behind the hero for subtle depth.
        `aria-hidden` keeps it out of the accessibility tree.
      */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 z-0 flex items-center justify-center",
          "font-display font-bold text-[10rem] text-foreground/4 select-none",
          "sm:text-[12rem] lg:text-[13rem]",
        )}
      >
        {service.number}
      </div>

      {/* Back to the services index — subtle, above the hero. */}
      <Link
        to="/"
        hash="services"
        className={cn(
          "relative z-10 mb-6 inline-flex items-center gap-1.5 text-sm",
          "text-muted-foreground underline-offset-4 hover:text-foreground hover:underline",
        )}
      >
        ← All services
      </Link>

      <div
        className={cn(
          "relative z-10 grid grid-cols-1 gap-12",
          "lg:grid-cols-[46%_54%] lg:gap-16 lg:items-start",
        )}
      >
        {/* LEFT TOP — peach numbered eyebrow, clamp headline, short description. */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-peach">
            {service.number}
          </p>

          <h1
            id="service-detail-title"
            className={cn(
              "mt-3 font-display font-semibold leading-[1] text-foreground tracking-tight",
              "text-[clamp(2.25rem,6vw,4.5rem)] max-w-[32rem]",
            )}
          >
            <ScrollReveal duration={0.7}>{service.title}</ScrollReveal>
          </h1>

          <p className="mt-4 max-w-[35rem] text-base leading-relaxed text-muted-foreground sm:text-lg">
            {service.description}
          </p>
        </div>

        {/*
          RIGHT — large editorial image. `lg:col-start-2` places it in the right
          column on desktop (top-aligned with the headline); on mobile it
          naturally drops between the description and "What we work on".
        */}
        <div className="lg:col-start-2">
          <div
            className={cn(
              "relative w-full overflow-hidden rounded-[28px]",
              "border border-border bg-card soft-shadow",
            )}
          >
            <motion.img
              src={service.image}
              alt={service.imageAlt}
              loading="eager"
              decoding="async"
              whileHover={{ scale: 1.03, y: -3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn("block h-auto w-full object-cover object-center", "aspect-[4/3]")}
            />
          </div>
        </div>

        {/* LEFT BOTTOM — "What we work on" editorial list + existing CTA. */}
        <div className="lg:col-span-2">
          <div className="mt-8">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-foreground/70">
              {service.label || "What we work on"}
            </p>

            <ul className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
              {service.topics.map((topic, j) => (
                <AnimatedContent
                  key={topic}
                  once
                  distance={10}
                  scale={0.99}
                  delay={j * 25}
                  className={cn("group relative flex items-baseline gap-2.5 pb-1.5")}
                >
                  <span
                    className={cn(
                      "shrink-0 text-[10px] font-medium text-muted-foreground",
                      "transition-colors duration-300 group-hover:text-peach",
                    )}
                  >
                    {pad2(j + 1)}
                  </span>
                  <span
                    className={cn(
                      "text-sm text-foreground",
                      "transition-transform duration-300 group-hover:translate-x-1",
                    )}
                  >
                    {topic}
                  </span>
                  <span
                    className={cn(
                      "absolute inset-x-0 bottom-0 h-px bg-border",
                      "transition-all duration-300",
                      "group-hover:left-1 group-hover:right-1 group-hover:opacity-60",
                    )}
                  />
                </AnimatedContent>
              ))}
            </ul>
          </div>

          {/* CTA — preserves the existing booking behaviour (WhatsApp). */}
          <div className="mt-10">
            <SlideArrowButton
              text="Book a consultation"
              primaryColor="var(--peach)"
              className="h-13 rounded-full px-8 text-base"
              onClick={openWhatsApp}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
