import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";
import { Slot } from "radix-ui";
import { controlSurfaceClass } from "./input.js";
import { TONE_CLASS } from "./tone.js";

/**
 * A filled button is semibold, in the same sentence case and size as every other button in its
 * row, with one 1px sheen along its top edge. Under the pointer it brightens rather than fading,
 * so it never dims into the surface.
 */
const SOLID =
  "font-semibold shadow-[inset_0_1px_0_var(--admin-sheen,oklch(1_0_0/0.18))] hover:brightness-110 disabled:hover:brightness-100";

/**
 * The tonal surface: raised off whatever it sits on (a page, a card, a dialog), never a darker
 * well punched into it. The `outline` button, every select-like trigger (`SelectTrigger`,
 * `Combobox`) and `FilterChip` wear it; the border steps up while the panel the control opens is
 * open.
 */
export const outlineSurfaceClass =
  "border border-admin-control bg-admin-raised text-foreground shadow-[inset_0_1px_0_var(--admin-edge,transparent)] hover:border-admin-control-hover hover:bg-admin-raised-hover aria-expanded:border-admin-control-hover";

/** The two skins of a select-like trigger: `default` the outline surface, `surface` the form-field one `Input` wears. */
export type SelectTriggerVariant = "default" | "surface";

/**
 * The select-like trigger, worn by `SelectTrigger`, the `Combobox` trigger and both date pickers
 * so a plain and a searchable picker read as one control: `sm` the 32px toolbar row (13px),
 * `default` the 36px form row (14px); `default` the outline button's surface, `surface` the form
 * field skin. A field, not a button: no press. The placeholder dims on `data-placeholder`; an
 * unsized icon in the value is 16px.
 */
export function selectTriggerClass(
  size: "sm" | "default" = "default",
  variant: SelectTriggerVariant = "default"
) {
  return cn(
    // `*:` rather than `[&>span]:`: happy-dom keeps the `&gt;` React serializes a `>` in a class
    // to, and every hydration test of a page with a picker would mismatch (see `ui/chevron.ts`).
    // Same for quotes in `[class*=…]`.
    "group/trigger flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 font-medium whitespace-nowrap transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive data-[placeholder]:text-admin-dim *:min-w-0 *:truncate [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_:where(svg:not([class*=size-]))]:size-4",
    size === "sm" ? "h-8 text-caption" : "h-9 text-sm",
    variant === "surface"
      ? cn(
          controlSurfaceClass,
          "hover:border-admin-control-hover hover:bg-admin-raised aria-expanded:border-admin-control-hover"
        )
      : outlineSurfaceClass
  );
}

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap",
    "transition-[color,background-color,border-color,box-shadow,filter,transform] duration-150 ease-out",
    "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    // The press: a 1px sink, the same on every width (a scale shrinks a wide button by several
    // pixels and blurs its text), off for reduced motion. `transform`, not `translate-y-*`: it
    // adds to a caller's centring `-translate-y-1/2` instead of replacing it (a 14px jump on a
    // close X).
    "motion-safe:active:not-disabled:[transform:translateY(1px)]",
    // Disabled keeps its pointer events, so a `title` or tooltip can say why; each variant resets
    // its own hover under `disabled:hover:` instead.
    // shortcut: a caller that recolours a variant's rest state sees the variant's rest colour
    // while hovering it disabled; `enabled:hover:` would fix that but outrank every call-site
    // `hover:` override.
    "disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_:where(svg:not([class*=size-]))]:size-4"
  ],
  {
    variants: {
      variant: {
        default: cn("bg-primary text-primary-foreground", SOLID),
        // `text-white`: shadcn's theme has no `--color-destructive-foreground`.
        destructive: cn("bg-destructive text-white", SOLID),
        /** A "go" confirmation the user can miss (check in): the success fill. */
        positive: cn("bg-success text-background", SOLID),
        /** The everyday button: the tonal surface (`outlineSurfaceClass`). */
        outline: cn(
          outlineSurfaceClass,
          "disabled:hover:border-admin-control disabled:hover:bg-admin-raised"
        ),
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:hover:bg-secondary",
        ghost:
          "hover:bg-admin-raised hover:text-foreground disabled:hover:bg-transparent disabled:hover:text-inherit",
        /** An icon-only remove/delete beside a row: quiet at rest, the destructive tint on hover. */
        "ghost-destructive":
          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:hover:bg-transparent disabled:hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline disabled:hover:no-underline",
        /** "Add one more" affordance: dashed outline, primary on hover (a phase, a match, a round). */
        dashed:
          "border border-dashed border-admin-control text-admin-muted hover:border-primary hover:text-primary disabled:hover:border-admin-control disabled:hover:text-admin-muted",
        /** The row's primary action and the chosen option of a choice: the primary tone tint (`TONE_CLASS.accent`). */
        accent: cn(
          "border",
          TONE_CLASS.accent,
          "hover:bg-[color:color-mix(in_srgb,var(--tone-hue)_18%,transparent)] disabled:hover:bg-[color:color-mix(in_srgb,var(--tone-hue)_12%,transparent)]"
        )
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-caption",
        lg: "h-10 px-6",
        /** The icon action of a 36px form row, beside `default` controls. */
        icon: "size-9",
        /** The icon action of a 40px row, beside `lg` controls. */
        "icon-lg": "size-10",
        /** The icon action of a 32px toolbar row, beside `size="sm"` controls. */
        "icon-toolbar": "size-8",
        /** A secondary icon beside text (an explainer, a row action): 28px box, 14px glyph. */
        "icon-sm": "size-7 [&_:where(svg:not([class*=size-]))]:size-3.5",
        /** A dense strip's text action (a canvas header's "+ match", a field's reset): 24px, label text, 12px glyph. */
        xs: "h-6 gap-1 px-2 text-label [&_:where(svg:not([class*=size-]))]:size-3",
        /** An icon inside a dense strip (a bracket card's footer, a wiring port): 20px box, 14px glyph or a label-size letter. */
        "icon-xs": "size-5 text-label [&_:where(svg:not([class*=size-]))]:size-3.5",
        /** Text action inside a sentence or row (`variant="link"`): no box, the surrounding text size, no press. */
        inline: "h-auto rounded-sm p-0 text-[length:inherit] motion-safe:active:not-disabled:[transform:none]",
        /** A sortable column head's own label (`variant="ghost"`): no box, the eyebrow voice, 12px glyph. Font family follows the cell. */
        label:
          "h-auto gap-1 rounded-sm p-0 text-label font-semibold uppercase tracking-label motion-safe:active:not-disabled:[transform:none] [&_:where(svg:not([class*=size-]))]:size-3"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

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
