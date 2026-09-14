import { motion } from "motion/react";
import type { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface SectionFadeProps {
  children: ReactNode;
  className?: string;
}

/**
 * SectionFade — a single, one-shot entrance for major editorial sections.
 *
 * Deterministic ownership: this is the ONLY system animating a section's
 * outer wrapper, and it plays exactly once (`once: true`). A `once: false`
 * whileInView was previously used here: framer-motion re-ran the in/out
 * transition every time the viewport flip-flopped, which surfaced as
 * flicker during fast scrolling, and `amount: 0.4` could never fire for
 * sections taller than 2.5 viewports (How It Works), leaving them stuck in
 * the pre-reveal state fighting that section's own scroll controller.
 *
 * Reduced motion: renders the SAME tree for server, client, and
 * reduced-motion users — the global <MotionConfig reducedMotion="user">
 * disables the transform for motion-sensitive users, and opacity-only fades
 * remain (framer's own reduced-motion policy). The previous explicit
 * media-query branch rendered different markup on server vs a
 * reduced-motion client, which produced a hydration mismatch on EVERY page
 * for those users — identical markup is the only correct SSR pattern here.
 */
export const SectionFade: FC<SectionFadeProps> = ({ children, className }) => (
  <motion.div
    initial={{ opacity: 0.92, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.25 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className={cn("w-full", className)}
  >
    {children}
  </motion.div>
);
