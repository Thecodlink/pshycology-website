import { useState, type FC } from "react";

import { cn } from "@/lib/utils";

/*
 * Accessible 1–5 star rating control.
 * Native radio inputs (arrow keys, grouping, screen-reader announcement of
 * "n stars") drive the value; the stars are the visual layer. Filled vs
 * outline is a SHAPE difference, so colour is never the only signal.
 * Hover preview is pointer-only affordance; touch/keyboard work without it.
 */

const Star = () => (
  <svg width="17" height="17" viewBox="0 0 15 15" fill="currentColor" aria-hidden="true">
    <path d="M7.5 1.5l1.8 5.6h5.4l-4.4 3.4 1.7 5.5-4.4-3.1-4.4 3.1 1.7-5.5-4.4-3.4h5.4z" />
  </svg>
);

export const StarRating: FC<{
  /** Radio group name (unique per form). */
  name: string;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}> = ({ name, value, onChange, disabled }) => {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Your rating
      </legend>
      <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = shown >= n;
          return (
            <label
              key={n}
              className={cn(
                "relative grid size-11 place-items-center rounded-full",
                !disabled && "cursor-pointer",
              )}
              onMouseOver={() => !disabled && setHover(n)}
            >
              <input
                type="radio"
                name={name}
                value={n}
                checked={value === n}
                disabled={disabled}
                onChange={() => {
                  onChange(n);
                  setHover(0);
                }}
                className="peer absolute inset-0 m-0 size-full cursor-pointer opacity-0"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "grid size-9 place-items-center rounded-full border transition-colors duration-200",
                  "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1",
                  active
                    ? "border-peach bg-peach/15 text-[#b07b55]"
                    : "border-border bg-card text-muted-foreground/45",
                )}
              >
                <Star />
              </span>
              <span className="sr-only">
                {n} star{n > 1 ? "s" : ""}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
