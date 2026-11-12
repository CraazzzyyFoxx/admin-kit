"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { flexRender, type Column, type Row } from "@tanstack/react-table";

import { cn } from "../lib/utils.js";
import { GroupHeader } from "./body-rows.js";
import { ADMIN_ACTION_COLUMN_ID, readColumnMeta } from "./columns.js";
import type { BodyItem } from "./useVirtualBody.js";
import { RowButton } from "../ui/row-button.js";

/**
 * Below `md` a wide table either scrolls sideways past the point of use or
 * hides its columns, so the rows become cards instead (F18 ·1). Three columns
 * is what fits a phone row; a screen whose three most important columns are
 * not the first three passes `renderMobileCard`. A first column that is an
 * icon or a badge (`meta.align: "center"`, the convention for both) leads the
 * card beside the other two: as a line of its own it sat alone above them,
 * centred like its table cell. Group headers fold here as they do in the table;
 * expanded details have no card form.
 */
export function AdminTableMobileList<TData>({
  items,
  visibleColumns,
  renderMobileCard,
  inspectorId,
  onRowClick,
  onToggleGroup
}: Readonly<{
  items: BodyItem<TData>[];
  visibleColumns: Column<TData, unknown>[];
  renderMobileCard?: (row: Row<TData>) => React.ReactNode;
  inspectorId?: string | null;
  onRowClick?: (row: Row<TData>) => void;
  onToggleGroup: (key: string) => void;
}>) {
  const t = useTranslations("adminKit.table");
  const cardColumns = visibleColumns
    .filter((column) => column.id !== ADMIN_ACTION_COLUMN_ID)
    .slice(0, 3);
  const media =
    cardColumns[0] && readColumnMeta<TData>(cardColumns[0].columnDef.meta).align === "center"
      ? cardColumns[0]
      : null;
  const lineColumns = media ? cardColumns.slice(1) : cardColumns;

  return (
    <ul aria-label={t("rows")}>
      {items.map((item) => {
        if (item.kind === "detail") return null;
        if (item.kind === "group")
          return (
            <li key={item.key} className="border-b border-border/30">
              <GroupHeader group={item.group} collapsed={item.collapsed} onToggle={onToggleGroup} />
            </li>
          );
        const { row } = item;
        const cells = row.getVisibleCells();
        const actionCell = cells.find((cell) => cell.column.id === ADMIN_ACTION_COLUMN_ID);
        const renderCell = (column: Column<TData, unknown>) => {
          const cell = cells.find((candidate) => candidate.column.id === column.id);
          return cell ? flexRender(cell.column.columnDef.cell, cell.getContext()) : null;
        };
        const lines = lineColumns.map((column) => (
          <div key={column.id} className="truncate text-sm">
            {renderCell(column)}
          </div>
        ));
        const body = renderMobileCard ? (
          renderMobileCard(row)
        ) : media ? (
          <div className="flex items-center gap-3">
            <div className="shrink-0">{renderCell(media)}</div>
            <div className="min-w-0 flex-1 space-y-0.5">{lines}</div>
          </div>
        ) : (
          lines
        );

        return (
          <li
            key={row.id}
            aria-current={row.id === inspectorId ? "true" : undefined}
            className={cn(
              "group flex items-start gap-2 border-b border-border/30 px-4 py-3 last:border-b-0",
              row.id === inspectorId && "bg-primary/10"
            )}
          >
            {onRowClick ? (
              <RowButton
                onClick={() => onRowClick(row)}
                className="-m-1 min-w-0 flex-1 space-y-0.5 rounded-md p-1"
              >
                {body}
              </RowButton>
            ) : (
              <div className="min-w-0 flex-1 space-y-0.5">{body}</div>
            )}
            {actionCell ? (
              <div className="shrink-0">
                {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
