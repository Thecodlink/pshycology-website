import { describe, expect, it } from "vitest";

import { howItWorksSteps } from "@/lib/steps";
import { emphasisFor, STEP_COUNT } from "./HowItWorks.utils";

/**
 * The "How It Works" section is driven by a SINGLE `activeStep` source of
 * truth (an IntersectionObserver on the step zones). `activeStep` controls the
 * completed/active/inactive state of BOTH the timeline indicators and the step
 * content's visual emphasis (`emphasisFor`).
 *
 * These tests lock the invariants that keep the indicator ⇄ content from ever
 * desynchronising (the core bug in the previous implementation):
 *   - the active step is always fully visible/opaque/scale-1;
 *   - the active step is always the brightest;
 *   - completed steps are always more visible than future steps;
 *   - reduced motion conveys state via opacity only (no scale/translate).
 */
describe("HowItWorks — six-step single-source-of-truth invariants", () => {
  it("there are exactly six authored steps", () => {
    expect(STEP_COUNT).toBe(6);
    expect(howItWorksSteps).toHaveLength(6);
  });

  describe("emphasisFor (drives indicator + content visibility together)", () => {
    it("active step is always fully visible & unscaled in both motion modes", () => {
      for (let active = 0; active < STEP_COUNT; active++) {
        for (const reduced of [false, true]) {
          expect(emphasisFor(active, active, reduced)).toEqual({ opacity: 1, scale: 1, y: 0 });
        }
      }
    });

    it("the active step is always the brightest of every step at a given activeStep", () => {
      for (let active = 0; active < STEP_COUNT; active++) {
        const all = Array.from({ length: STEP_COUNT }, (_, i) => emphasisFor(i, active, false));
        expect(all[active]!.opacity).toBe(1);
        expect(all.every((s) => s.opacity <= 1)).toBe(true);
        expect(all.every((s) => s.opacity > 0)).toBe(true);
      }
    });

    it("completed steps are always more visible than future steps", () => {
      for (let active = 1; active < STEP_COUNT - 1; active++) {
        for (let completed = 0; completed < active; completed++) {
          for (let future = active + 1; future < STEP_COUNT; future++) {
            expect(emphasisFor(completed, active, false).opacity).toBeGreaterThan(
              emphasisFor(future, active, false).opacity,
            );
          }
        }
      }
    });

    it("reduced motion flattens scale & translate (opacity-only state ladder)", () => {
      expect(emphasisFor(2, 2, true)).toEqual({ opacity: 1, scale: 1, y: 0 });
      expect(emphasisFor(1, 2, true)).toEqual({ opacity: 0.8, scale: 1, y: 0 });
      expect(emphasisFor(3, 2, true)).toEqual({ opacity: 0.5, scale: 1, y: 0 });

      const everyReduced = Array.from({ length: STEP_COUNT }, (_, i) =>
        Array.from({ length: STEP_COUNT }, (_, a) => emphasisFor(i, a, true)),
      ).flat();
      expect(everyReduced.every((e) => e.scale === 1 && e.y === 0)).toBe(true);
    });

    it("opacity ladder is monotonic: active > completed > future", () => {
      const active = emphasisFor(2, 2, false);
      const completed = emphasisFor(1, 2, false);
      const future = emphasisFor(3, 2, false);
      expect(active.opacity).toBeGreaterThan(completed.opacity);
      expect(completed.opacity).toBeGreaterThan(future.opacity);
    });
  });

  describe("content / step mapping (one source of truth: activeStep)", () => {
    it(`howItWorksSteps[activeStep].number matches the step ordinal for all 6 steps`, () => {
      for (let active = 0; active < STEP_COUNT; active++) {
        expect(howItWorksSteps[active]?.number).toBe(`${(active + 1).toString().padStart(2, "0")}`);
      }
    });
  });
});
