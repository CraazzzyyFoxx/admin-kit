"use client";

import React, { memo } from "react";
import { useTranslations } from "next-intl";
import type { Row } from "@tanstack/react-table";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { VirtualItem } from "@tanstack/react-virtual";

import { eyebrowClass } from "../ui/eyebrow.js";
import { TableCell, TableRow } from "../ui/table.js";
import { cn } from "../lib/utils.js";
import { renderBodyCell, renderLeadingCell } from "./body-cells.js";
import type { ColumnLayout } from "./column-layout.js";
import type { DataTableGroup } from "./types.js";
import type { BodyItem } from "./useVirtualBody.js";

/**
 * What a row reports back. `DataTable` gives every row the same object for the
 * table's lifetime and has it forward to the current render's handlers, so a
 * handler is never what makes a memoised row repaint.
 */
export interface RowHandlers<TData> {
  click: (event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) => void;
  doubleClick: (event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) => void;
  focus: (rowId: string) => void;
  pointerDown: (event: React.PointerEvent<HTMLElement>, row: Row<TData>) => void;
  checkboxPointerDown: (event: React.PointerEvent<HTMLElement>, row: Row<TData>) => void;
  checkboxClick: (event: React.MouseEvent<HTMLElement>) => void;
}

/** What every row of the table shares; each value keeps its identity until what it describes changes. */
export interface SharedRowProps<TData> {
  layout: ColumnLayout<TData>;
  /** Vertical padding for the current density. */
  cellPadding: string;
  cellAlign: "top" | "middle";
  /** The debounced query: the live one would repaint every row on every keystroke. */
  search: string;
  /** Columns with a caller-supplied `cell`, which render themselves instead of being highlighted. */
  customCellIds: Set<string>;
  hasLeadingColumn: boolean;
  enableRowSelection: boolean;
  hasExpandedDetail: boolean;
  hasRowAction: boolean;
  rowHintId: string;
  /** Tooltip of every row: says a double-click opens it, where it does. */
  rowTitle?: string;
  handlers: RowHandlers<TData>;
}

interface BodyRowProps<TData> extends SharedRowProps<TData> {
  row: Row<TData>;
  // Handed in rather than read off `row`: a TanStack row object outlives a
  // selection or expand change, so the memo would never notice one.
  selected: boolean;
  expanded: boolean;
  /** Open in the inspector: tinted and `aria-current`. */
  isCurrent: boolean;
  /** The one row in the Tab order; arrows move between the rest. */
  tabbable: boolean;
  /** Virtualised rows only: the virtualiser's measuring ref and the item's index. */
  measureRef?: (node: Element | null) => void;
  index?: number;
}

/** One data row; repaints only when one of its own props changes. */
const BodyRow = memo(function BodyRow<TData>({
  row,
  selected,
  expanded,
  isCurrent,
  tabbable,
  measureRef,
  index,
  ...shared
}: Readonly<BodyRowProps<TData>>) {
  const t = useTranslations("adminKit.dataTable");
  const { layout, handlers } = shared;
  const cells = row.getVisibleCells();
  return (
    <TableRow
      ref={measureRef}
      data-index={index}
      data-row-id={row.id}
      data-selected={selected || undefined}
      aria-current={isCurrent ? "true" : undefined}
      tabIndex={tabbable ? 0 : -1}
      title={shared.rowTitle}
      onFocus={(event) => {
        if (event.target === event.currentTarget) handlers.focus(row.id);
      }}
      className={cn(
        // One tint per state, held in `--admin-row-tint` (registered in
        // globals.css, so it fades): the row paints it, and every pinned cell
        // repaints the same value over its opaque base (`STICKY_CELL_CLASS`).
        // The row's own background states are pointed at it so `TableRow`'s
        // hover/current fills give way. Selection, set on purpose, outranks the
        // inspector's current-row mark, which outranks hover.
        "group bg-[color:var(--admin-row-tint)] hover:bg-[color:var(--admin-row-tint)] aria-[current=true]:bg-[color:var(--admin-row-tint)] transition-[--admin-row-tint] duration-150",
        selected
          ? "[--admin-row-tint:var(--admin-row-selected,color-mix(in_oklab,--theme(--color-primary)_8%,transparent))]"
          : isCurrent
            ? "[--admin-row-tint:color-mix(in_oklab,--theme(--color-primary)_10%,transparent)] hover:[--admin-row-tint:color-mix(in_oklab,--theme(--color-primary)_16%,transparent)]"
            : "hover:[--admin-row-tint:var(--admin-row-hover,--theme(--color-muted))]",
        "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        shared.hasRowAction && "cursor-pointer"
      )}
      onPointerDown={(event) => handlers.pointerDown(event, row)}
      onClick={(event) => handlers.click(event, row)}
      onDoubleClick={(event) => handlers.doubleClick(event, row)}
      aria-describedby={shared.rowHintId}
    >
      {shared.hasLeadingColumn
        ? renderLeadingCell(row, {
            ...shared,
            i18n: (key, values) => t(key as never, values as never),
            selected,
            expanded
          })
        : null}
      {cells.flatMap((cell, cellIndex) => [
        ...(cellIndex === layout.fillerIndex ? [layout.fillerCell] : []),
        renderBodyCell(cell, cellIndex, cells.length, shared)
      ])}
      {layout.fillerIndex === cells.length ? layout.fillerCell : null}
    </TableRow>
  );
}) as <TData>(props: Readonly<BodyRowProps<TData>>) => React.ReactNode;

