import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { useEffect, useState, type FC } from "react";

import { cn } from "@/lib/utils";
import { SUKOON_EASE } from "@/components/Preloader/SukoonGreetingLoader";

/*
 * ScrollTopButton — appears after the reader is a screen into the page and
 * returns them to the top with a smooth glide (instant under reduced
 * motion). SSR/first render output is identical (hidden; state only flips
 * from a scroll effect), so it is hydration-safe. z-40 keeps it under
 * dialogs (z-50), the route wash (z-90) and the loader (z-[9999]).
 */
const APPEAR_PX = 640;

const ScrollTopButton: FC<{ className?: string }> = ({ className }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setShow(window.scrollY > APPEAR_PX));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const toTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          key="scroll-top"
          onClick={toTop}
          aria-label="Scroll back to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: SUKOON_EASE }}
          className={cn(
            "fixed right-5 bottom-5 z-40 grid size-11 place-items-center rounded-full",
            "border border-border bg-card text-foreground soft-shadow",
            "transition-colors hover:bg-secondary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            className,
          )}
        >
          <ArrowUp size={18} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollTopButton;
