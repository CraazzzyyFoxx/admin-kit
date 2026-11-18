"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, CornerDownLeft, MoreHorizontal } from "lucide-react";
import { useTranslations } from "../lib/intl.js";

import { Button } from "./button.js";
import { IconTooltip } from "./icon-tooltip.js";
import { Input } from "./input.js";
import { Popover, PopoverContent, PopoverTrigger } from "./popover.js";
import { Spinner } from "./spinner.js";
import { cn } from "../lib/utils.js";

/**
 * The page list, `null` marking a gap: every page up to seven, then always
 * seven slots — first, a gap or page 2, the current page with a neighbour
 * each side, a gap or the second-to-last, last. A constant count keeps the
 * row's width, so the arrows stay under the pointer while paging. The
 * three-wide window slides inward at the ends, so a gap always hides at least
 * two pages: a lone hidden page fits the same slot and is shown instead.
 */
export function buildPageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.min(Math.max(current - 1, 3), total - 4);
  const end = start + 2;
  return [
    1,
    start > 3 ? null : 2,
    start,
    start + 1,
    end,
    end < total - 2 ? null : total - 1,
    total
  ];
}

/**
 * Keyboard paging, each a `KeyboardEvent.code` with an optional `Shift+`. The
 * physical key, not the character: `[` types "х" on a Russian layout.
 */
export interface PageHotkeys {
  prev: string;
  next: string;
  first: string;
  last: string;
}

export const DEFAULT_PAGE_HOTKEYS: PageHotkeys = {
  prev: "BracketLeft",
  next: "BracketRight",
  first: "Shift+BracketLeft",
  last: "Shift+BracketRight"
};

const KEY_LABELS: Record<string, string> = {
  BracketLeft: "[",
  BracketRight: "]",
  Comma: ",",
  Period: ".",
  Slash: "/",
  Semicolon: ";",
  Quote: "'",
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  ArrowLeft: "←",
  ArrowRight: "→",
  ArrowUp: "↑",
  ArrowDown: "↓"
};

/** `Shift+BracketLeft` → `Shift+[`: the tooltip's hint and `aria-keyshortcuts`. */
export function hotkeyLabel(hotkey: string): string {
  return hotkey
    .split("+")
    .map((part) => KEY_LABELS[part] ?? part.replace(/^(Key|Digit)/, ""))
    .join("+");
}

function matchesHotkey(hotkey: string, event: KeyboardEvent): boolean {
  const shift = hotkey.startsWith("Shift+");
  return (
    event.shiftKey === shift && event.code === (shift ? hotkey.slice("Shift+".length) : hotkey)
  );
}

/** Typing, a chord, a held key, or focus in an open dialog or menu: the key is not a page turn. */
function ignoresHotkey(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey) {
    return true;
  }
  const target = event.target;
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest(
        "input, textarea, select, [role=dialog], [role=alertdialog], [role=menu], [role=listbox]"
      ) !== null)
  );
}

/** Pagers listening for hotkeys. With more than one, only the one whose scope holds focus answers. */
const hotkeyPagers = new Set<object>();

/** A typed page clamped into range; `null` when it is not a number. */
function parsePage(raw: string, total: number): number | null {
  const page = Number.parseInt(raw, 10);
  return Number.isNaN(page) ? null : Math.min(Math.max(page, 1), total);
}

/** Every slot a 32px square (wider only past three digits), so the row keeps its width from page to page. */
const SLOT_CLASS =
  "min-w-8 px-1.5 tabular-nums text-muted-foreground hover:text-foreground aria-disabled:pointer-events-none aria-disabled:opacity-40";
/** The current page: `ChoiceToggle`'s tint for a chosen option, not the primary fill a screen's main command wears. */
const CURRENT_CLASS =
  "border border-primary/40 bg-primary/12 font-semibold text-primary hover:bg-primary/12 hover:text-primary dark:hover:bg-primary/12";

interface PageJumpFormProps {
  page: number;
  totalPages: number;
  onJump: (page: number) => void;
  /** The pager's own field: shows the page, and leaving it jumps too. The popover's starts empty. */
  inline?: boolean;
  inputClassName?: string;
  children?: React.ReactNode;
}

