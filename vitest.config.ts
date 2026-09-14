import { defineConfig } from "vitest/config";

// Vitest reuses the Vite toolchain. The project's `@/*` -> `./src/*` alias is
// read natively from tsconfig.json via `resolve.tsconfigPaths` (no extra plugin).
// The HowItWorks unit tests run in the node environment: `emphasisFor` /
// `STEP_COUNT` are pure logic and pull only from `src/lib/steps` (plain data,
// no React / DOM).
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: false,
    passWithNoTests: true,
  },
  resolve: { tsconfigPaths: true },
});
