import { useCallback, useEffect, useState } from "react";

/** Key used to persist the user's theme choice. */
export const STORAGE_KEY = "theme";
export type Theme = "light" | "dark";

/**
 * Inline script injected into <head> (before the stylesheet) so the correct
 * theme class is applied before the first paint — no flash of incorrect
 * colors. The site ships in a premium LIGHT theme by default; dark mode is
 * only activated when the user has explicitly opted in (toggled it on), so
 * nothing is forced dark by the OS preference.
 */
export const THEME_SCRIPT = [
  "!function(){",
  "try{",
  `var t=localStorage.getItem('${STORAGE_KEY}');`,
  "var d=t==='dark';",
  "document.documentElement.classList.toggle('dark',d);",
  "}catch(e){}",
  "}();",
].join("");

/**
 * Runs before first paint (like THEME_SCRIPT) so the greeting loader can be
 * part of the SSR HTML WITHOUT ever trapping a user:
 *  - `.js` marks a live JS runtime; `html:not(.js)` CSS hides the overlay for
 *    no-JS visitors (content is immediately reachable).
 *  - `.no-intro` hides the overlay for returning tabs (sessionStorage seen),
 *    so revisits never flash the greeting pre-hydration.
 * The React loader remains the single owner of the animated lifecycle.
 */
export const INTRO_GUARD_SCRIPT = [
  "!function(){",
  "try{",
  "document.documentElement.classList.add('js');",
  "if(sessionStorage.getItem('sukoon-intro-seen')==='1'){",
  "document.documentElement.classList.add('no-intro');",
  "}",
  "}catch(e){}",
  "}();",
].join("");

/** Read the active theme directly from the document element. */
export function getTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/**
 * React hook exposing the current theme and a `toggleTheme` mutator.
 *
 * The visible icon is driven by the `dark:` CSS variant (reacting to the
 * `.dark` class), so it never causes a hydration mismatch — this hook only
 * needs to (re)render when other UI wants the value and to persist toggling.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const sync = () => setTheme(getTheme());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable (e.g. private mode) — ignore.
    }
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
  }, []);

  return { theme, toggleTheme };
}
