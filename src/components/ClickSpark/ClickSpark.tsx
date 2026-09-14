import { useCallback, useEffect, useRef, type FC, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ClickSparkProps {
  children: ReactNode;
  /** Diameter (px) of each spark. */
  sparkSize?: number;
  /** How far (px) sparks travel from the click origin. */
  sparkRadius?: number;
  /** Number of sparks per click. */
  sparkCount?: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Easing name: "ease-out" or a "cubic-bezier(a,b,c,d)" string. */
  easing?: "ease-out" | string;
  /** Sparks start at `1 + extraScale` and shrink to 1. */
  extraScale?: number;
  /** CSS color string (a CSS variable is resolved against :root at runtime). */
  sparkColor?: string;
  className?: string;
}

type EasingFn = (progress: number) => number;

type SparkParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number; // 0 -> 1 over `duration`
};

const resolveEasing = (name: string): EasingFn => {
  if (name === "ease-out") return (t) => 1 - Math.pow(1 - t, 3);
  const match = /^cubic-bezier\(([^)]+)\)$/.exec(name);
  if (!match) return (t) => t;
  const parts = (match[1] ?? "").split(",").map((v) => parseFloat(v));
  if (parts.length !== 4 || parts.some((v) => Number.isNaN(v))) return (t) => t;
  const b = parts[1] as number;
  const c = parts[2] as number;
  return (t) => 3 * (1 - t) * (1 - t) * t * b + 3 * (1 - t) * t * t * c + t * t * t;
};

/**
 * Renders a subtle radial spark burst wherever the user clicks, on an
 * absolutely positioned `<canvas>` with `pointer-events: none`.
 *
 * The canvas never intercepts pointer events, so buttons, links, scrolling and
 * keyboard interaction are never affected. The effect is disabled entirely when
 * `prefers-reduced-motion` is enabled.
 */
export const ClickSpark: FC<ClickSparkProps> = ({
  children,
  sparkSize = 8,
  sparkRadius = 14,
  sparkCount = 7,
  duration = 375,
  easing = "ease-out",
  extraScale = 0.8,
  sparkColor = "var(--peach)",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<SparkParticle[]>([]);
  const rafRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const colorRef = useRef<string>("");
  const reducedRef = useRef(true);
  const easeRef = useRef<EasingFn>(resolveEasing(easing));

  const resolveColor = useCallback(() => {
    if (!colorRef.current) {
      let resolved = sparkColor;
      if (sparkColor.startsWith("var(")) {
        const varName = sparkColor.slice(4, -1).trim();
        resolved =
          getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || "#e8a87a";
      }
      colorRef.current = resolved || "#e8a87a";
    }
    return colorRef.current;
  }, [sparkColor]);

  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      rafRef.current = undefined;
      return;
    }

    const now = performance.now();
    if (lastTimeRef.current === 0) lastTimeRef.current = now;
    const dt = Math.min(now - lastTimeRef.current, 32);
    lastTimeRef.current = now;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = resolveColor();

    let alive = 0;
    for (let i = sparksRef.current.length - 1; i >= 0; i--) {
      const p = sparksRef.current[i];
      if (!p) continue;
      p.life += dt / duration;
      if (p.life >= 1) {
        sparksRef.current.splice(i, 1);
        continue;
      }
      alive++;
      const eased = easeRef.current(p.life);
      p.x += p.vx;
      p.y += p.vy;
      const scale = 1 + (1 - eased) * extraScale;
      const size = p.size * scale;
      const alpha = 1 - eased;

      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (alive > 0) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      rafRef.current = undefined;
    }
  }, [duration, extraScale, resolveColor]);

  const spawn = useCallback(
    (x: number, y: number) => {
      if (reducedRef.current || !Number.isFinite(x) || !Number.isFinite(y)) return;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
        const speed = sparkRadius * 0.25 + Math.random() * sparkRadius * 0.25;
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: sparkSize * (0.8 + Math.random() * 0.4),
          life: 0,
        });
      }
      if (!rafRef.current) {
        lastTimeRef.current = 0;
        rafRef.current = requestAnimationFrame(loop);
      }
    },
    [sparkCount, sparkRadius, sparkSize, loop],
  );

  // Reactive config + reduced-motion preference.
  useEffect(() => {
    easeRef.current = resolveEasing(easing);
  }, [easing]);

  useEffect(() => {
    const update = () => {
      reducedRef.current =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };
    update();
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Canvas sizing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = Math.max(width, 1);
      canvas.height = Math.max(height, 1);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Skip touch pointers to avoid spark noise while scrolling on mobile.
      if (event.pointerType === "touch") return;
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      spawn(event.clientX - rect.left, event.clientY - rect.top);
    },
    [spawn],
  );

  return (
    <div ref={containerRef} className={cn("relative", className)} onPointerDown={onPointerDown}>
      {children}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
};
