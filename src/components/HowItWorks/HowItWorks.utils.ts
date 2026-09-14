import { howItWorksSteps } from "@/lib/steps";

/** Number of authored steps in the journey. */
export const STEP_COUNT = howItWorksSteps.length;

/** Visual emphasis values for a single step zone. */
export interface Emphasis {
  opacity: number;
  scale: number;
  y: number;
}

/**
 * Pure visual-emphasis mapper for a step zone, driven entirely by the single
 * `activeStep` source of truth. Because the SAME `activeStep` feeds the timeline
 * indicators (StepIndicator) and the step-zone content (emphasised via this
 * mapper), the two can never disagree — this is the invariant the previous
 * architecture violated.
 *
 * Guarantees:
 *  - the active step is always fully opaque (opacity 1) and unscaled (scale 1, y 0);
 *  - future steps are never brighter than completed steps;
 *  - under `prefers-reduced-motion`, scale & translate are flattened to neutral
 *    so the step state is conveyed by opacity alone (no motion, no glow, no jump).
 */
export const emphasisFor = (index: number, activeStep: number, reduced: boolean): Emphasis => {
  if (index === activeStep) return { opacity: 1, scale: 1, y: 0 };
  if (index < activeStep) {
    return reduced ? { opacity: 0.8, scale: 1, y: 0 } : { opacity: 0.55, scale: 0.97, y: -8 };
  }
  return reduced ? { opacity: 0.5, scale: 1, y: 0 } : { opacity: 0.28, scale: 0.95, y: 20 };
};
