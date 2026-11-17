"use client";

import * as React from "react";
import { cn } from "../lib/utils.js";
import { eyebrowClass } from "./eyebrow.js";

/**
 * The table primitive. Cells read as `text-caption`, heads in the eyebrow voice, rows over
 * `border-border` hairlines: hover `--admin-row-hover`, the current row (`aria-current="true"`)
 * `--admin-row-selected`. Header rows never hover.
 *
 * `wrapperClassName` styles the scroll box around the `<table>`; a table that owns its scrolling sets it.
 */
function Table({
  className,
  wrapperClassName,
  ...props
}: React.ComponentProps<"table"> & { wrapperClassName?: string }) {
  return (
    <div
      data-slot="table-container"
      className={cn("relative w-full overflow-auto", wrapperClassName)}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-caption", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b [&_tr:hover]:bg-transparent", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("border-t border-border bg-muted/50 font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-[color:var(--admin-row-hover,--theme(--color-muted))] aria-[current=true]:bg-[color:var(--admin-row-selected,--theme(--color-accent))]",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        eyebrowClass(),
        "h-10 px-2 text-left align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-caption text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * A plain table that is the body of a `Section` or a card of its own: 13px like `DataTable`,
 * and its outer cells start on the block's 16px line instead of the cells' 8px.
 */
const insetTableClass =
  "text-[13px] [&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  insetTableClass
};
