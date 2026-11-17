"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";

import { selectTriggerClass, type SelectTriggerVariant } from "./button.js";
import { triggerChevronClass } from "./chevron.js";
import { eyebrowClass } from "./eyebrow.js";
import { floatingPanelClass, floatingPanelFadeClass, floatingRowClass } from "./popover.js";

type SelectSize = "sm" | "default";

/**
 * The trigger's `size`, handed to the list so its rows take the same text
 * (the control text of the trigger) without a second prop at every call site.
 */
const SelectSizeContext = React.createContext<{
  size: SelectSize;
  setSize: (size: SelectSize) => void;
} | null>(null);

function Select({ ...props }: React.ComponentProps<typeof SelectPrimitive.Root>) {
  const [size, setSize] = React.useState<SelectSize>("default");
  const context = React.useMemo(() => ({ size, setSize }), [size]);
  return (
    <SelectSizeContext.Provider value={context}>
      <SelectPrimitive.Root data-slot="select" {...props} />
    </SelectSizeContext.Provider>
  );
}

function SelectGroup({ ...props }: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({ ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  variant = "default",
  children,
  onPointerDown,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: SelectSize;
  /** `surface` wears the form-field skin `Input` does (and fills its row). */
  variant?: SelectTriggerVariant;
}) {
  const setSize = React.useContext(SelectSizeContext)?.setSize;
  React.useEffect(() => setSize?.(size), [setSize, size]);
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(selectTriggerClass(size, variant), className)}
      // Radix opens on pointerdown and honours only its own `disabled`, but the
      // browser still dispatches pointerdown to a button disabled by an ancestor
      // `<fieldset disabled>`, so a locked select would open anyway.
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.currentTarget.matches(":disabled")) event.preventDefault();
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={triggerChevronClass} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "relative z-50 max-h-[min(18rem,var(--radix-select-content-available-height))] min-w-[8rem] overflow-x-hidden overflow-y-auto",
          floatingPanelClass,
          floatingPanelFadeClass,
          className
        )}
        position={position}
        sideOffset={sideOffset}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 pt-2 pb-1", eyebrowClass(), className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const size = React.useContext(SelectSizeContext)?.size;
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        floatingRowClass,
        "w-full pr-8 focus:bg-admin-raised-hover focus:text-foreground data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        size === "sm" && "text-caption",
        className
      )}
      {...props}
    >
      <span
        data-slot="select-item-indicator"
        className="absolute right-2 flex size-3.5 items-center justify-center"
      >
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4 text-primary" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1 my-1 h-px bg-admin-separator", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
};
