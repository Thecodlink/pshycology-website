import { useEffect, useRef, type FC, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface AnimatedContentProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Travel distance in px before settling. */
  distance?: number;
  /** Axis of travel. */
  direction?: "vertical" | "horizontal";
  /** Animate from the opposite direction. */
  reverse?: boolean;
  /** Tween duration in seconds. */
  duration?: number;
  /** GSAP ease string. */
  ease?: string;
  /** Starting opacity. */
  initialOpacity?: number;
  /** Fade to full opacity on animate. */
  animateOpacity?: boolean;
  /** Starting scale. */
  scale?: number;
  /** IntersectionObserver-style threshold (0–1). */
  threshold?: number;
  /** Delay before the tween begins (ms). */
  delay?: number;
  /** Play once and hold. */
  once?: boolean;
  /**
   * Give the entrance a real EXIT: when the block scrolls out through the
   * top of the viewport the SAME tween is reverse-played (pop-down +
   * fade-out), and it plays again if the block returns. This keeps a single
   * owner (this one tween + one ScrollTrigger) for enter and exit — a second
   * parallel system animating the same properties is what previously caused
   * flicker. Requires the block to start below the fold on load.
   */
  exit?: boolean;
}

/**
 * AnimatedContent — a subtle entrance for a single content block.
 *
 * The block starts slightly offset (and dim/scaled) and settles into place as it
 * scrolls into view. Uses one GSAP ScrollTrigger per instance and tears down
 * only its own trigger on unmount (never touching other sections).
 */
export const AnimatedContent: FC<AnimatedContentProps> = ({
  children,
  className,
  style,
  distance = 24,
  direction = "vertical",
  reverse = false,
  duration = 0.55,
  ease = "power3.out",
  /** Starting opacity — kept high so content is always readable (>= 0.9). */
  initialOpacity = 0.9,
  animateOpacity = true,
  scale = 0.99,
  threshold = 0.12,
  delay = 0,
  once = true,
  exit = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReduced()) return;

    const el = ref.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    const axis = direction === "horizontal" ? "x" : "y";
    const sign = reverse ? -1 : 1;

    const vars = {
      opacity: initialOpacity,
      scale,
      [axis]: sign * distance,
      transformOrigin: "center center",
    };

    gsap.set(el, vars);

    // NOTE: never pass explicit `undefined` keys into ScrollTrigger vars —
    // they clobber gsap's DEFAULTS during the merge (e.g. toggleActions),
    // and ScrollTrigger then crashes on `vars.toggleActions.split(" ")`.
    const trigger: {
      trigger: HTMLDivElement;
      start: string;
      end?: string;
      toggleActions?: string;
      once?: boolean;
    } = {
      trigger: el,
      start: `top ${100 - threshold * 100}%`,
    };
    if (exit) {
      // One tween owns both directions; the trigger must stay alive and drive
      // it (toggleActions) instead of self-destructing after the first enter.
      trigger.end = "top 10%";
      trigger.toggleActions = "play none play reverse";
      trigger.once = false;
    } else {
      trigger.once = once;
    }

    const tween = gsap.to(el, {
      opacity: animateOpacity ? 1 : initialOpacity,
      scale: 1,
      [axis]: 0,
      duration,
      ease,
      delay: delay / 1000,
      scrollTrigger: trigger,
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [
    children,
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    threshold,
    delay,
    once,
    exit,
  ]);

  return (
    <div ref={ref} className={cn("w-full", className)} style={style}>
      {children}
    </div>
  );
};
