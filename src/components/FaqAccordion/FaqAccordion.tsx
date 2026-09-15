import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";

import { cn } from "@/lib/utils";

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqAccordionProps {
  items: FaqItem[];
  className?: string;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * FaqAccordion — a premium editorial FAQ.
 *
 * - semantic `<button>` trigger per question (keyboard accessible);
 * - `aria-expanded` / `aria-controls` / `aria-hidden` wired correctly;
 * - smooth measured-height reveal (GSAP) with fade, instant under
 *   `prefers-reduced-motion`;
 * - single-open behaviour;
 * - content is always in the DOM and readable on first paint (answers render
 *   expanded server-side; collapse to the open item before first paint via
 *   useLayoutEffect — never stuck hidden).
 */
export const FaqAccordion = ({ items, className }: FaqAccordionProps) => {
  const [open, setOpen] = useState<number | null>(0); // first item open by default
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  const refs = useRef<Record<number, HTMLDivElement | null>>({});
  const mountedRef = useRef(false);

  useEffect(() => {
    const mm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mm.matches);
    mm.addEventListener?.("change", on);
    return () => mm.removeEventListener?.("change", on);
  }, []);

  useIsoLayoutEffect(() => {
    if (typeof window === "undefined") return;

    items.forEach((_, i) => {
      const el = refs.current[i];
      if (!el) return;

      if (i === open) {
        if (reduced) {
          gsap.set(el, { display: "block", height: "auto", opacity: 1 });
        } else if (!mountedRef.current) {
          // initial: show the open panel instantly (no flash)
          gsap.set(el, { display: "block", height: "auto", opacity: 1 });
        } else {
          // toggle: animate open
          gsap.set(el, { display: "block", height: 0, opacity: 0 });
          // scrollHeight returns the full content height even when collapsed
          // (offsetHeight would read 0 here and leave the answer hidden).
          const h = el.scrollHeight;
          gsap.to(el, { height: h, opacity: 1, duration: 0.5, ease: "power2.out" });
        }
      } else {
        if (reduced || !mountedRef.current) {
          gsap.set(el, { display: "none", height: 0, opacity: 0 });
        } else {
          gsap.to(el, {
            height: 0,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => gsap.set(el, { display: "none" }),
          });
        }
      }
    });

    mountedRef.current = true;
  }, [open, reduced, items.length]);

  return (
    <div
      className={cn(
        "w-full divide-y divide-ink-soft/20 overflow-hidden rounded-2xl bg-card",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = i === open;
        const id = `faq-answer-${i}`;
        const questionId = `faq-question-${i}`;
        return (
          <div key={questionId} className="border-0">
            <h3 className="m-0">
              <button
                id={questionId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={id}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 px-5 py-4 text-left",
                  "font-serif text-lg text-foreground sm:text-xl",
                  "hover:text-[var(--primary)]",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2",
                )}
              >
                <span className="flex-1">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "ml-auto shrink-0 transition-transform duration-300",
                    "text-[var(--primary)]",
                    isOpen && "rotate-45",
                  )}
                >
                  <PlusIcon />
                </span>
              </button>
            </h3>
            <div
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={id}
              aria-hidden={!isOpen}
              className="overflow-hidden"
            >
              <p className="px-5 py-4 text-ink-soft sm:px-6 sm:py-5">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M10 3.5v13M3.5 10h13"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
