import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { ComponentPropsWithRef } from "react";

import { cn } from "@/lib/utils";

/*
 * Magic UI Bento Grid — adapted for Sukoon Nest's warm, editorial aesthetic.
 *
 * Editorial image-led cards: each card is a whole-card link whose illustration
 * is rendered as a full-bleed background (object-cover, centered) behind a
 * deep charcoal/dark-olive scrim. A number, title, short "What we do" label,
 * description and a "Learn more" call-to-action are layered on top as readable
 * light text. No separate image placeholders — the image IS the card surface.
 *
 * A couple of feature cards span two columns on large screens (colSpan="lg:col-span-2")
 * to break the rhythm and give the grid breathing room.
 */

export type BentoCardColSpan = "md:col-span-2" | "lg:col-span-2" | "lg:col-span-3";

export type BentoGridProps = ComponentPropsWithRef<"div">;

export const BentoGrid = ({ className, ...props }: BentoGridProps) => (
  <div
    className={cn(
      "mx-auto grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
      /* Fixed-height rows that match the image cards. Cards are a consistent
         280–320px tall so the grid reads as a cohesive editorial wall with no
         awkward vertical gaps or text-driven height swings. */
      "auto-rows-[minmax(280px,_auto)]",
      className,
    )}
    {...props}
  />
);

export interface BentoCardProps {
  number: string;
  name: string;
  description: string;
  /** Decorative full-bleed card background image. */
  image?: string;
  label?: string;
  cta?: string;
  /** Typed internal route — rendered as a real crawlable `<a href>` by the router. */
  to: "/services/$slug";
  params: { slug: string };
  colSpan?: BentoCardColSpan;
  className?: string;
  "aria-label"?: string;
}

export const BentoCard = ({
  number,
  name,
  description,
  image,
  label = "What we do",
  cta = "Learn more",
  to,
  params,
  colSpan,
  className,
  ...props
}: BentoCardProps) => (
  <Link
    to={to}
    params={params}
    className={cn(
      /* Whole card is one accessible link — the card IS the interaction. */
      "group bento-card relative flex w-full flex-col overflow-hidden rounded-[1.5rem] border border-border",
      /* Consistent editorial height (within the 280–360px target). Tall enough
         for the longest card (e.g. "Workshops, Corporate & Campus Programs")
         to fit its title + description + CTA without the CTA being clipped by
         overflow-hidden. */
      "h-[310px] sm:h-[330px] lg:h-[350px]",
      "motion-safe:transition-[transform,box-shadow,border-color] duration-300 ease-out",
      "motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:shadow-xl",
      "motion-safe:group-hover:border-primary/40",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
      colSpan,
      className,
    )}
    {...props}
  >
    {/* Layer 0 — full-bleed card background image (decorative). */}
    {image ? (
      <img
        src={image}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full object-cover object-center",
          "motion-safe:group-hover:scale-[1.06] motion-safe:transition-transform duration-500 ease-out",
        )}
      />
    ) : null}

    {/* Layer 1 — deep charcoal / dark-olive editorial scrim (brand tint + readability). */}
    <div
      className="absolute inset-0"
      style={{
        /* Slightly stronger editorial scrim (~+10–12% vs. the previous tint)
           using the existing Sukoon Nest dark-sage palette — a soft brand tint,
           not a black veil. Top: ~55% opaque so the image (~45%) stays clearly
           recognizable; bottom: ~80% opaque so the light text reads with strong
           contrast without hiding the image entirely. */
        backgroundImage:
          "linear-gradient(to top, color-mix(in oklab, var(--dark-sage) 80%, transparent) 0%, color-mix(in oklab, var(--dark-sage) 68%, transparent) 55%, color-mix(in oklab, var(--dark-sage) 55%, transparent) 100%)",
      }}
    />

    {/* Layer 2 — content stacked over the image + scrim. */}
    <div className="relative z-10 flex h-full w-full flex-col p-5 sm:p-6 lg:p-7">
      <span
        className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-peach"
        aria-hidden="true"
      >
        {number}
      </span>

      {/* Bottom-aligned editorial stack: title, label, description, CTA. */}
      <div className="mt-auto space-y-3">
        <h3 className="text-2xl font-medium leading-snug text-primary-foreground font-display sm:text-3xl">
          {name}
        </h3>
        <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">
          {label}
        </span>
        <p className="text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
          {description}
        </p>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-foreground">
          {cta}
          <ArrowRight
            size={16}
            aria-hidden="true"
            className="text-peach motion-safe:group-hover:translate-x-1 motion-safe:transition-transform duration-300 ease-out"
          />
        </span>
      </div>
    </div>
  </Link>
);
