import "./GlareHover.css";

import { type CSSProperties, type FC, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface GlareHoverProps {
  /** Width of the hover element (any CSS length). */
  width?: string;
  /** Height of the hover element (any CSS length; "auto" fits children). */
  height?: string;
  /** Base background of the panel. */
  background?: string;
  /** Border radius of the panel. */
  borderRadius?: string;
  /** Border color of the panel. */
  borderColor?: string;
  children?: ReactNode;
  /** Glare color — must be hex for the opacity to be applied. */
  glareColor?: string;
  /** Glare opacity (0–1). */
  glareOpacity?: number;
  /** Glare sweep angle in degrees. */
  glareAngle?: number;
  /** Glare size as a percentage (e.g. 250 → 250%). */
  glareSize?: number;
  /** Sweep transition duration in ms. */
  transitionDuration?: number;
  /** If true, the glare stays after hover instead of returning on leave. */
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Converts a 3- or 6-digit hex color into rgba with the given alpha. */
const hexToRgba = (glareColor: string, glareOpacity: number): string => {
  const hex = glareColor.replace("#", "");
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0]! + hex[0]!, 16);
    const g = parseInt(hex[1]! + hex[1]!, 16);
    const b = parseInt(hex[2]! + hex[2]!, 16);
    return `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }
  return glareColor;
};

/**
 * GlareHover — React Bits glare sweep on hover (JS + CSS variant).
 *
 * Adapted to this project's conventions only (TS props, `cn`, co-located CSS);
 * the glare math and CSS are the supplied component. The sweep is a
 * presentation-only `::before` overlay — it never touches layout, so it cannot
 * interfere with the section's GSAP entrance/exit owner.
 */
const GlareHover: FC<GlareHoverProps> = ({
  width = "500px",
  height = "500px",
  background = "#000",
  borderRadius = "10px",
  borderColor = "#333",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.5,
  glareAngle = -45,
  glareSize = 250,
  transitionDuration = 650,
  playOnce = false,
  className = "",
  style = {},
}) => {
  const rgba = hexToRgba(glareColor, glareOpacity);

  const vars = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": rgba,
    "--gh-border": borderColor,
  } as CSSProperties;

  return (
    <div
      className={cn("glare-hover", playOnce && "glare-hover--play-once", className)}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
};

export default GlareHover;
