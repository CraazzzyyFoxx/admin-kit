import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";
import { Slot } from "radix-ui";
import { controlSurfaceClass } from "./input.js";
import { TONE_CLASS } from "./tone.js";

// The press is a 1px sink, the same on every width (a scale shrinks a wide button by several
// pixels and blurs its text). `transform`, not `translate-y-*`, so it adds to a caller's
// centring translate instead of replacing it.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 motion-safe:active:not-disabled:[transform:translateY(1px)] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_1px_2px_oklch(0_0_0/0.15)] hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        /** A "go" confirmation the user can miss (check in): the success fill. */
        positive:
          "bg-success text-background shadow-[inset_0_1px_0_oklch(1_0_0/0.18),0_1px_2px_oklch(0_0_0/0.15)] hover:bg-success/90",
        /** An icon-only remove/delete beside a row: quiet at rest, the destructive tint on hover. */
        "ghost-destructive":
          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
        /** "Add one more" affordance: dashed outline, primary on hover (a phase, a match, a round). */
        dashed:
          "border border-dashed border-input text-muted-foreground hover:border-primary hover:text-primary",
        /** The row's primary action and the chosen option of a choice: the primary tone tint. */
        accent: cn(
          "border",
          TONE_CLASS.accent,
          "hover:bg-[color:color-mix(in_srgb,var(--tone-hue)_18%,transparent)]"
        )
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
        /** The icon action of a 32px toolbar row, beside `size="sm"` controls. */
        "icon-toolbar": "size-8",
        /** Text action inside a sentence or row (`variant="link"`): no box, the surrounding text size, no press. */
        inline: "h-auto rounded-sm p-0 text-[length:inherit] motion-safe:active:[transform:none]",
        /** A sortable column head's own label (`variant="ghost"`): no box, the eyebrow voice, 12px glyph. */
        label:
          "h-auto gap-1 rounded-sm p-0 text-label font-semibold uppercase tracking-label motion-safe:active:[transform:none] [&_svg:not([class*='size-'])]:size-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

/** The outline button's surface without its sizing, for chips that sit beside buttons. */
export const outlineSurfaceClass =
  "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50";

/** The two skins of a select-like trigger: `default` the outline surface, `surface` the form-field one `Input` wears. */
export type SelectTriggerVariant = "default" | "surface";

/** `SelectTrigger`'s look for triggers that are not a Radix Select (the Combobox), so both pickers match. */
export function selectTriggerClass(
  size: "sm" | "default" = "default",
  variant: SelectTriggerVariant = "default"
) {
  return cn(
    "group/trigger flex w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm font-normal whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 *:min-w-0 *:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4",
    variant === "surface" && cn(controlSurfaceClass, "justify-between gap-2 py-2 text-sm font-normal"),
    size === "sm" ? "h-8 text-caption" : "h-9"
  );
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  type,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      // A `<button type="button">` unless told otherwise: a form's submit button passes `type="submit"`.
      type={type ?? (asChild ? undefined : "button")}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
