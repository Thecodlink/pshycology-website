import { animate, useMotionValue } from "motion/react";
import { useEffect, useRef, useState, type FC } from "react";

import { cn } from "@/lib/utils";

export interface CounterProps {
  /** Target number to animate to. */
  value: number;
  /** Static prefix rendered before the number (e.g. "$"). */
  prefix?: string;
  /** Static suffix rendered after the number (e.g. "+", "%"). */
  suffix?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** Extra class names for the rendered `<span>`. */
  className?: string;
  /**
   * Class applied to the suffix ("+", "%"). Display fonts like Italiana
   * render a tiny high hairline plus that reads like a stray stroke — the
   * stats pass a sans, bolded treatment so it looks like a real +.
   */
  suffixClassName?: string;
}

const formatValue = (prefix: string, value: number, suffix: string): string =>
  prefix + Math.round(value).toLocaleString("en-US") + suffix;

/**
 * One-time count-up component built on Motion (`motion/react`).
 *
 * - Animates 0 → `value` the moment the element enters the viewport.
 * - Honours `prefers-reduced-motion`: final value is rendered immediately.
 * - The `prefix`/`suffix` are static and never animated as digits.
 */
export const Counter: FC<CounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  duration = 2.2,
  className,
  suffixClassName = "font-sans text-[0.62em] font-semibold top-[-0.08em]",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState<string>(() => formatValue(prefix, value, suffix));

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(formatValue(prefix, value, suffix));
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries?.[0];
        if (!entry?.isIntersecting) return;

        motionValue.set(0);
        setDisplay(formatValue(prefix, 0, suffix));
        animate(motionValue, value, {
          duration,
          ease: "easeOut",
          onUpdate: (current) => setDisplay(formatValue(prefix, current, suffix)),
        });
        observer.disconnect();
      },
      { threshold: 0.5, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, prefix, suffix, motionValue]);

  return (
    <span
      ref={ref}
      aria-label={`${prefix}${value.toLocaleString("en-US")}${suffix}`}
      className={cn("tabular-nums", className)}
    >
      {suffix && display.length > suffix.length ? (
        <>
          {display.slice(0, -suffix.length)}
          <span className={cn("relative", suffixClassName)}>{suffix}</span>
        </>
      ) : (
        display
      )}
    </span>
  );
};
