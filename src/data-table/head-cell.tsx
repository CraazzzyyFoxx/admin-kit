import { flexRender, type Header, type SortingState } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Info } from "lucide-react";

import { Button } from "../ui/button.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";
import { cn } from "../lib/utils.js";
import { ariaSortValue } from "./types.js";
import {
  ADMIN_ACTION_COLUMN_ID,
  ALIGN_CLASS,
  ALIGN_FLEX_CLASS,
  RESPONSIVE_CLASS,
  readColumnMeta
} from "./columns.js";
import { HEAD_SURFACE_CLASS, type ColumnLayout } from "./column-layout.js";
import type { AdminTableDensity } from "./useTablePreferences.js";
import type { ColumnDndModule } from "./ColumnDnd.js";

export interface HeadCellContext<TData> {
  i18n: (key: string, values?: Record<string, unknown>) => string;
  layout: ColumnLayout<TData>;
  density: AdminTableDensity;
  sorting: SortingState;
  /** Client mode stacks sorts on Shift+click; server mode takes one column. */
  isClientMode: boolean;
  hasLeadingColumn: boolean;
  /** Plain until the drag chunk lands, then the same cell with dnd-kit's bindings. */
  HeadCell: ColumnDndModule["SortableHead"];
}

/** One `<th>`: the column's header, its sort toggle and its resize handle. */
export function renderHeadCell<TData>(
  header: Header<TData, unknown>,
  index: number,
  count: number,
  {
    i18n,
    layout,
    density,
    sorting,
    isClientMode,
    hasLeadingColumn,
    HeadCell
  }: HeadCellContext<TData>
) {
  const isActionColumn = header.column.id === ADMIN_ACTION_COLUMN_ID;
  const isFirstColumn = index === 0 && !hasLeadingColumn;
  const isLastColumn = index === count - 1;
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const sortIndex = sorting.length > 1 ? header.column.getSortIndex() : -1;
  const columnMeta = readColumnMeta<TData>(header.column.columnDef.meta);
  const align = columnMeta.align ?? (isActionColumn ? "right" : "left");
  const sticky = layout.stickyCell(header.column.id, layout.getColumnStyle(header.column));

  return (
    <HeadCell
      key={header.id}
      header={header}
      aria-sort={canSort ? ariaSortValue(sorted) : undefined}
      data-sticky={sticky["data-sticky"]}
      data-sticky-edge={sticky["data-sticky-edge"]}
      className={cn(
        "border-b border-border text-xs font-medium text-muted-foreground",
        density === "compact" ? "h-8" : "h-9",
        sticky.className ? cn(sticky.className, "z-3", HEAD_SURFACE_CLASS) : HEAD_SURFACE_CLASS,
        isFirstColumn && "pl-4",
        isLastColumn && "pr-4",
        layout.edgePadding(header.column.id),
        ALIGN_CLASS[align],
        RESPONSIVE_CLASS[columnMeta.responsive ?? "always"],
        columnMeta.className,
        columnMeta.headerClassName
      )}
      style={sticky.style}
    >
      {header.isPlaceholder ? null : (
        <span className={cn("inline-flex w-full items-center gap-1", ALIGN_FLEX_CLASS[align])}>
          {canSort ? (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={header.column.getToggleSortingHandler()}
              title={isClientMode ? i18n("sortHint") : undefined}
              className={cn(
                "group/sort h-auto px-0 font-medium text-muted-foreground hover:bg-transparent hover:text-foreground",
                sorted && "text-foreground"
              )}
            >
              {flexRender(header.column.columnDef.header, header.getContext())}
              {sorted === "asc" ? (
                <ArrowUp aria-hidden className="size-3 shrink-0" />
              ) : sorted === "desc" ? (
                <ArrowDown aria-hidden className="size-3 shrink-0" />
              ) : (
                <ArrowUpDown
                  aria-hidden
                  className="size-3 shrink-0 opacity-0 transition-opacity group-hover/sort:opacity-50 group-focus-visible/sort:opacity-50"
                />
              )}
              {sortIndex >= 0 ? (
                <span
                  aria-label={i18n("sortPriority", { index: sortIndex + 1 })}
                  className="tabular-nums opacity-70"
                >
                  {sortIndex + 1}
                </span>
              ) : null}
            </Button>
          ) : (
            flexRender(header.column.columnDef.header, header.getContext())
          )}
          {columnMeta.headerTooltip ? (
            // Beside the sort button, not in it: opening the hint must not sort.
            // Brings its own provider so the table works outside the admin shell's.
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    tabIndex={0}
                    className="inline-flex shrink-0 cursor-help rounded text-muted-foreground hover:text-foreground"
                  >
                    <Info aria-hidden className="size-3" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  {columnMeta.headerTooltip}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : null}
        </span>
      )}
    </HeadCell>
  );
}
