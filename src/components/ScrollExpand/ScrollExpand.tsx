import { ReactNode, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

export interface ScrollExpandProps {
  /** Content revealed as the block expands on scroll. */
  children: ReactNode;
  /** Collapsed `max-height` (px) before the block enters the viewport. */
  collapsedHeight?: number;
  /** Expanded `max-height` (px) once the reader has scrolled through it. */
  expandedHeight?: number;
  className?: string;
}

/**
 * ScrollExpand — a single scroll-driven editorial expansion.
 *
 * The wrapped block starts clipped and grows taller as the reader scrolls
 * through it, gently revealing its content. One `useScroll`/`useTransform`
 * pair drives `max-height` (no extra ScrollTriggers), keeping it light and
 * predictable.
 *
 * Reduced motion: the server and the first client render always produce the
 * SAME collapsed inline style (branching styles on `useReducedMotion()` at
 * render time caused a hydration mismatch for reduced-motion users — it
 * differs from SSR, which cannot know the preference). After mount, a
 * reduced-motion user's block is simply shown fully expanded, no animation.
 */
export const ScrollExpand = ({
  children,
  collapsedHeight = 0,
  expandedHeight = 600,
  className,
}: ScrollExpandProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [staticOpen, setStaticOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "start 25%"],
  });

  const maxHeight = useTransform(scrollYProgress, [0, 1], [collapsedHeight, expandedHeight]);

  useEffect(() => {
    if (reduce === true) setStaticOpen(true);
  }, [reduce]);

  return (
    <motion.div
      ref={ref}
      data-scroll-expand
      className={cn("overflow-hidden", className)}
      // max-height is scroll-position-derived: hydrating mid-scroll (refresh
      // with restoration) legitimately differs from the SSR snapshot; the
      // value updates on the next frame anyway.
      suppressHydrationWarning
      style={{ maxHeight: staticOpen ? expandedHeight : maxHeight }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollExpand;
