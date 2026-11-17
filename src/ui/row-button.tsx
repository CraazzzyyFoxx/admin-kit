"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "../lib/utils.js";

/**
 * A whole list row that is one action — select a team, open a player; with
 * `asChild`, a row that is one link. The caller lays the cells out; the
 * primitive owns the reset, the row hover (`--admin-row-hover`, never on a disabled row), the
 * selected state (`aria-current`, `--admin-row-selected`) and the inset focus ring.
 */
const RowButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild = false, type, ...props }, ref) => {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      ref={ref}
      type={type ?? (asChild ? undefined : "button")}
      className={cn(
        "w-full cursor-pointer text-left transition-colors",
        // `:where` keeps the hover at a bare class's weight, so a caller's own
        // `hover:` and `aria-[current=true]:` fills still win over it.
        "[@media(hover:hover)]:[&:where(:hover:not(:disabled))]:bg-[color:var(--admin-row-hover,--theme(--color-muted))] aria-[current=true]:bg-[color:var(--admin-row-selected,--theme(--color-accent))]",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
RowButton.displayName = "RowButton";

export { RowButton };
