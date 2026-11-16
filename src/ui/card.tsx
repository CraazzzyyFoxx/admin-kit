import * as React from "react";
import { Slot } from "radix-ui";
import { cn } from "../lib/utils.js";

/**
 * A bare surface: fill, border, radius, no padding or layout of its own. A `<div>` by default;
 * `asChild` renders the element the card actually is where it belongs in the page outline:
 * `<Card asChild><section aria-label="…">`.
 *
 * Padding belongs to what is inside: `CardHeader`/`CardContent`/`CardFooter` pad themselves, and
 * a card built from its own regions (a table, a ruled list, an inspector) is flush without
 * opting out of anything. A card that padded itself stacked that padding on every such region.
 */
function Card({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn("rounded-xl border bg-card text-card-foreground shadow-surface", className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />;
}

/**
 * The `text-heading` type role: an app sets `--text-heading` in its theme. `asChild` with a heading
 * element wherever the card belongs in the page outline. A smaller title goes on `CardTitle`'s own
 * `className`, not the child's: `Slot` joins the two without merging, and both sizes would stay.
 */
function CardTitle({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return <Comp data-slot="card-title" className={cn("text-heading font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-6 pt-0", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center p-6 pt-0", className)} {...props} />;
}

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
