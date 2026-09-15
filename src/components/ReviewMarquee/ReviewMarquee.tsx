import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface ReviewItem {
  quote: string;
  by: string;
}

export interface ReviewMarqueeProps {
  items: ReviewItem[];
  className?: string;
}

const MOBILE_BP = 768;
/**
 * Track copies. The CSS loop translates the track by exactly -50%, so the
 * halves must be identical and long enough to cover the viewport at every
 * frame: REPS must be EVEN (50% lands on a copy boundary) and REPS/2 copies
 * must exceed common viewport widths. 6 copies of this 3-item set ≈ 5.7k px
 * total → seamless on every screen, with no jump and no blank right edge.
 */
const REPS = 6;

/**
 * ReviewMarquee — a slow, continuous horizontal scroll of review cards
 * (Magic UI aesthetic, restrained).
 *
 * - CSS `@keyframes` drive the motion (no JS animation loop).
 * - seamless loop: track = REPS copies, keyframe ends at -50% (= REPS/2
 *   copies), and spacing is a per-card right margin — NOT a flex `gap`,
 *   which left the halves unequal by one gap and made every loop cycle
 *   visibly jump.
 * - pauses on hover AND on keyboard focus (tabbing into the track);
 * - `prefers-reduced-motion` → motion disabled, cards stack vertically and are
 *   fully readable with no animation;
 * - on mobile the cards stack vertically for comfortable reading (the marquee
 *   only runs on tablet/desktop where it is wide enough to read);
 * - rendered copies beyond the first set are `aria-hidden` so screen readers
 *   read each quote once;
 * - renders identical markup on the server (stacked) and only activates the
 *   marquee after mount — no hydration mismatch.
 */
export const ReviewMarquee = ({ items, className }: ReviewMarqueeProps) => {
  const [marquee, setMarquee] = useState(false);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setMarquee(!mm.matches && window.innerWidth >= MOBILE_BP);
    update();
    mm.addEventListener?.("change", update);
    window.addEventListener("resize", update);
    return () => {
      mm.removeEventListener?.("change", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const list = marquee
    ? Array.from({ length: REPS }, (_, r) => items.map((item) => ({ item, copy: r }))).flat()
    : items.map((item) => ({ item, copy: 0 }));

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-y-auto", marquee && "overflow-x-hidden", className)}
    >
      <div
        className={cn(
          "flex",
          marquee ? "flex-row animate-marquee" : "flex-col items-center gap-5",
          marquee && "focus-visible:outline-none focus-visible:ring-2",
          marquee && "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
        )}
        style={marquee ? { animationPlayState: paused ? "paused" : "running" } : undefined}
        onMouseEnter={marquee ? () => setPaused(true) : undefined}
        onMouseLeave={marquee ? () => setPaused(false) : undefined}
        onFocus={marquee ? () => setPaused(true) : undefined}
        onBlur={marquee ? () => setPaused(false) : undefined}
        role="region"
        aria-label="What people say"
        tabIndex={marquee ? 0 : -1}
      >
        {list.map(({ item, copy }, i) => (
          <ReviewCard key={`${i}-${item.by}`} item={item} hidden={copy > 0} mr={marquee} />
        ))}
      </div>
    </div>
  );
};

const ReviewCard = ({ item, hidden, mr }: { item: ReviewItem; hidden?: boolean; mr?: boolean }) => (
  <div
    aria-hidden={hidden || undefined}
    className={cn(
      "relative flex-shrink-0 rounded-xl bg-card p-5 sm:p-6",
      "soft-shadow border border-ink-soft/10",
      "w-[260px] sm:w-[300px]",
      mr && "mr-5",
    )}
  >
    <div className="mb-3 flex items-center gap-0.5 text-[var(--peach)]">
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} />
      ))}
    </div>
    <p className="font-serif text-foreground text-sm italic sm:text-base">"{item.quote}"</p>
    <footer className="mt-3 border-t border-ink-soft/10 pt-3 text-right text-xs text-ink-soft">
      — {item.by}
    </footer>
  </div>
);

const StarIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M7.5 1.5l1.8 5.6h5.4l-4.4 3.4 1.7 5.5-4.4-3.1-4.4 3.1 1.7-5.5-4.4-3.4h5.4z" />
  </svg>
);
