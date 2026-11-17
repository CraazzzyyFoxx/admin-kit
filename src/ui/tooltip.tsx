"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { floatingPanelClass } from "./popover.js";
import { Tooltip as TooltipPrimitive } from "radix-ui";

/** How long the pointer rests before a tooltip opens, the same on every page. */
export const TOOLTIP_DELAY = 150;

function TooltipProvider({
  delayDuration = TOOLTIP_DELAY,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 max-w-xs overflow-hidden px-3 py-1.5 text-caption text-balance animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          floatingPanelClass,
          "rounded-md",
          className
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
