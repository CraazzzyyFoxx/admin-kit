"use client";

import type { ReactNode } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip.js";
import { cn } from "../lib/utils.js";

interface IconTooltipProps {
  /** Tooltip title; for a glyph also its accessible name. */
  label: string;
  /** Optional second, dimmer tooltip line. */
  hint?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  /** The glyph; mark it `aria-hidden`, `label` already names it. Omit for a glyph drawn by `className` alone. */
  children?: ReactNode;
  /**
   * The child is a control -- an icon button -- that carries its own
   * accessible name: wrap it as the trigger instead of announcing an image.
   */
  control?: boolean;
}

/**
 * Any icon, avatar stack or icon-only button, with the admin's tooltip.
 *
 * For a glyph the wrapper carries `role="img"` so `aria-label` is honoured --
 * on a bare `<span>` ARIA prohibits it and the name is silently dropped --
 * which keeps the label reachable for keyboard and screen-reader users the
 * pointer-only tooltip never shows to. For a `control` the button names
 * itself; the plain wrapper is still the trigger, so a disabled button (which
 * swallows no pointer events) explains itself too, and focus on the button
 * bubbles up to open it.
 */
export function IconTooltip({
  label,
  hint,
  side = "top",
  className,
  children,
  control = false
}: Readonly<IconTooltipProps>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {control ? (
            <span className={cn("inline-flex", className)}>{children}</span>
          ) : (
            <span
              className={cn("inline-flex cursor-default", className)}
              role="img"
              aria-label={label}
            >
              {children}
            </span>
          )}
        </TooltipTrigger>
        <TooltipContent side={side}>
          {hint ? (
            <>
              <div className="font-semibold">{label}</div>
              <div className="text-muted-foreground">{hint}</div>
            </>
          ) : (
            label
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