/** "Page [n] of N": Enter (or, inline, leaving the field) goes to the typed page, clamped into range. */
function PageJumpForm({
  page,
  totalPages,
  onJump,
  inline = false,
  inputClassName,
  children
}: Readonly<PageJumpFormProps>) {
  const t = useTranslations("adminKit.pagination");
  const inputId = React.useId();
  const initial = inline ? String(page) : "";
  const [value, setValue] = React.useState(initial);
  // Paged from elsewhere (an arrow, a hotkey): the field follows. Adjusted during render, not in an effect.
  const [shownPage, setShownPage] = React.useState(page);
  if (shownPage !== page) {
    setShownPage(page);
    setValue(initial);
  }

  const commit = () => {
    const next = parsePage(value, totalPages);
    if (next !== null) onJump(next);
    // An unreadable or clamped entry is not left standing in a field that shows the page.
    if (inline) setValue(String(next ?? page));
  };

  return (
    <form
      noValidate
      className="flex items-center gap-2 text-sm text-muted-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        commit();
      }}
    >
      <label htmlFor={inputId}>{t("page")}</label>
      <Input
        id={inputId}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={inline ? commit : undefined}
        inputMode="numeric"
        autoComplete="off"
        placeholder={String(page)}
        className={cn("h-8 w-14 px-2 text-center text-foreground tabular-nums", inputClassName)}
      />
      <span className="whitespace-nowrap tabular-nums">{t("ofTotal", { total: totalPages })}</span>
      {children}
    </form>
  );
}

interface PageJumpProps {
  page: number;
  totalPages: number;
  onJump: (page: number) => void;
  controlsRef: React.RefObject<HTMLDivElement | null>;
}

/** A gap in the page list: opens a field to type any page into. */
function PageJump({ page, totalPages, onJump, controlsRef }: Readonly<PageJumpProps>) {
  const t = useTranslations("adminKit.pagination");
  const [open, setOpen] = React.useState(false);
  const jumped = React.useRef(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("jump")}
          className={SLOT_CLASS}
        >
          <MoreHorizontal aria-hidden />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="w-auto p-2"
        // The gap that opened it may be gone from the new window: focus lands on the page jumped to.
        onCloseAutoFocus={(event) => {
          if (!jumped.current) return;
          jumped.current = false;
          event.preventDefault();
          controlsRef.current?.querySelector<HTMLElement>("[aria-current=page]")?.focus();
        }}
      >
        <PageJumpForm
          page={page}
          totalPages={totalPages}
          onJump={(target) => {
            jumped.current = true;
            setOpen(false);
            onJump(target);
          }}
        >
          <Button type="submit" variant="ghost" size="icon-sm" aria-label={t("go")}>
            <CornerDownLeft aria-hidden />
          </Button>
        </PageJumpForm>
      </PopoverContent>
    </Popover>
  );
}

interface DataPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  /**
   * Content before the page buttons: a "Showing 1–20 of 340" range, a
   * rows-per-page select. Set in the muted label style, and kept when there is
   * only one page.
   */
  leading?: React.ReactNode;
  /** The page's rows are still on their way: the current page shows a spinner. */
  pending?: boolean;
  /** Phone layout: the arrows around a "Page [n] of N" field instead of the page list. */
  compact?: boolean;
  /** Keyboard paging; none when `false` (default). */
  hotkeys?: PageHotkeys | false;
  /**
   * Where focus makes the hotkeys this pager's while another pager listens
   * too — the table it pages. Defaults to the pager's own buttons.
   */
  hotkeyScope?: React.RefObject<HTMLElement | null>;
}

/**
 * The single pagination control for the admin tables. Ghost slots with the
 * current page tinted, gaps that open a jump-to-page field, a live "Page n of
 * N" for screen readers, and optional hotkeys hinted in the arrows' tooltips.
 */
