import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import SlideArrowButton from "@/components/buttons/SlideArrowButton";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import { SectionFade } from "@/components/SectionFade/SectionFade";
import { type HeardYouStory, heardYouStories } from "@/lib/heardYouStories";
import { cn } from "@/lib/utils";
import { openWhatsApp } from "@/lib/links";

/*
 * "We Heard You" — an editorial storytelling strip. Each step pairs a transparent
 * character illustration with a relatable situation people may recognise.
 *
 * These are NOT client testimonials: no names, dates, ratings or claimed quotes.
 * They are empathetic observations framed as "we heard you might be carrying this."
 */
export function WeHeardYou() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const n = heardYouStories.length;

  // Slow autoplay — pauses on hover/focus, fully disabled under reduced motion.
  useEffect(() => {
    if (reduced || paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % n), 7000);
    return () => clearInterval(id);
  }, [paused, reduced, n]);

  const story: HeardYouStory = heardYouStories[active] ?? heardYouStories[0]!;
  const transition = { duration: reduced ? 0 : 0.4, ease: "easeOut" } as const;
  // Start visibly (opacity 1) so the section reads in SSR / no-JS; only the
  // cross-fade on change supplies motion.
  const fadeUp = {
    initial: { opacity: 1, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
  };

  const onDotKey = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setActive((a) => (a + 1) % n);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => (a - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActive(n - 1);
    }
  };

  return (
    <SectionFade>
      <section id="we-heard-you" className="mx-auto max-w-7xl px-5 lg:px-8 py-14 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-4xl lg:max-w-5xl">
          {/* Header — centred, controlled width */}
          <div className="text-center">
            <h2 className="font-display text-4xl font-normal leading-tight text-foreground sm:text-5xl">
              <ScrollReveal duration={1}>WE HEARD YOU</ScrollReveal>
            </h2>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
              You don’t always need to have everything figured out before you ask for support.
            </p>
          </div>

          {/* Main story — deliberate two-column editorial grid */}
          <div className="mt-12 grid items-center gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-16">
            {/* LEFT: illustration */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xs">
                <div
                  className="absolute -z-10 m-auto h-56 w-56 rounded-full bg-peach/15 blur-2xl inset-0"
                  aria-hidden="true"
                />
                <AnimatePresence mode="wait">
                  <motion.img
                    key={story.id}
                    src={story.image}
                    alt={`Illustrated person representing ${story.category} support`}
                    loading="lazy"
                    decoding="async"
                    className="h-[220px] w-full object-contain sm:h-[260px] lg:h-[300px]"
                    initial={{ opacity: 1, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={transition}
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT: text — one clean left edge */}
            <div className="flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={story.id}
                  initial={fadeUp.initial}
                  animate={fadeUp.animate}
                  exit={fadeUp.exit}
                  transition={transition}
                  className="space-y-4"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
                    {story.category}
                  </span>
                  <h3 className="font-display text-3xl leading-tight text-foreground sm:text-4xl">
                    {story.title}
                  </h3>
                  <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                    {story.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation dots — centred under the story */}
          <nav
            className="mt-10 flex justify-center gap-2.5"
            role="tablist"
            aria-label="Illustrated story navigation"
          >
            {heardYouStories.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={`Story ${i + 1} of ${n}: ${s.category}`}
                onClick={() => setActive(i)}
                onKeyDown={onDotKey(i)}
                className={cn(
                  "h-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                  i === active ? "w-6 bg-peach" : "w-2 bg-border hover:bg-peach/60",
                )}
              />
            ))}
          </nav>

          {/* Section-level action — single, centred, existing style */}
          <div className="mt-8 flex justify-center">
            <SlideArrowButton
              text="Explore support options"
              primaryColor="var(--peach)"
              className="h-13 rounded-full px-8 text-base"
              onClick={openWhatsApp}
            />
          </div>
        </div>
      </section>
    </SectionFade>
  );
}
