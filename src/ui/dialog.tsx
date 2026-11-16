"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "./button.js";
import { PANEL_CONTENT_CLASS, type PanelVariant } from "./panel.js";
import { floatingPanelFadeClass } from "./popover.js";

// Part of `dialog`'s public API since 0.1.0; defined in `panel` so `Card` can read them on the server.
export { PANEL_CONTENT_CLASS, type PanelVariant };

/**
 * The surface of a modal that is not the centred box (a sheet docked to an edge): scrolls when
 * taller than the viewport, fades like every modal.
 */
export const MODAL_SURFACE_CLASS = `z-50 overflow-auto overscroll-contain border bg-background p-6 text-foreground shadow-lg ${floatingPanelFadeClass}`;

const PANEL_HEADER_CLASS = "shrink-0 border-b border-border py-4 ps-5 pe-12";
const PANEL_FOOTER_CLASS = "shrink-0 border-t border-border px-5 py-3";

/**
 * A quiet icon close button in the top-trailing corner, centred on the title's first line. A
 * `panel` sits closer to the corner. `DialogContent` mounts it for `panel`; a sheet mounts it too.
 */
export function ModalCloseButton({ variant }: { variant: PanelVariant }) {
  const t = useTranslations("adminKit.common");
  return (
    <DialogPrimitive.Close asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={t("close")}
        className={cn("absolute", variant === "panel" ? "end-3.5 top-3.5" : "end-4 top-5")}
      >
        <XIcon aria-hidden />
      </Button>
    </DialogPrimitive.Close>
  );
}

function Dialog({ ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  variant = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
  variant?: PanelVariant;
}) {
  const t = useTranslations("adminKit.common");
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 sm:max-w-lg",
          variant === "panel" && PANEL_CONTENT_CLASS,
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && variant === "panel" && <ModalCloseButton variant={variant} />}
        {showCloseButton && variant !== "panel" && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4"
          >
            <XIcon />
            <span className="sr-only">{t("close")}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: PanelVariant }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        variant === "panel" && PANEL_HEADER_CLASS,
        className
      )}
      {...props}
    />
  );
}

function DialogFooter({
  className,
  showCloseButton = false,
  variant = "default",
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean;
  variant?: PanelVariant;
}) {
  const t = useTranslations("adminKit.common");
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        variant === "panel" && PANEL_FOOTER_CLASS,
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">{t("close")}</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger
};
