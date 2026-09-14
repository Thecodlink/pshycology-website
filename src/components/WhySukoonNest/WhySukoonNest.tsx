import { AnimatedContent } from "@/components/AnimatedContent/AnimatedContent";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { cn } from "@/lib/utils";

/*
 * "Why Sukoon Nest" — an editorial, text-illustration grid that explains what
 * makes the practice different. Six feature blocks on a 3 × 2 grid (2 × 3 on
 * tablet, 1 × 6 on mobile).
 *
 * Design rules followed:
 *  - No card boxes / borders / heavy shadows — whitespace + illustration +
 *    typography carry the separation (open editorial composition).
 *  - Illustrations are the feature-titled JPEGs from public/images/features/,
 *    copied into the project from the practitioner's "icon pkg" (never
 *    referenced from /Users/.../Downloads). Each maps to a feature by name.
 *  - Subtle hover (illustration lifts ~4px + 1.02 scale, title fades slightly);
 *    fully static when reduced motion is enabled.
 *  - Semantic, centered, controlled text widths (descriptions <= ~340px).
 */

type WhyFeature = {
  id: string;
  title: string;
  description: string;
  /** Illustration: existing transparent PNG, reused as-is. */
  image: string;
  /** Meaningful, concept-level alt text (illustration is decorative of a theme,
   *  not an actual client). */
  imageAlt: string;
};

const WHY_FEATURES: WhyFeature[] = [
  {
    id: "01",
    // Verified: consistent with the existing Final CTA ("Book a free 10 min call now").
    title: "Free 10-Minute Consultation Call",
    description:
      "Before you decide, understand the approach, ask questions and see if this feels like the right space for you.",
    image: "/images/features/consultation-call.png",
    imageAlt:
      "Illustration representing an initial supportive conversation between a practitioner and a visitor",
  },
  {
    id: "02",
    // TODO-REVIEW: "No Forced Packages" is a practice value, not a claim found
    // verbatim in existing project content. Confirm with the practitioner.
    title: "No Forced Packages",
    description:
      "Choose the support that feels right for you, without pressure to commit long-term.",
    image: "/images/features/no-forced-packages.png",
    imageAlt:
      "Illustration representing a choice of flexible, individually tailored support options",
  },
  {
    id: "03",
    title: "Healing at Your Own Pace",
    description:
      "Support meets you where you are, with space to reflect, understand and move forward at a pace that feels manageable.",
    image: "/images/features/healing-at-your-own-pace.png",
    imageAlt: "Illustration representing gradual personal growth and reflection",
  },
  {
    id: "04",
    title: "Confidential & Non-Judgmental Space",
    description:
      "A space to talk openly, feel heard and explore what matters to you without judgment.",
    image: "/images/features/confidential-space.png",
    imageAlt: "Illustration representing a safe, private, confidential dialogue",
  },
  {
    id: "05",
    // TODO-REVIEW: "Transparent & Accessible Pricing" is not present verbatim in
    // existing project content, and no prices are shown here. Confirm the
    // fee-disclosure wording with the practitioner before publish.
    title: "Transparent & Accessible Pricing",
    description: "Clear session fees and options, so you know what to expect before booking.",
    image: "/images/features/transparent-pricing.png",
    imageAlt: "Illustration representing clear, upfront information about support options",
  },
  {
    id: "06",
    // Per spec: use exactly "Hindi & English" — no French or other languages.
    title: "Hindi & English Support",
    description:
      "Sessions and communication are available in Hindi and English, so you can choose the language you feel most comfortable in.",
    image: "/images/features/hindi-english.png",
    imageAlt: "Illustration representing a conversation offered in Hindi and English",
  },
];

export const WhySukoonNest = ({ className }: { className?: string }) => (
  <section
    id="why-sukoon-nest"
    aria-labelledby="why-sukoon-nest-title"
    className={cn("mx-auto max-w-7xl px-5 lg:px-8 py-14 sm:py-18 lg:py-24", className)}
  >
    {/* Header — centered, controlled width, editorial rhythm. */}
    <div className="mx-auto max-w-2xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-peach">
        Why Sukoon Nest
      </p>
      <h2
        id="why-sukoon-nest-title"
        className="text-4xl leading-tight font-display text-foreground sm:text-5xl"
      >
        <ScrollReveal duration={0.8}>
          What makes Sukoon Nest <br />
          different?
        </ScrollReveal>
      </h2>
      <p className="mt-5 max-w-xl text-base text-muted-foreground">
        Client-centered, compassionate support for your well-being.
      </p>
    </div>

    {/* Feature grid — 3 / 2 / 1 columns, content-driven rows, no card boxes. */}
    <div className="mt-16 grid w-full grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
      {WHY_FEATURES.map((feature, i) => (
        <AnimatedContent
          key={feature.id}
          delay={i * 85}
          distance={16}
          duration={0.55}
          scale={1}
          once
          className="w-full"
        >
          <div
            className={cn(
              "flex w-full max-w-[360px] flex-col items-center text-center mx-auto",
              /* subtle group hover; disabled under reduced motion via motion-safe */
              "group",
            )}
          >
            <img
              src={feature.image}
              alt={feature.imageAlt}
              loading="lazy"
              decoding="async"
              className={cn(
                "h-40 w-auto max-w-[210px] object-contain",
                "sm:h-44 sm:max-w-[220px]",
                "lg:h-52",
                "transition-transform duration-300 ease-out",
                "motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:[scale:1.02]",
              )}
            />
            <h3
              className={cn(
                "mt-6 text-2xl font-medium leading-snug font-display text-foreground",
                "transition-colors duration-300",
                "motion-safe:group-hover:text-foreground/85",
              )}
            >
              {feature.title}
            </h3>
            <p className="mt-3 max-w-[340px] text-base leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </div>
        </AnimatedContent>
      ))}
    </div>
  </section>
);
