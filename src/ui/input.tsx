import * as React from "react";
import { cn } from "../lib/utils.js";

/**
 * The control surface every text field wears: 8px radius, the control fill and hairline, a
 * dimmed placeholder, the 2px offset focus ring, and a red border (only the border) once the
 * control is `aria-invalid`. Exported for a trigger that wears the same skin — set `aria-invalid`
 * on it for the error state. `selectTriggerClass`'s `surface` variant does, so a picker beside an
 * input matches.
 */
export const controlSurfaceClass =
  "w-full rounded-lg border border-admin-control bg-admin-control px-3 " +
  "text-foreground placeholder:text-admin-dim transition-colors " +
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 " +
  "focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

// Below `sm` every field stays at 16px: iOS Safari zooms the page on focus into anything
// smaller. The field grows to 40px there, so 16px text sits in it in proportion instead of
// filling a 32px box.
const INPUT_SIZE = {
  /** The 32px toolbar row (13px text). */
  sm: "h-10 sm:h-8 sm:text-caption",
  /** The 36px form row. */
  default: "h-10 sm:h-9 sm:text-sm",
  /** The 40px row. */
  lg: "h-10 sm:text-sm"
} as const;

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & {
  /** `sm` is the 32px toolbar row (13px text), `default` the 36px form row, `lg` the 40px one (14px). Below `sm` all are 40px. */
  size?: keyof typeof INPUT_SIZE;
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(controlSurfaceClass, "flex py-1 text-base", INPUT_SIZE[size], className)}
      {...props}
    />
  );
}

export { Input };
