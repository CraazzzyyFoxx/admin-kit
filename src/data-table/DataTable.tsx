"use client";

import React, {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { useTranslations } from "next-intl";
import { flexRender, type Row } from "@tanstack/react-table";

import { Card } from "../ui/card.js";
import { Table, TableBody, TableCell, TableRow } from "../ui/table.js";
import { Skeleton } from "../ui/skeleton.js";
import { InfiniteScrollFooter } from "../ui/infinite-scroll.js";
import { DataPagination, DEFAULT_PAGE_HOTKEYS } from "../ui/data-pagination.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select.js";
import { toast } from "sonner";
import { useDescribeError } from "../provider.js";
import { useIsMobile } from "../hooks/use-mobile.js";
import { usePathname } from "next/navigation";
import { fetchAllPages } from "./fetchAllPages.js";
import {
  ADMIN_ACTION_COLUMN_ID,
  columnDefId,
  readColumnMeta
} from "./columns.js";
import type { DataTableProps } from "./types.js";
import { useColumnVisibility } from "./useColumnVisibility.js";
import {
  isInteractiveRowTarget,
  useRowSelectionGestures
} from "./useRowSelectionGestures.js";
import { downloadCsv } from "./csv.js";
import type { ColumnDndModule } from "./ColumnDnd.js";
import { buildColumnLayout } from "./column-layout.js";
import {
  renderBodyItem,
  type RowHandlers,
  type SharedRowProps
} from "./body-rows.js";
import { AdminRowContextMenu } from "./AdminRowContextMenu.js";
import { AdminTableHeader } from "./AdminTableHeader.js";
import {
  AdminTableToolbar,
  useNarrowToolbar,
  type PickerColumn
} from "./AdminTableToolbar.js";
import { BulkBar } from "./BulkBar.js";
import { AdminTableEmptyState } from "./AdminTableEmptyState.js";
import { AdminTableMobileList } from "./AdminTableMobileList.js";
import { useAdminTableState } from "./useAdminTableState.js";
import { useAdminTableData } from "./useAdminTableData.js";
import { useAdminTable } from "./useAdminTable.js";
import { useTablePreferences } from "./useTablePreferences.js";
import { useTableScrollBox } from "./useTableScrollBox.js";
import { ROW_HEIGHT_ESTIMATE, useVirtualBody } from "./useVirtualBody.js";
import { cn } from "../lib/utils.js";

const DEFAULT_PAGE_SIZE = 15;
const DEFAULT_PAGE_SIZE_OPTIONS = [10, DEFAULT_PAGE_SIZE, 25, 50, 100];
/** The rows-per-page choice that fits the page to the viewport. */
const AUTO_PAGE_SIZE = "auto";

/**
 * `remembered` with this page's selected rows added (or their data refreshed)
 * and every deselected id dropped; the same map when nothing changed.
 */
function rememberSelection<TData>(
  remembered: ReadonlyMap<string, TData>,
  pageRows: Row<TData>[],
  rowSelection: Record<string, boolean>
): ReadonlyMap<string, TData> {
  let next: Map<string, TData> | null = null;
  for (const row of pageRows) {
    if (row.getIsSelected() && remembered.get(row.id) !== row.original) {
      next ??= new Map(remembered);
      next.set(row.id, row.original);
    }
  }
  for (const id of remembered.keys()) {
    if (!rowSelection[id]) {
      next ??= new Map(remembered);
      next.delete(id);
    }
  }
  return next ?? remembered;
}

/**
 * The admin list table: toolbar, sticky header, virtualised body, footer.
 *
 * This file is the orchestrator — state, the table instance and the body's
 * rows. Everything with a seam of its own lives next to it: the URL state
 * (`useAdminTableState`), the two data modes (`useAdminTableData`), column
 * geometry (`column-layout`), the cells (`head-cell`, `body-cells`) and the
 * chrome (`AdminTableToolbar`, `AdminTableMobileList`, the `DataPagination` footer).
 */
export function DataTable<TData>({
  queryKey,
  queryFn,
  rows,
  isLoading = false,
  columns,
  searchPlaceholder,
  emptyMessage,
  onRowClick,
  onRowDoubleClick,
  commands,
  initialPageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  filterKey,
  initialSort,
  filters: controlledFilters,
  onFiltersChange,
  getRowId,
  enableRowSelection,
  bulkActions,
  renderExpanded,
  groupRows,
  groupsCollapsed,
  groupBy,
  columnsStorageKey,
  paging = "pages",
  pageHotkeys,
  rowUnit,
  cellAlign = "middle",
  toolbar,
  toolbarLead,
  summary,
  inspectorId,
  onPageRowsChange,
  renderMobileCard,
  framed = true
}: Readonly<DataTableProps<TData>>) {
  const t = useTranslations("adminKit.dataTable");
  const tTable = useTranslations("adminKit.table");
  const isClientMode = rows !== undefined;
  // Server mode has no accumulating query to grow, so it always paginates.
  const isInfinite = isClientMode && paging === "infinite";
  // Every row at once: the caller already holds the whole pool and wants no
  // batching UI over it.
  const showAll = isClientMode && paging === "all";
  // A screen that fixed no page size gets one fitted to the viewport ("Auto").
  const fitsViewport = initialPageSize === undefined && !isInfinite && !showAll;
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const searchInputId = useId();
  const rowHintId = useId();

  const {
    searchValue,
    setSearchValue,
    debouncedSearchValue,
    currentPage,
    setCurrentPage,
    pageSize: chosenPageSize,
    setPageSize,
    refitPage,
    sorting,
    setSorting,
    sortField,
    sortDir,
    filters,
    setFilters,
    serializedFilters
  } = useAdminTableState({
    columns,
    pathname,
    initialPageSize: fitsViewport ? null : initialPageSize ?? DEFAULT_PAGE_SIZE,
    initialSort,
    filterKey,
    filters: controlledFilters,
    onFiltersChange
  });

  // Per-user preferences are per screen, falling back to the route when the
  // screen gave no key.
  // ponytail: two tables on one route without `columnsStorageKey` share prefs.
  const prefsKey = columnsStorageKey ?? `admin-table:${pathname}`;
  const {
    density,
    setDensity,
    pageHotkeys: pageHotkeysOn,
    setPageHotkeys,
    columnSizing,
    setColumnSizing,
    columnOrder,
    setColumnOrder
  } = useTablePreferences(prefsKey, columns);
  // Only the desktop table is fitted: a phone's card list has no box to fill.
  const autoFit = chosenPageSize === null && !isMobile;
  const { scrollElement, scrollRef, tableRef, cardRef, fittedRows } = useTableScrollBox({
    fill: autoFit,
    rowEstimate: ROW_HEIGHT_ESTIMATE[density],
    onRefit: refitPage
  });
  const pageSize =
    chosenPageSize ?? (autoFit ? fittedRows : null) ?? initialPageSize ?? DEFAULT_PAGE_SIZE;
  const [toolbarRef, narrowToolbar] = useNarrowToolbar();

  const { data, clientRows, isInitialLoading, isRefreshing, isPageLoading } = useAdminTableData({
    queryKey,
    queryFn,
    rows,
    columns,
    isClientMode,
    isLoading,
    page: currentPage,
    search: debouncedSearchValue,
    pageSize,
    pageSizeReady: !autoFit || fittedRows !== undefined,
    sortField,
    sortDir,
    filters
  });
  // Reported from the query's result, not from inside `queryFn`: a page served
  // from the cache never runs the fetch, and the screen's inspector would be
  // left holding the rows of whatever page was fetched last.
  const reportPageRows = useEffectEvent((page: typeof data) =>
    onPageRowsChange?.(page.results, page)
  );
  useEffect(() => {
    if (!isClientMode) reportPageRows(data);
  }, [isClientMode, data]);

  const pickerColumns = columns
    .map((column) => {
      const meta = readColumnMeta<TData>(column.meta);
      return {
        id: columnDefId(column),
        label: column.header as React.ReactNode,
        category: meta.category,
        defaultVisible: !meta.defaultHidden,
        mandatory: meta.mandatory === true
      };
    })
    .filter(
      (column): column is PickerColumn => Boolean(column.id) && column.category !== undefined
    );
  const { visibility, toggleColumn, setVisibility, resetToDefaults } = useColumnVisibility(
    columnsStorageKey ?? null,
    pickerColumns
  );

  const { table, rowSelection, setRowSelection } = useAdminTable({
    columns,
    data: isClientMode ? clientRows : data.results ?? [],
    getRowId,
    enableRowSelection,
    renderExpanded,
    isClientMode,
    showAll,
    isInfinite,
    rowCount: data.total ?? 0,
    page: currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    filters,
    sorting,
    setSorting,
    columnSizing,
    setColumnSizing,
    columnOrder,
    visibility
  });

  const clientFilteredCount = isClientMode ? table.getFilteredRowModel().rows.length : 0;
  const safeTotal = isClientMode
    ? clientFilteredCount
    : Number.isFinite(data.total)
      ? data.total
      : 0;
  const responsePageSize =
    !isClientMode && Number.isFinite(data.per_page) ? data.per_page : undefined;
  const effectivePageSize = responsePageSize && responsePageSize > 0 ? responsePageSize : pageSize;
  // A fitted size is not a choice: it stays out of the list, under "Auto".
  const availablePageSizeOptions = Array.from(
    new Set(chosenPageSize === null ? pageSizeOptions : [...pageSizeOptions, effectivePageSize])
  ).sort((a, b) => a - b);
  const totalPageCount = Math.max(1, Math.ceil(safeTotal / effectivePageSize));
  const rangeStart = safeTotal > 0 ? (currentPage - 1) * effectivePageSize + 1 : 0;
  const rangeEnd = safeTotal > 0 ? Math.min(currentPage * effectivePageSize, safeTotal) : 0;
  const pageRows = table.getRowModel().rows;
  // Server mode only holds the current page, so a row selected two pages back
  // would vanish from `bulkActions` while its checkbox state lived on. Remember
  // every selected row's data as it passes through; forget it when deselected.
  // Adjusted during render: the map only changes when the selection or a
  // selected row's data does, so the re-render it triggers settles at once.
  const [rememberedSelection, setRememberedSelection] = useState<ReadonlyMap<string, TData>>(
    () => new Map()
  );
  const selection = rememberSelection(rememberedSelection, pageRows, rowSelection);
  if (selection !== rememberedSelection) setRememberedSelection(selection);
  const selectedData = [...selection.values()];
  const selectedOnPage = pageRows.filter((row) => row.getIsSelected()).length;
  const gestures = useRowSelectionGestures(table, Boolean(enableRowSelection));
  const selectableRows = enableRowSelection ? pageRows.filter((row) => row.getCanSelect()) : [];

  useEffect(() => {
    // Not before the first page: with no total yet a deep link's `?page=4` would be clamped to 1.
    if (!isInitialLoading && currentPage > totalPageCount) {
      setCurrentPage(totalPageCount);
    }
  }, [isInitialLoading, currentPage, totalPageCount]);

  const paged = !isInfinite && !showAll;
  const hotkeys =
    paged && pageHotkeys !== false && pageHotkeysOn
      ? { ...DEFAULT_PAGE_HOTKEYS, ...pageHotkeys }
      : false;
  // A new page starts at its top: the scroll box's, and the card's too when the window has scrolled
  // it (partly) out of view — under the sticky app header its `scroll-margin-top` clears.
  const goToPage = (page: number) => {
    setCurrentPage(page);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const card = cardRef.current;
    if (
      card &&
      card.getBoundingClientRect().top < parseFloat(getComputedStyle(card).scrollMarginTop)
    ) {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }
  };

  const rowClickTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (rowClickTimeoutRef.current !== null) window.clearTimeout(rowClickTimeoutRef.current);
    };
  }, []);

  const [focusedRowId, setFocusedRowId] = useState<string | null>(null);
  // Groups the reader clicked, by key: each is the opposite of `groupsCollapsed`.
  const [toggledGroups, setToggledGroups] = useState<ReadonlySet<string>>(() => new Set());
  const toggleGroup = (key: string) =>
    setToggledGroups((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const hasRowAction = Boolean(onRowClick || onRowDoubleClick);
  const hasLeadingColumn = Boolean(enableRowSelection || renderExpanded);
  const visibleLeafColumns = table.getVisibleLeafColumns();
  // Resizing commits once, on release (`columnResizeMode: "onEnd"`); mid-drag
  // the width lives in `columnSizingInfo`. Folding it in redraws the columns
  // as the handle moves, the same way TanStack will commit them.
  const { columnSizingStart, deltaPercentage } = table.getState().columnSizingInfo;
  const liveColumnSizing = useMemo(() => {
    if (deltaPercentage === null) return columnSizing;
    const live = { ...columnSizing };
    for (const [id, size] of columnSizingStart) live[id] = size + size * deltaPercentage;
    return live;
  }, [columnSizing, columnSizingStart, deltaPercentage]);
  // The body rows are memoised and compare it by identity.
  const layout = useMemo(
    () =>
      buildColumnLayout({
        visibleColumns: visibleLeafColumns,
        columns,
        columnSizing: liveColumnSizing,
        hasLeadingColumn,
        density
      }),
    [visibleLeafColumns, columns, liveColumnSizing, hasLeadingColumn, density]
  );
  const { visibleColumns, bodyColumnCount } = layout;

  const { bodyItems, virtualize, virtualizer, virtualItems, padTop, padBottom, firstRowId } =
    useVirtualBody({
      pageRows,
      groupRows,
      groupsCollapsed,
      toggledGroups,
      hasExpandedDetail: Boolean(renderExpanded),
      isMobile,
      density,
      scrollElement
    });
  // Roving tabindex: one row is in the Tab order, arrows move between the rest.
  // Only the two rows whose `tabbable` flips repaint when focus moves.
  // A row folded away with its group is not on screen to take the Tab stop.
  const tabbableRowId =
    focusedRowId !== null &&
    bodyItems.some((item) => item.kind === "row" && item.row.id === focusedRowId)
      ? focusedRowId
      : firstRowId;

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
    // A sweep, Ctrl+click or Shift+click ends in a click too; that one selected, it does not open.
    if (gestures.consumeClick()) return;
    if (!onRowClick) return;
    if (isInteractiveRowTarget(event.target as HTMLElement)) return;

    if (onRowDoubleClick) {
      if (rowClickTimeoutRef.current !== null) window.clearTimeout(rowClickTimeoutRef.current);
      rowClickTimeoutRef.current = window.setTimeout(() => {
        onRowClick(row);
        rowClickTimeoutRef.current = null;
      }, 200);
      return;
    }
    onRowClick(row);
  };

  const handleRowDoubleClick = (event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
    if (!onRowDoubleClick) return;
    if (isInteractiveRowTarget(event.target as HTMLElement)) return;
    if (rowClickTimeoutRef.current !== null) {
      window.clearTimeout(rowClickTimeoutRef.current);
      rowClickTimeoutRef.current = null;
    }
    onRowDoubleClick(row);
  };

  // The memoised rows all hold this one object for the table's lifetime; it
  // forwards to whichever handlers the latest render made.
  const latestRef = useRef({ handleRowClick, handleRowDoubleClick, gestures });
  // Refreshed after commit, before any event can reach a row.
  useLayoutEffect(() => {
    latestRef.current = { handleRowClick, handleRowDoubleClick, gestures };
  });
  const [rowHandlers] = useState<RowHandlers<TData>>(() => ({
    click: (event, row) => latestRef.current.handleRowClick(event, row),
    doubleClick: (event, row) => latestRef.current.handleRowDoubleClick(event, row),
    focus: setFocusedRowId,
    pointerDown: (event, row) => latestRef.current.gestures.rowPointerDown(row)(event),
    checkboxPointerDown: (event, row) => latestRef.current.gestures.checkboxPointerDown(row)(event),
    checkboxClick: (event) => latestRef.current.gestures.checkboxClick(event)
  }));

  /** Arrow/Space/Escape/Ctrl+A go to the selection gestures; Enter (and Space without selection) opens the row. */
  const handleBodyKeyDown = (event: React.KeyboardEvent<HTMLTableSectionElement>) => {
    if (gestures.bodyKeyDown(event)) return;
    if (!onRowClick) return;
    const target = event.target as HTMLElement;
    if (target.dataset.rowId === undefined) return;
    const row = table.getRowModel().rowsById[target.dataset.rowId];
    if (row && (event.key === "Enter" || (event.key === " " && !enableRowSelection))) {
      event.preventDefault();
      onRowClick(row);
    }
  };

  // Column drag-to-reorder. Only the header row is sortable; the actions
  // column keeps its place at the right edge. `@dnd-kit` is fetched when a
  // pointer first reaches the table (see `armColumnDnd`), not shipped with it,
  // so a list page that is only read never downloads it.
  const [columnDnd, setColumnDnd] = useState<ColumnDndModule | null>(null);
  const columnDndRequestedRef = useRef(false);
  const armColumnDnd = () => {
    if (columnDndRequestedRef.current) return;
    columnDndRequestedRef.current = true;
    void import("./ColumnDnd.js").then(setColumnDnd);
  };
  // dnd-kit's `arrayMove`: drop the dragged id, reinsert it at the index the
  // drop target holds in the order it was dragged from.
  const handleColumnReorder = (activeId: string, overId: string) => {
    const next = columnOrder.filter((id) => id !== activeId);
    next.splice(columnOrder.indexOf(overId), 0, activeId);
    setColumnOrder(next);
  };

  /** Selected rows when there are any, else the whole current view (every filtered row in client mode). */
  const exportCsv = () => {
    const exportColumns = visibleColumns.filter((column) => column.id !== ADMIN_ACTION_COLUMN_ID);
    const source = isClientMode ? table.getFilteredRowModel().rows : pageRows;
    const exportRows =
      selectedData.length > 0 ? source.filter((row) => row.getIsSelected()) : source;
    downloadCsv(pathname.split("/").filter(Boolean).pop() ?? "export", [
      exportColumns.map((column) =>
        typeof column.columnDef.header === "string" ? column.columnDef.header : column.id
      ),
      ...exportRows.map((row) => exportColumns.map((column) => row.getValue(column.id)))
    ]);
  };

  // Right-click / long-press menu mirrors the kebab column, when a screen has one.
  const rowActions = columns
    .map((column) => readColumnMeta<TData>(column.meta).rowActions)
    .find(Boolean);
  // Only cells left on TanStack's default renderer get search highlighting.
  const customCellIds = useMemo(
    () => new Set(columns.filter((column) => column.cell !== undefined).map(columnDefId)),
    [columns]
  );
  const sharedRowProps: SharedRowProps<TData> = {
    layout,
    cellPadding: density === "compact" ? "h-9 py-1" : "py-2",
    cellAlign,
    search: debouncedSearchValue,
    customCellIds,
    hasLeadingColumn,
    enableRowSelection: Boolean(enableRowSelection),
    hasExpandedDetail: Boolean(renderExpanded),
    hasRowAction,
    rowHintId,
    rowTitle: onRowDoubleClick ? t("doubleClickHint") : undefined,
    handlers: rowHandlers
  };
  const bodyItemContext = {
    shared: sharedRowProps,
    inspectorId,
    tabbableRowId,
    renderExpanded,
    measureElement: virtualizer.measureElement,
    onToggleGroup: toggleGroup
  };

  /**
   * The built-in search box stays unless a `toolbar` was handed in without a
   * `searchPlaceholder`: that is a screen whose server does not search.
   */
  const showSearch = searchPlaceholder !== undefined || toolbar === undefined;
  const searchLabel = searchPlaceholder ?? t("search");
  const resolvedEmptyMessage = emptyMessage ?? t("noRecords");

  const emptyState = (
    <AdminTableEmptyState
      message={resolvedEmptyMessage}
      hasSearch={Boolean(searchValue)}
      hasFilters={Boolean(serializedFilters)}
      onClear={() => {
        setSearchValue("");
        setFilters({});
      }}
    />
  );

  const offPageSelected = selectedData.length - selectedOnPage;
  const clearSelection = () => setRowSelection({});

  // "Select all N": the whole page is selected and more rows match the current view. Every
  // matching row is fetched (pages of 500) into the selection, so `bulkActions` keeps receiving
  // plain rows and needs no all-matching mode of its own.
  const describeError = useDescribeError();
  const [selectingAll, setSelectingAll] = useState(false);
  const canSelectAll =
    !isClientMode &&
    Boolean(queryFn && getRowId) &&
    selectableRows.length > 0 &&
    selectedOnPage === selectableRows.length &&
    safeTotal > selectedData.length;
  const selectAllMatching = async () => {
    if (!queryFn || !getRowId) return;
    setSelectingAll(true);
    try {
      const all = await fetchAllPages((page, size) =>
        queryFn(page, debouncedSearchValue, size, sortField, sortDir, filters)
      );
      setRememberedSelection(new Map(all.map((row) => [getRowId(row), row])));
      setRowSelection(Object.fromEntries(all.map((row) => [getRowId(row), true])));
    } catch (error) {
      toast.error(describeError(error).message);
    } finally {
      setSelectingAll(false);
    }
  };

  return (
    <Card
      ref={cardRef}
      // A list screen's mark: the app shell lets a page holding a fitted table use the full width.
      data-fitted={fitsViewport || undefined}
      className={cn(
        "scroll-mt-16 gap-0 overflow-hidden py-0",
        // The pinned cells' opaque surface (`STICKY_CELL_CLASS`): the card they sit in.
        framed
          ? "shadow-surface [--admin-sticky-bg:var(--color-card)]"
          : "rounded-none border-0 border-t bg-transparent shadow-none [--admin-sticky-bg:var(--color-card)]"
      )}
    >
      {toolbarLead ? <div className="px-4 pt-3">{toolbarLead}</div> : null}
      <AdminTableToolbar
        ref={toolbarRef}
        narrow={narrowToolbar}
        showSearch={showSearch}
        searchInputId={searchInputId}
        searchLabel={searchLabel}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        filters={toolbar}
        isRefreshing={isRefreshing}
        commands={(commands ?? []).filter((command) => !command.hidden)}
        view={{
          selectedCount: selectedData.length,
          onExportCsv: exportCsv,
          canExport: pageRows.length > 0,
          // Cards have no row density.
          density: isMobile ? undefined : density,
          onToggleDensity: () => setDensity(density === "compact" ? "comfortable" : "compact"),
          pageHotkeys: paged && pageHotkeys !== false ? pageHotkeysOn : undefined,
          onTogglePageHotkeys: () => setPageHotkeys(!pageHotkeysOn),
          prefsKey,
          visibility,
          onVisibilityChange: setVisibility,
          // A phone's cards are built from the first visible columns, so the picker stays there only
          // while no `renderMobileCard` replaces them.
          pickerColumns:
            columnsStorageKey && !(isMobile && renderMobileCard) ? pickerColumns : undefined,
          onToggleColumn: toggleColumn,
          onResetColumns: resetToDefaults,
          groupBy,
          // Cards have no header to sort from.
          sort: isMobile
            ? {
                columns: table
                  .getLeafHeaders()
                  .filter((header) => header.column.getCanSort())
                  .map((header) => ({
                    id: header.column.id,
                    label: flexRender(header.column.columnDef.header, header.getContext())
                  })),
                value: sorting[0],
                onChange: (next) => setSorting([next])
              }
            : undefined
        }}
      />

      {/* ── TABLE ───────────────────────────────────────── */}
      {/* The previous result's rows, dimmed while the new page loads. */}
      <div
        aria-busy={isPageLoading || undefined}
        className="transition-opacity duration-150 aria-busy:opacity-60"
      >
        <p id={rowHintId} className="sr-only">
          {t("rowHint", {
            select: enableRowSelection ? "yes" : "no",
            open: onRowClick ? "yes" : "no"
          })}
        </p>
        {isMobile ? (
          pageRows.length > 0 ? (
            <AdminTableMobileList
              items={bodyItems}
              visibleColumns={visibleColumns}
              renderMobileCard={renderMobileCard}
              inspectorId={inspectorId}
              onRowClick={onRowClick}
              onToggleGroup={toggleGroup}
            />
          ) : (
            <div className="py-8 text-center">{emptyState}</div>
          )
        ) : (
          // The table scrolls in its own box so the header can stick and the
          // body can be virtualised; the box's height is measured to fill the
          // viewport (see `useTableScrollBox`).
          <Table
            ref={tableRef}
            className="min-w-full border-separate border-spacing-0 [&_tbody>tr:not(:last-child)>td]:border-b [&_tbody>tr>td]:border-border/70"
            // A pointer reaching the table is the warning a column drag gives:
            // the reorder chunk is fetched then, usually before the header is hit.
            onPointerEnter={armColumnDnd}
          >
            <AdminTableHeader
              table={table}
              layout={layout}
              density={density}
              sorting={sorting}
              isClientMode={isClientMode}
              hasLeadingColumn={hasLeadingColumn}
              enableRowSelection={Boolean(enableRowSelection)}
              selectableRows={selectableRows}
              columnDnd={columnDnd}
              onReorder={handleColumnReorder}
              onArmDnd={armColumnDnd}
            />
            <AdminRowContextMenu table={table} rowActions={rowActions}>
              <TableBody onKeyDown={handleBodyKeyDown}>
                {bodyItems.length === 0 && isInitialLoading ? (
                  // The first load draws rows, not "nothing here": the empty
                  // state is a fact about the data, and there is no data yet.
                  Array.from({ length: 5 }, (_, index) => (
                    <TableRow key={`skeleton-${index}`} aria-hidden>
                      {Array.from({ length: bodyColumnCount }, (_, cell) => (
                        <TableCell key={cell} className="py-3">
                          <Skeleton className="h-4 w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : bodyItems.length === 0 ? (
                  // Not a row: right-click keeps the browser's menu instead of the row menu.
                  <TableRow onContextMenu={(event) => event.stopPropagation()}>
                    <TableCell colSpan={bodyColumnCount} className="py-8 text-center">
                      {emptyState}
                    </TableCell>
                  </TableRow>
                ) : virtualize ? (
                  <>
                    {padTop > 0 ? <tr aria-hidden style={{ height: padTop }} /> : null}
                    {virtualItems.map((virtual) =>
                      renderBodyItem(bodyItems[virtual.index], bodyItemContext, virtual)
                    )}
                    {padBottom > 0 ? <tr aria-hidden style={{ height: padBottom }} /> : null}
                  </>
                ) : (
                  bodyItems.map((item) => renderBodyItem(item, bodyItemContext))
                )}
                {safeTotal > 0 && isInfinite ? (
                  // Inside the scroll box, where the sentinel is only in view once
                  // the user has actually reached the bottom of the loaded rows.
                  <TableRow
                    className="hover:bg-transparent"
                    onContextMenu={(event) => event.stopPropagation()}
                  >
                    <TableCell
                      colSpan={bodyColumnCount}
                      className="border-t border-border/40 px-4 py-3"
                    >
                      <InfiniteScrollFooter
                        root={scrollElement}
                        loaded={pageRows.length}
                        total={safeTotal}
                        unit={rowUnit}
                        hasNextPage={pageRows.length < safeTotal}
                        // Client mode already holds every row, so a batch appears in
                        // the same commit — there is no in-flight page to report.
                        isFetchingNextPage={false}
                        fetchNextPage={() => setCurrentPage(currentPage + 1)}
                      />
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </AdminRowContextMenu>
          </Table>
        )}
      </div>

      {/* A fitted table keeps its footer while the first page loads: the fit measures it before the first request. */}
      {(safeTotal > 0 || (autoFit && isInitialLoading)) && paged ? (
        <DataPagination
          page={currentPage}
          totalPages={totalPageCount}
          onPageChange={goToPage}
          pending={isPageLoading}
          compact={isMobile}
          hotkeys={hotkeys}
          hotkeyScope={cardRef}
          className="border-t border-border px-4 py-2.5"
          // One page: the count and the page size stay (a larger page is how a
          // reader gets back a split list); only the pager goes.
          leading={
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {safeTotal > 0 ? (
                <span className="tabular-nums">
                  {tTable("range", { start: rangeStart, end: rangeEnd, total: safeTotal })}
                </span>
              ) : null}
              <div className="flex items-center gap-1.5">
                <span>{tTable("rows")}</span>
                <Select
                  value={chosenPageSize === null ? AUTO_PAGE_SIZE : String(effectivePageSize)}
                  onValueChange={(value) => {
                    setCurrentPage(1);
                    setPageSize(value === AUTO_PAGE_SIZE ? null : Number(value));
                  }}
                >
                  <SelectTrigger
                    aria-label={tTable("rowsPerPage")}
                    size="sm"
                    className="w-auto gap-1 px-2.5 tabular-nums"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fitsViewport ? (
                      <SelectItem value={AUTO_PAGE_SIZE}>{tTable("rowsAuto")}</SelectItem>
                    ) : null}
                    {availablePageSizeOptions.map((option) => (
                      <SelectItem key={option} value={String(option)} className="tabular-nums">
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {summary ? <span>{summary}</span> : null}
            </div>
          }
        />
      ) : summary ? (
        <div className="border-t border-border px-4 py-2.5 text-label text-[color:var(--color-muted-foreground)]">
          {summary}
        </div>
      ) : null}

      {bulkActions && selectedData.length > 0 ? (
        <BulkBar
          count={selectedData.length}
          offPage={offPageSelected}
          onClear={clearSelection}
          selectAll={
            canSelectAll || selectingAll
              ? { total: safeTotal, pending: selectingAll, onSelect: () => void selectAllMatching() }
              : undefined
          }
        >
          {bulkActions(selectedData, clearSelection)}
        </BulkBar>
      ) : null}
    </Card>
  );
}
