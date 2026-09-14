import { forwardRef } from "react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, Ref } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

export interface WorkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Provide an `href` to render an `<a>` (navigation). Omit for a `<button>` (action). */
  href?: string;
}

/**
 * WorkButton — a secondary CTA with a subtle, centre-origin circular fill that
 * blooms on hover.
 *
 * Palette uses the existing Sukoon Nest system (`--primary` sage for the fill,
 * `--secondary` base, `--secondary-foreground` text). No purple.
 */
export const WorkButton = forwardRef<HTMLAnchorElement | HTMLButtonElement, WorkButtonProps>(
  ({ className, href, children, ...props }, ref) => {
    const content = (
      <>
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 scale-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-[4.5]"
        />
        <span className="relative z-10 inline-flex items-center gap-2">
          {children}
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </>
    );

    if (href) {
      return (
        <a
          ref={ref as Ref<HTMLAnchorElement>}
          href={href}
          className={cn(
            "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden",
            "rounded-full bg-secondary px-7 py-3.5 text-sm font-medium",
            "text-secondary-foreground outline-none",
            "transition-[background-color,box-shadow] duration-300",
            "hover:bg-secondary/80 hover:shadow",
            className,
          )}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as Ref<HTMLButtonElement>}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden",
          "rounded-full bg-secondary px-7 py-3.5 text-sm font-medium",
          "text-secondary-foreground outline-none",
          "transition-[background-color,box-shadow] duration-300",
          "hover:bg-secondary/80 hover:shadow",
          className,
        )}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  },
);
WorkButton.displayName = "WorkButton";
