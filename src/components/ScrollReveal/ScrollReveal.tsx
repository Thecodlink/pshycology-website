import { useEffect, useRef, type FC, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { cn } from "@/lib/utils";

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface ScrollRevealProps {
  /** Text (or inline content) to reveal. */
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Animation duration in seconds. */
  duration?: number;
  /** GSAP ease string. */
  ease?: string;
  /** Starting opacity. Kept high (>= 0.85) so content is always readable. */
  baseOpacity?: number;
  /** Starting blur radius in px. */
  blurStrength?: number;
  /** Whether the block starts with a subtle blur. */
  enableBlur?: boolean;
  /** Play once and hold (no reverse on scroll back). */
  once?: boolean;
}

/**
 * ScrollReveal — a gentle block-level reveal for a heading or short line of
 * text.
 *
 * Per the refinement pass, text is animated at the content-block level (never
 * word-by-word): the block starts slightly dimmed and softly blurred, then
 * resolves out as it scrolls into view. Starting opacity is kept high (>= 0.85)
 * so the text is always readable, and the tween is one-shot so content is
 * never left hidden.
 *
 * Respects `prefers-reduced-motion` by applying no animation and rendering the
 * text immediately with no filter.
 *
 * The element structure is identical on the server and client (no word
 * splitting), so there is no hydration mismatch.
 */
export const ScrollReveal: FC<ScrollRevealProps> = ({
  children,
  className,
  style,
  duration = 0.6,
  ease = "power2.out",
  baseOpacity = 0.85,
  blurStrength = 1,
  enableBlur = true,
  once = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReduced()) return;

    const el = containerRef.current;
    if (!el) return;

    gsap.registerPlugin(ScrollTrigger);

    gsap.set(el, {
      opacity: baseOpacity,
      filter: enableBlur ? `blur(${blurStrength}px)` : "none",
    });

    const tween = gsap.to(el, {
      opacity: 1,
      filter: "none",
      duration,
      ease,
      scrollTrigger: {
        trigger: el,
        start: "top 90%",
        once,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [children, duration, ease, baseOpacity, blurStrength, enableBlur, once]);

  return (
    <span ref={containerRef} className={cn("inline", className)} style={style}>
      {children}
    </span>
  );
};
