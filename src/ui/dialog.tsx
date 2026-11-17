"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "./button.js";
import { floatingPanelFadeClass } from "./popover.js";

/**
 * One modal chrome for `Dialog`, `AlertDialog` and a sheet: the page colour as the scrim; the card
 * fill, a hairline rim and the 1px lit top edge as the surface, no drop shadow. Both fade in and
 * out in ~150ms (the floating panel's fade): no zoom, no slide.
 *
 * `overflow-auto` (not `overflow-y-auto`) so a modal taller than the viewport scrolls instead of
 * running off its edges. It shares tailwind-merge's `overflow` group, so the surfaces that manage
 * their own scrolling (`overflow-hidden` + an inner scroller) still override it.
 */
export const MODAL_OVERLAY_CLASS = `fixed inset-0 z-50 bg-background/80 ${floatingPanelFadeClass}`;
/** The surface of a modal that is not the centred box (a sheet docked to an edge); the caller adds the border sides. */
export const MODAL_SURFACE_CLASS = `z-50 overflow-auto overscroll-contain border-border bg-card p-6 text-foreground shadow-[inset_0_1px_0_var(--admin-edge,transparent)] ${floatingPanelFadeClass}`;
/** The centred box: 12px radius, a 1rem margin from every viewport edge. */
export const MODAL_CONTENT_CLASS = `fixed left-1/2 top-1/2 grid max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border ${MODAL_SURFACE_CLASS}`;
export const MODAL_HEADER_CLASS = "flex flex-col space-y-1.5 text-start";
export const MODAL_TITLE_CLASS = "text-heading font-semibold";
export const MODAL_DESCRIPTION_CLASS = "text-body text-muted-foreground";

/**
 * `panel` is a work surface rather than a message: flush (no padding or gap), a flex column that
 * clips, so the body runs its own scroller between a header and a footer ruled off by
 * `DialogHeader`/`DialogFooter variant="panel"`.
 */
export type PanelVariant = "default" | "panel";

export const PANEL_CONTENT_CLASS = "flex flex-col gap-0 overflow-hidden p-0";
const PANEL_HEADER_CLASS = "shrink-0 border-b border-border py-4 ps-5 pe-12";
const PANEL_FOOTER_CLASS = "shrink-0 border-t border-border px-5 py-3";

/**
 * The one close control of a modal: a quiet 28px icon button in the top-trailing corner, centred
 * on the title's first line; `DialogHeader` keeps clear of it. A `panel` sits closer to the
 * corner. A sheet mounts the same one.
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
      className={cn(MODAL_OVERLAY_CLASS, className)}
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
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(MODAL_CONTENT_CLASS, variant === "panel" && PANEL_CONTENT_CLASS, className)}
        {...props}
      >
        {children}
        {showCloseButton && <ModalCloseButton variant={variant} />}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

/** The sheet header too; `pe-*` keeps clear of the close button (`AlertDialog` has none). */
function DialogHeader({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & { variant?: PanelVariant }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(MODAL_HEADER_CLASS, variant === "panel" ? PANEL_HEADER_CLASS : "pe-7", className)}
      {...props}
    />
  );
}

/** The `AlertDialog` and sheet footer too: actions stacked (primary on top) on a phone, a trailing row from `sm`. */
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
      className={cn(MODAL_TITLE_CLASS, className)}
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
      className={cn(MODAL_DESCRIPTION_CLASS, className)}
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