export function DataPagination({
  page,
  totalPages,
  onPageChange,
  className,
  leading,
  pending = false,
  compact = false,
  hotkeys = false,
  hotkeyScope
}: Readonly<DataPaginationProps>) {
  const t = useTranslations("adminKit.pagination");
  const controlsRef = React.useRef<HTMLDivElement>(null);
  const hasControls = totalPages > 1;
  const safePage = Math.min(Math.max(page, 1), totalPages);

  // Clamped; the page on screen is no change, so at either end an arrow or a hotkey does nothing.
  const goTo = (target: number) => {
    const next = Math.min(Math.max(target, 1), totalPages);
    if (next !== safePage) onPageChange(next);
  };

  const onHotkey = React.useEffectEvent((event: KeyboardEvent) => {
    if (!hotkeys) return;
    const target = matchesHotkey(hotkeys.prev, event)
      ? safePage - 1
      : matchesHotkey(hotkeys.next, event)
        ? safePage + 1
        : matchesHotkey(hotkeys.first, event)
          ? 1
          : matchesHotkey(hotkeys.last, event)
            ? totalPages
            : null;
    if (target === null) return;
    event.preventDefault();
    goTo(target);
  });
  const listening = hasControls && hotkeys !== false;
  React.useEffect(() => {
    if (!listening) return;
    const pager = {};
    hotkeyPagers.add(pager);
    const onKeyDown = (event: KeyboardEvent) => {
      if (ignoresHotkey(event)) return;
      const scope = hotkeyScope?.current ?? controlsRef.current;
      if (hotkeyPagers.size > 1 && !scope?.contains(document.activeElement)) return;
      onHotkey(event);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      hotkeyPagers.delete(pager);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [listening, hotkeyScope]);

  if (!hasControls && !leading) return null;

  // One shell for both branches, so a lone summary keeps the muted label style it has beside the buttons.
  const Shell = hasControls ? "nav" : "div";

  const arrow = (direction: "previous" | "next") => {
    const hotkey = hotkeys ? (direction === "previous" ? hotkeys.prev : hotkeys.next) : null;
    const atEdge = direction === "previous" ? safePage <= 1 : safePage >= totalPages;
    const button = (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className={cn(SLOT_CLASS, compact && "size-10")}
        // Not `disabled`: that drops the focus of a keyboard user who has just paged to the end.
        aria-disabled={atEdge || undefined}
        aria-label={t(direction)}
        aria-keyshortcuts={hotkey ? hotkeyLabel(hotkey) : undefined}
        onClick={() => goTo(direction === "previous" ? safePage - 1 : safePage + 1)}
      >
        {direction === "previous" ? <ChevronLeft aria-hidden /> : <ChevronRight aria-hidden />}
      </Button>
    );
    return hotkey ? (
      <IconTooltip
        control
        label={t(direction)}
        hint={<kbd className="font-mono">{hotkeyLabel(hotkey)}</kbd>}
      >
        {button}
      </IconTooltip>
    ) : (
      button
    );
  };

  const edgeShortcut = (entry: number) =>
    !hotkeys
      ? undefined
      : entry === 1
        ? hotkeyLabel(hotkeys.first)
        : entry === totalPages
          ? hotkeyLabel(hotkeys.last)
          : undefined;

  return (
    <Shell
      aria-label={hasControls ? t("label") : undefined}
      className={cn("flex flex-wrap items-center gap-3", className)}
    >
      {leading ? (
        <div className="text-label text-admin-dim">{leading}</div>
      ) : null}
      {hasControls ? (
        <div
          ref={controlsRef}
          className={cn("flex items-center gap-1", compact ? "w-full justify-between" : "ms-auto")}
        >
          {arrow("previous")}
          {compact ? (
            <PageJumpForm
              inline
              page={safePage}
              totalPages={totalPages}
              onJump={goTo}
              inputClassName="h-10"
            />
          ) : (
            buildPageWindow(safePage, totalPages).map((entry, index) =>
              entry === null ? (
                <PageJump
                  // A gap is either the window's second slot or its sixth.
                  key={index === 1 ? "gap-start" : "gap-end"}
                  page={safePage}
                  totalPages={totalPages}
                  onJump={goTo}
                  controlsRef={controlsRef}
                />
              ) : (
                <Button
                  key={entry}
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-current={entry === safePage ? "page" : undefined}
                  aria-label={t("goToPage", { page: entry })}
                  aria-keyshortcuts={edgeShortcut(entry)}
                  className={cn(SLOT_CLASS, entry === safePage && CURRENT_CLASS)}
                  onClick={() => goTo(entry)}
                >
                  {pending && entry === safePage ? (
                    <Spinner aria-hidden className="size-3.5" />
                  ) : (
                    entry
                  )}
                </Button>
              )
            )
          )}
          {arrow("next")}
          <span className="sr-only" aria-live="polite">
            {t("status", { page: safePage, total: totalPages })}
          </span>
        </div>
      ) : null}
    </Shell>
  );
}
