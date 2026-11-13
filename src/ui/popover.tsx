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

/** The floating panel every overlay shares: select and combobox lists, menus, popovers. */
export const floatingPanelClass =
  "rounded-md border bg-popover text-popover-foreground shadow-md";

/** The panel's only motion: a fade in and out on Radix's `data-state`. */
export const floatingPanelFadeClass =
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0";

/** A row of a floating panel: 32px under a mouse, 44px under a finger. Each primitive adds its own cursor fill. */
export const floatingRowClass =
  "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden pointer-coarse:min-h-11";

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
        // A modal Dialog's scroll lock swallows wheel/touch from anything portalled outside it,
        // so a scrollable popover opened from a dialog would never scroll. Keep the events here.
        onWheelCapture={(event) => {
          onWheelCapture?.(event);
          event.stopPropagation();
        }}
        onTouchMove={(event) => {
          onTouchMove?.(event);
          event.stopPropagation();
        }}
        className={cn(
          "z-50 w-72 origin-(--radix-popover-content-transform-origin) p-4 outline-hidden",
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
      className={cn("text-muted-foreground", className)}
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
