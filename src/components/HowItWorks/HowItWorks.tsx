import { Check } from "lucide-react";
import { useEffect, useRef, useState, type FC } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";
import { howItWorksSteps, type HowItWorksStep } from "@/lib/steps";
import { ScrollReveal } from "@/components/ScrollReveal/ScrollReveal";
import SlideArrowButton from "@/components/buttons/SlideArrowButton";
import { openWhatsApp } from "@/lib/links";
import { emphasisFor, STEP_COUNT } from "./HowItWorks.utils";

/**
 * "How it works" — a scroll-driven vertical editorial timeline.
 *
 * Why the previous version was broken (root causes, for the record):
 *  1. It drove the interaction off a *nested* scroll container
 *     (`h-[100dvh] overflow-y-auto`) with `position: sticky`/`absolute`
 *     descendants. Sticky children cannot escape an `overflow-*` ancestor,
 *     and `useScroll({ container })` + an IntersectionObserver (root = that
 *     same container) drifted out of sync -> indicator showed step N+1 while
 *     the active content still showed step N.
 *  2. The desktop presentation was an `absolute inset-0` overlay that did not
 *     move with the document, so the visible rail/content and the invisible
 *     scroll zones desynced the moment the user scrolled.
 *  3. `AnimatePresence mode="wait"` fully unmounted the old step before mounting
 *     the new one -> a guaranteed empty gap ("content disappears").
 *  4. The desktop step zones (`h-[100dvh]`) had `lg:hidden` content, producing
 *     five viewports of invisible scroll distance ("huge dead area") while the
 *     user had not actually experienced the steps.
 *
 * Rebuilt architecture (robust, single source of truth):
 *  - The browser's DOCUMENT scroll drives the journey. There is NO nested
 *    scroll container and NO `overflow: auto` ancestor of the sticky element.
 *  - `useScroll({ target })` yields a continuous 0->1 progress bound to *this
 *    section* as it travels through the viewport. That drives the progress rail
 *    (a pure MotionValue -> no per-frame React re-renders).
 *          - A single IntersectionObserver (root = viewport / `null`) observes the
 *            step zones' centre line and yields `activeStep`. `activeStep` is the
 *            ONLY input to the indicators, the rail's stepped reduced-motion height,
 *            and the content emphasis -> so indicator <-> content can never disagree.
 *          - ALL step zones remain MOUNTED for the whole journey; only their visual
 *            emphasis (opacity / scale / translateY, driven by `activeStep`) changes.
 *            Nothing is ever unmounted -> content can never disappear.
 *            (No `AnimatePresence` involved at all.)
 *          - Desktop: a sticky side rail (left) + the scrolling step panels (right).
 *          - Mobile: stacked step panels, each carrying its own inline indicator,
 *            plus a narrow mobile progress rail that spans the whole journey.
 *  - `prefers-reduced-motion`: rail becomes stepped, glow/scale/translate are
 *    disabled, content stays fully legible and always visible.
 */

const StepIndicator: FC<{
  step: HowItWorksStep;
  index: number;
  activeStep: number;
  reduced: boolean;
}> = ({ step, index, activeStep, reduced }) => {
  const isComplete = index < activeStep;
  const isActive = index === activeStep;

  return (
    <span
      className="relative z-10 flex h-10 w-10 items-center justify-center lg:h-14 lg:w-14"
      aria-hidden="true"
    >
      <span
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full text-sm font-semibold lg:text-lg",
          "outline-offset-4",
          "transition-[background-color,border-color,color,box-shadow,transform] duration-300",
          isActive && !reduced ? "scale-105 shadow-lg shadow-peach/30 ring-4 ring-peach/25" : "",
          isComplete
            ? "border-2 border-peach bg-peach text-white"
            : isActive
              ? "border-2 border-peach bg-peach text-white"
              : "border border-border bg-background text-muted-foreground",
        )}
      >
        {isComplete ? (
          <Check className="h-5 w-5 stroke-[2.5] lg:h-7 lg:w-7" />
        ) : (
          <span>{step.number}</span>
        )}
      </span>
    </span>
  );
};

