"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { Popover as PopoverPrimitive } from "radix-ui";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * The floating panel every overlay shares: select and combobox lists, menus,
 * popovers and (at a smaller radius) tooltips. Raised off whatever it opens
 * over, like an `outline` button: the `panel` fill is lighter than a page, a
 * card or a dialog, with the control border and a 1px light along its top
 * edge. No drop shadow.
 */
export const floatingPanelClass =
  "rounded-[10px] border border-admin-control bg-admin-panel text-foreground shadow-[inset_0_1px_0_var(--admin-edge,transparent)]";

/** The panel's only motion: a fade in and out on Radix's `data-state`. */
export const floatingPanelFadeClass =
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";

/**
 * A row of a floating panel: every select and combobox option and every menu
 * item. 32px under a mouse, 44px under a finger (`pointer-coarse`), 6px radius.
 * Each primitive adds its own cursor fill and disabled state: Radix and cmdk
 * mark them with different attributes.
 */
export const floatingRowClass =
  "relative flex cursor-default select-none items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden pointer-coarse:min-h-11";

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  animate = true,
  onWheelCapture,
  onTouchMove,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  /** `false` for a panel that must not fade (a hover card that follows the pointer). */
  animate?: boolean;
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        // Keep wheel/touch inside the popover, or a scrollable body of one opened
        // from a modal Dialog cannot scroll at all.
        //
        // Radix Dialog wraps its content in react-remove-scroll, which registers a
        // NON-capture `wheel`/`touchmove` listener on `document`. That listener
        // preventDefaults any event it cannot attribute to the locked subtree or to
        // a declared shard, and this content is portalled to `document.body`, so
        // it is neither. The default scroll action runs only after dispatch
        // finishes, so the list never moves even though it overflows.
        //
        // Radix Select/DropdownMenu are unaffected: each is modal in its own right
        // and installs its own lock, which registers its content. Popover is not,
        // so it has to keep the event away from `document` itself.
        onWheelCapture={(event) => {
          onWheelCapture?.(event);
          event.stopPropagation();
        }}
        onTouchMove={(event) => {
          onTouchMove?.(event);
          event.stopPropagation();
        }}
        className={cn(
          "z-50 w-72 p-4 outline-hidden",
          floatingPanelClass,
          animate && floatingPanelFadeClass,
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

function PopoverClose({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

function PopoverAnchor({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  );
}

function PopoverTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <div data-slot="popover-title" className={cn("font-medium", className)} {...props} />;
}

function PopoverDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="popover-description"
      className={cn("text-admin-muted", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
  PopoverHeader,
  PopoverTitle,
  PopoverDescription
};
