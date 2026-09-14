import { useRouterState } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";

import { SUKOON_EASE } from "@/components/Preloader/SukoonGreetingLoader";

/*
 * RouteTransition — the navigation half of the Sukoon Nest motion system
 * (the greeting loader owns first entry; this owns route changes).
 *
 * Mechanics deliberately chosen for this router:
 *  - The route tree remounts on pathname change, so the OUTGOING page cannot
 *    be kept animating without holding a stale `<Outlet/>` (which would
 *    render the NEW route twice — the messy merge the brief forbids).
 *    Instead: a whisper-thin warm-cream wash covers the one-frame swap
 *    (old page effectively "fades" under it), and the NEW page rises gently
 *    into place — perceptually out-then-in, architecturally single-owner.
 *  - Keyed by `pathname` only: same-page hash/anchor changes never remount
 *    or animate — `/#about` scrolling stays native browser behavior.
 *  - The first mount (fresh document, direct link, refresh, or right after
 *    the greeting loader) renders with NO animation — the intro is reserved
 *    for the loader, so there is never a double performance.
 *  - Scroll ownership stays with the router (`scrollRestoration: true` in
 *    src/router.tsx): push → top, back/forward → restored. Nothing here
 *    touches scroll position.
 *  - Transforms only; zero layout properties animated; the wash is
 *    pointer-events-none and purely decorative.
 */
const RouteTransition: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });
  const reduced = useReducedMotion();
  const enteredOnce = useRef(false);
  const animateIn = enteredOnce.current;
  const [covering, setCovering] = useState(false);

  useEffect(() => {
    enteredOnce.current = true;
  }, []);

  useEffect(() => {
    if (!animateIn) return; // skip the wash for the very first render
    setCovering(true);
    const t = window.setTimeout(() => setCovering(false), 170);
    return () => clearTimeout(t);
  }, [pathname, animateIn]);

  // Router `Link` pushes `#hash` as state (no native anchor jump), so scroll
  // to the target after the location settles — twice-deep rAF lets the keyed
  // remount paint first. Same-path hash changes skip the wash/animation
  // entirely (pathname key is unchanged), keeping anchor use-feel native.
  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.replace(/^#/, ""));
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "start",
        });
      });
    });
    return () => {
      cancelAnimationFrame(first);
      if (second) cancelAnimationFrame(second);
    };
  }, [hash, pathname, reduced]);

  return (
    <div className="relative">
      <motion.div
        key={pathname}
        initial={animateIn ? { opacity: 0, y: reduced ? 0 : 14 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduced ? 0.2 : 0.42,
          ease: SUKOON_EASE,
          delay: animateIn && !reduced ? 0.06 : 0,
        }}
      >
        {children}
      </motion.div>

      {/* Decorative swap-wash in brand cream — subtle, brief, never blocks input. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[90] bg-[var(--background)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: covering ? 0.85 : 0 }}
        transition={{ duration: covering ? 0.14 : 0.3, ease: SUKOON_EASE }}
      />
    </div>
  );
};

export default RouteTransition;