/**
 * A single step's editorial block: step image + title + description.
 * The image box is sized by HEIGHT (not a fixed 4/3 canvas) so illustrations
 * of very different shapes (step 1 is a wide banner, step 5 a tall card) all
 * render large and intact: `object-contain` preserves aspect ratio and
 * transparency — no cropping, no distortion, no re-encoding of the artwork.
 * Steps carrying a `cta` (step 1) render the existing WhatsApp action.
 */
const StepContent: FC<{ step: HowItWorksStep }> = ({ step }) => {
  const isLast = step.number === "05";

  return (
    <div className="w-full text-center">
      <div
        className={cn(
          "relative mx-auto mb-6 flex h-[clamp(200px,32dvh,300px)] w-full items-center justify-center sm:mb-8",
          "lg:mb-12",
          isLast ? "lg:h-[min(54dvh,540px)]" : "lg:h-[min(46dvh,470px)]",
        )}
      >
        <img
          src={step.image}
          alt={step.imageAlt}
          decoding="async"
          loading={step.number === "01" ? "eager" : "lazy"}
          className="h-full w-full object-contain object-center"
        />
      </div>
      <h3
        className={cn(
          "mx-auto font-display font-medium text-foreground",
          isLast
            ? "max-w-[46rem] text-3xl leading-tight sm:text-4xl lg:text-5xl"
            : "max-w-[42rem] text-2xl leading-tight sm:text-3xl lg:text-[2.6rem]",
        )}
        id={`step-title-${step.number}`}
      >
        {step.title}
      </h3>
      <p
        className={cn(
          "mx-auto leading-relaxed text-muted-foreground",
          isLast
            ? "mt-4 max-w-[46rem] text-lg sm:text-xl lg:text-2xl"
            : "mt-3 max-w-[36rem] text-base sm:text-lg lg:max-w-[44rem] lg:text-xl",
        )}
      >
        {step.description}
      </p>
      {step.cta ? (
        <div className="mt-8 flex justify-center lg:mt-10">
          <SlideArrowButton
            text={step.cta}
            primaryColor="var(--peach)"
            className="h-13 rounded-full px-5 text-sm sm:px-8 sm:text-base"
            onClick={openWhatsApp}
          />
        </div>
      ) : null}
    </div>
  );
};

/**
 * A full-viewport editorial panel for one step. Always mounted; its emphasis is
 * driven by `activeStep` (via `emphasisFor`) so content can never disappear.
 * On mobile it also carries an inline indicator + "Step N" label.
 */
const StepZone: FC<{
  step: HowItWorksStep;
  index: number;
  activeStep: number;
  reduced: boolean;
}> = ({ step, index, activeStep, reduced }) => {
  const { opacity, scale, y } = emphasisFor(index, activeStep, reduced);

  return (
    <section
      className="relative flex h-full w-full items-center justify-center"
      aria-labelledby={`step-title-${step.number}`}
    >
      {/* Mobile marker: pinned to the left rail (node center = rail x),
          vertically centred like the content so the unit feels composed. */}
      <div className="absolute top-1/2 left-[4px] z-20 flex -translate-y-1/2 flex-col items-center gap-2 lg:hidden">
        <StepIndicator step={step} index={index} activeStep={activeStep} reduced={reduced} />
        <span className="text-xs font-medium tracking-wide text-muted-foreground">
          Step {step.number}
        </span>
      </div>
      <motion.div
        className="mx-auto w-full max-w-[42rem] px-5 pl-16 sm:px-12 lg:max-w-[62rem] lg:px-16"
        initial={false}
        animate={{ opacity, scale, y }}
        transition={{ type: "tween", duration: 0.4, ease: "easeOut" }}
      >
        <StepContent step={step} />
      </motion.div>
    </section>
  );
};

/**
 * Scroll-driven "How it works" timeline.
 *
 * Single source of truth: `activeStep` (from the IntersectionObserver) drives
 * the indicators, the rail and the content emphasis. The rail's continuous fill
 * is a pure MotionValue (`useScroll` -> `useTransform`), so it never desyncs.
 */
