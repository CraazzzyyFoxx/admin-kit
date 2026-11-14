import * as React from "react";
import { cn } from "../lib/utils.js";

/**
 * The surface every text field wears: the field's border, fill, placeholder, focus ring and
 * `aria-invalid` border, without a height or font size. `Input` and `Textarea`-like fields start
 * from it; `selectTriggerClass`'s `surface` variant does too, so a picker beside an input matches.
 */
export const controlSurfaceClass =
  "w-full min-w-0 rounded-md border border-admin-control bg-admin-control px-3 shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40";

const INPUT_SIZE = {
  /** The 32px toolbar row. */
  sm: "h-8 md:text-caption",
  default: "h-9 md:text-sm",
  /** The 40px row. */
  lg: "h-10 md:text-sm"
} as const;

function Input({
  className,
  type,
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & { size?: keyof typeof INPUT_SIZE }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        controlSurfaceClass,
        "py-1 text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none",
        INPUT_SIZE[size],
        className
      )}
      {...props}
    />
  );
}

export { Input };
