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
      {display}
    </span>
  );
};
