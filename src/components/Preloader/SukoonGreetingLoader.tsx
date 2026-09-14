import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type FC, type ReactNode, useEffect, useState } from "react";

import { GREETINGS, REDUCED_GREETING } from "@/lib/greetings";

interface SukoonGreetingLoaderProps {
  children: ReactNode;
  /** Shortest the greeting shows (measured from NAVIGATION start, not hydration) — stops a one-frame flash. */
  minVisibleMs?: number;
  /** How long each greeting is held. */
  greetingIntervalMs?: number;
  /** Ceiling from mount before the loader must leave, whatever the load state. */
  maxVisibleMs?: number;
}

/* Shared with the route transition so the two read as one motion system. */
export const SUKOON_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

/** Greeting shown when motion is reduced — index derived from the data file. */
const REDUCED_INDEX = GREETINGS.indexOf(REDUCED_GREETING);

/**
 * SukoonGreetingLoader — full-screen entry overlay for the first visit only.
 * A warm cream panel holds a short multilingual greeting (the "Welcome"),
 * then lifts away to reveal the site already loaded underneath.
 *
 * FIRST-PAINT RENDER: the overlay is part of the SSR HTML, so it paints with
 * the very first frame — the greeting covers the site WHILE it loads, instead
 * of popping in after hydration (the old post-mount pattern made the loader
 * appear last, which read as a bug). Hydration stays safe because the server
 * and the client's first render produce identical markup:
 *  - nothing window-dependent is read at render time (session/preference
 *    logic lives in effects; state starts at the same values on both);
 *  - the first greeting is visible by construction (AnimatePresence
 *    initial={false}), so no opacity:0 inline style ever reaches HTML;
 *  - a tiny head script (INTRO_GUARD_SCRIPT) keeps it CSS-safe: without JS
 *    the overlay is hidden (`html:not(.js)`), on returning visits it is
 *    hidden pre-hydration (`html.no-intro`), and if the bundle itself dies
 *    mid-boot a CSS guard animation fades it out at 6s — the user is never
 *    trapped behind it.
 *
 * Readiness: leaves on the real `load`/`complete` signal, never before
 * `minVisibleMs` (from navigation) and never after `maxVisibleMs`.
 *
 * Cleanup: fully unmounts on exit (nothing can intercept clicks), and the
 * body scroll lock it sets is always restored.
 */
const SukoonGreetingLoader: FC<SukoonGreetingLoaderProps> = ({
  children,
  minVisibleMs = 2200,
  greetingIntervalMs = 850,
  maxVisibleMs = 5200,
}) => {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"holding" | "ready" | "exiting" | "gone">("holding");
  const [greetingIndex, setGreetingIndex] = useState(0);

  // 1) Session guard + real readiness. Runs only after mount; render output
  //    above is state-only, so server and first client render match.
  useEffect(() => {
    const timers: number[] = [];
    // Returning visitors in this tab: the head script already hid the overlay
    // via `html.no-intro`; unmount it too.
    try {
      if (sessionStorage.getItem("sukoon-intro-seen") === "1") {
        setPhase("gone");
        return;
      }
      sessionStorage.setItem("sukoon-intro-seen", "1");
    } catch {
      /* private mode / storage disabled: intro simply plays again */
    }
    let done = false;
    // Arm on genuine readiness; performance.now() is timeOrigin-based, so the
    // minimum display window counts from NAVIGATION start, not hydration time
    // (a slow bundle must not extend the intro).
    const arm = () => {
      if (done) return;
      done = true;
      const wait = Math.max(0, minVisibleMs - performance.now());
      timers.push(window.setTimeout(() => setPhase((p) => (p === "holding" ? "ready" : p)), wait));
    };
    if (document.readyState === "complete") {
      arm();
    } else {
      window.addEventListener("load", arm, { once: true });
    }
    // Safety ceiling from mount so a stalled asset can never strand the intro.
    timers.push(
      window.setTimeout(
        () => setPhase((p) => (p === "holding" ? "ready" : p)),
        Math.max(1200, maxVisibleMs),
      ),
    );
    return () => {
      window.removeEventListener("load", arm);
      timers.forEach(clearTimeout);
    };
  }, [minVisibleMs, maxVisibleMs]);

  // 2) Reduced motion: jump to the single static greeting (post-mount state
  //    update — hydration-safe) and skip the cycle below.
  useEffect(() => {
    if (reduced === true) setGreetingIndex(REDUCED_INDEX);
  }, [reduced]);

  // 3) Cycle greetings while holding (never under reduced motion).
  useEffect(() => {
    if (reduced || phase !== "holding") return;
    const id = window.setInterval(
      () => setGreetingIndex((i) => (i + 1) % GREETINGS.length),
      greetingIntervalMs,
    );
    return () => clearInterval(id);
  }, [reduced, phase, greetingIntervalMs]);

  // 4) Lock body scroll while visible; always release.
  useEffect(() => {
    if (phase === "gone" || phase === "exiting") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [phase]);

  // 5) Begin the exit once ready.
  useEffect(() => {
    if (phase === "ready") setPhase("exiting");
  }, [phase]);

  const activeGreeting = GREETINGS[greetingIndex]!;

  if (phase === "gone") return <>{children}</>;

  return (
    <>
      {children}
      <motion.div
        data-sukoon-loader
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exiting" ? 0 : 1 }}
        transition={{ duration: reduced === true ? 0.2 : 0.6, ease: SUKOON_EASE }}
        onAnimationComplete={() => {
          if (phase === "exiting") setPhase("gone");
        }}
        aria-label="Loading Sukoon Nest"
        className="fixed inset-0 z-[9999] grid place-items-center overflow-hidden bg-[var(--background)]"
      >
        {/* Single concise status for assistive tech — the greeting cycle itself
            is decorative (aria-hidden) so it is announced once, not per word. */}
        <span className="sr-only">Welcome to Sukoon Nest</span>
        <div className="flex flex-col items-center gap-9 px-6 text-center" aria-hidden="true">
          <div className="relative grid h-[3.25rem] place-items-center sm:h-[4rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={activeGreeting.text}
                lang={activeGreeting.lang}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.5, ease: SUKOON_EASE }}
                className="absolute whitespace-nowrap font-display text-5xl tracking-tight text-foreground sm:text-6xl"
              >
                {activeGreeting.text}
              </motion.span>
            </AnimatePresence>
          </div>
          <img
            src="/images/brand/logo.png"
            alt=""
            width={400}
            height={289}
            className="h-9 w-auto opacity-80"
          />
        </div>
        {/* JS-dead escape hatch (see styles.css `sukoon-loader-guard`). */}
        <noscript>
          <style>{`[data-sukoon-loader]{display:none}`}</style>
        </noscript>
      </motion.div>
    </>
  );
};

export default SukoonGreetingLoader;