export interface BodyItemContext<TData> {
  shared: SharedRowProps<TData>;
  /** Row open in the inspector. */
  inspectorId?: string | null;
  tabbableRowId: string | null;
  renderExpanded?: (row: Row<TData>) => React.ReactNode;
  measureElement: (node: Element | null) => void;
  /** Folds or unfolds the group with this key. */
  onToggleGroup: (key: string) => void;
}

/**
 * A group's header: the fold button (chevron, label, row count) and, outside it, the group's
 * `actions`. Narrow, the actions wrap under the button instead of crushing the label.
 * shortcut: in a table wider than its box the actions sit at the far, scrolled-off edge; pin the header to the scroll box once a grouped table scrolls sideways.
 */
export function GroupHeader<TData>({
  group,
  collapsed,
  onToggle
}: Readonly<{
  group: DataTableGroup<TData>;
  collapsed: boolean;
  onToggle: (key: string) => void;
}>) {
  const Chevron = collapsed ? ChevronRight : ChevronDown;
  return (
    <div className={cn(eyebrowClass("muted"), "flex flex-wrap items-center bg-muted/30")}>
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={() => onToggle(group.key)}
        className="flex min-w-0 flex-1 basis-48 items-center gap-1.5 px-4 py-2 text-left hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-hidden focus-visible:ring-inset"
      >
        <Chevron aria-hidden className="size-3.5 shrink-0" />
        {group.label}
        <span className="font-normal text-muted-foreground tabular-nums">{group.rows.length}</span>
      </button>
      {group.actions ? (
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-1.5 text-sm font-normal tracking-normal text-foreground normal-case">
          {group.actions}
        </div>
      ) : null}
    </div>
  );
}

/**
 * One body item as its `<tr>`: a memoised `BodyRow`, or a group header or an
 * expanded detail, which are few and simply repaint with the table.
 * Virtualised items carry the measuring ref and their index.
 */
export function renderBodyItem<TData>(
  item: BodyItem<TData>,
  ctx: BodyItemContext<TData>,
  virtual?: VirtualItem
) {
  if (item.kind === "row") {
    const { row } = item;
    return (
      <BodyRow
        key={item.key}
        {...ctx.shared}
        row={row}
        selected={row.getIsSelected()}
        expanded={row.getIsExpanded()}
        isCurrent={row.id === ctx.inspectorId}
        tabbable={row.id === ctx.tabbableRowId}
        measureRef={virtual ? ctx.measureElement : undefined}
        index={virtual?.index}
      />
    );
  }
  const measure = virtual ? { ref: ctx.measureElement, "data-index": virtual.index } : {};
  if (item.kind === "group") {
    return (
      // Not a row: right-click keeps the browser's menu instead of the row menu on `<tbody>`.
      <TableRow
        key={item.key}
        {...measure}
        className="hover:bg-transparent"
        onContextMenu={(event) => event.stopPropagation()}
      >
        <TableCell
          colSpan={ctx.shared.layout.bodyColumnCount}
          className="border-b border-border/40 p-0"
        >
          <GroupHeader
            group={item.group}
            collapsed={item.collapsed}
            onToggle={ctx.onToggleGroup}
          />
        </TableCell>
      </TableRow>
    );
  }
  return (
    <TableRow
      key={item.key}
      {...measure}
      className="hover:bg-transparent"
      onContextMenu={(event) => event.stopPropagation()}
    >
      <TableCell
        colSpan={ctx.shared.layout.bodyColumnCount}
        className="border-b border-border/30 bg-muted/10 px-4 py-4"
      >
        {ctx.renderExpanded?.(item.row)}
      </TableCell>
    </TableRow>
  );
}