const HowItWorks: FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress: railProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const reducedPref = useReducedMotion();
  // SSR determinism: the reduced preference must not change ANY render-time
  // output (indicator classNames, emphasis values) during hydration — a
  // reduced-motion client otherwise hydrates different markup than the server
  // wrote. Defer to post-mount; emphasis then updates through motion's own
  // animation layer, which is hydration-safe.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const reduced = hydrated && reducedPref === true;
  const [activeStep, setActiveStep] = useState(0);

  // Single source of truth: the zone covering the viewport CENTRE line wins.
  // (A `threshold: [0.5]` observer was used before — with five adjacent
  // 100dvh zones their ratios sum to ~1, so around every boundary both
  // hovered at 0.5 and `activeStep` oscillated between N and N+1 during
  // normal scrolling. A zero-height centre band makes the winner unique and
  // deterministic, and only `isIntersecting` entries ever write state.)
  const zoneRefs = useRef<Array<HTMLDivElement | null>>([]);
  useEffect(() => {
    const zones: Array<HTMLDivElement> = [];
    zoneRefs.current.forEach((z) => {
      if (z) zones.push(z);
    });
    if (zones.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const idx = entry.target.getAttribute("data-step-idx");
          if (idx == null) return;
          setActiveStep(Number(idx));
        });
      },
      { root: null, rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );

    zones.forEach((z) => io.observe(z));
    return () => io.disconnect();
  }, []);

  // Rail fill: continuous scroll progress by default, stepped on reduced motion.
  const railScaleY = useTransform(railProgress, [0, 1], [0, 1]);
  const railStyle = reduced ? { scaleY: (activeStep + 1) / STEP_COUNT } : { scaleY: railScaleY };

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative mx-auto w-full max-w-[1280px] scroll-mt-16"
    >
      {/* Visually-hidden live region so screen readers announce the active step. */}
      <div aria-live="polite" className="sr-only">
        Step {activeStep + 1} of {STEP_COUNT}: {howItWorksSteps[activeStep]?.title ?? ""}
      </div>

      <header className="mb-12 text-center">
        <ScrollReveal>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            How it works
          </p>
        </ScrollReveal>
        <ScrollReveal>
          <h2 className="mx-auto mt-3 text-3xl font-medium font-display text-foreground sm:text-4xl">
            A simple six-step path
          </h2>
        </ScrollReveal>
        <ScrollReveal>
          <p className="mx-auto mt-4 max-w-[38rem] text-muted-foreground">
            Start with a free, no-pressure 10-minute call, then meet online and decide what feels
            right. No commitment until you're ready.
          </p>
        </ScrollReveal>
      </header>

      <div className="h-px w-full bg-peach/30" />

      <div className="relative mt-10 lg:mt-12">
        <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
          {/* ---- col1: sticky side rail + step indicators (desktop only) ---- */}
          <nav
            className="sticky top-16 hidden h-[calc(100dvh-4rem)] flex-col items-start pl-8 pt-14 lg:flex"
            aria-label="Steps progress"
          >
            <div className="absolute top-0 bottom-0 left-[59px] w-[2px] bg-border/80" />
            {/* Scroll-driven MotionValue: mid-scroll hydration legitimately
                differs from the SSR snapshot; it updates next frame. */}
            <motion.div
              className="absolute top-0 bottom-0 left-[59px] w-[2px] bg-peach"
              style={{ scaleY: railStyle.scaleY, transformOrigin: "top" }}
              suppressHydrationWarning
            />
            <div className="relative z-10 flex w-14 flex-col items-center gap-10 xl:gap-12">
              {howItWorksSteps.map((step, i) => (
                <StepIndicator
                  key={step.number}
                  step={step}
                  index={i}
                  activeStep={activeStep}
                  reduced={reduced}
                />
              ))}
            </div>
          </nav>

          {/* ---- col2: the five full-height step zones ---- */}
          <div className="relative">
            {/* Mobile progress rail (spans the whole journey). */}
            <div className="lg:hidden absolute top-0 bottom-0 left-[23px] w-[2px] bg-border/80" />
            <motion.div
              className="lg:hidden absolute top-0 bottom-0 left-[23px] w-[2px] bg-peach"
              style={{ scaleY: railStyle.scaleY, transformOrigin: "top" }}
              suppressHydrationWarning
            />

            {howItWorksSteps.map((step, i) => (
              <div
                key={step.number}
                ref={(el) => {
                  zoneRefs.current[i] = el;
                }}
                data-step-idx={i}
                className="relative h-[100dvh] w-full"
              >
                <StepZone step={step} index={i} activeStep={activeStep} reduced={reduced} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-peach/30" />
    </section>
  );
};

export { HowItWorks };
export default HowItWorks;
